import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string
          user_id: string
          trading_pair: string
          status: string
          ends_at: string | null
          stake_amount: number
        }
        Update: {
          status?: string
          completed_at?: string
          result?: string
          profit_loss_amount?: number
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Checking for expired trades...')

    // Find all pending trades that have passed their end time
    const { data: expiredTrades, error: fetchError } = await supabaseClient
      .from('trades')
      .select('id, user_id, trading_pair, stake_amount')
      .eq('status', 'pending')
      .not('ends_at', 'is', null)
      .lt('ends_at', new Date().toISOString())

    if (fetchError) {
      console.error('❌ Error fetching expired trades:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${expiredTrades ? expiredTrades.length : 0} expired pending trades to auto-lose`)

    let processedLoses = 0
    for (const trade of expiredTrades ?? []) {
      try {
        // Simply mark the trade as lose - triggers will handle closing orders
        const { error: updErr } = await supabaseClient
          .from('trades')
          .update({
            status: 'lose',
            completed_at: new Date().toISOString(),
            result: 'loss',
            profit_loss_amount: -Math.abs(trade.stake_amount),
          })
          .eq('id', trade.id)
        
        if (updErr) {
          console.error(`Failed to update trade ${trade.id}:`, updErr)
          continue
        }

        console.log(`💸 Auto-lost trade ${trade.id} for user ${trade.user_id} (${trade.trading_pair}) - Stake: $${trade.stake_amount}`)
        processedLoses++
      } catch (e) {
        console.error(`Error processing trade ${trade.id}:`, e)
      }
    }

    // Now process COMPLETED WINS (scheduled) - using trade_rules for profit rates
    console.log('🔍 Checking for scheduled wins to finalize...')
    const { data: winsToComplete, error: winsErr } = await supabaseClient
      .from('trades')
      .select('id, user_id, trading_pair, stake_amount, profit_rate, entry_price, leverage, direction, current_price')
      .eq('status', 'win')
      .is('completed_at', null)
      .not('ends_at', 'is', null)
      .lt('ends_at', new Date().toISOString())

    if (winsErr) {
      console.error('❌ Error fetching wins to finalize:', winsErr)
      throw winsErr
    }

    let processedWins = 0
    for (const trade of winsToComplete ?? []) {
      try {
        // Idempotency check - don't process if already has closing orders
        const { data: existingClose } = await supabaseClient
          .from('closing_orders')
          .select('id')
          .eq('original_trade_id', trade.id)
          .maybeSingle()

        if (existingClose) {
          console.log(`⏭️ Skipping trade ${trade.id} - already has closing orders`)
          continue
        }

        // Get profit rate from trade_rules based on stake amount
        const { data: tradeRules } = await supabaseClient
          .from('trade_rules')
          .select('profit_rate')
          .lte('min_stake', trade.stake_amount)
          .gte('max_stake', trade.stake_amount)
          .maybeSingle()

        const profitRate = tradeRules?.profit_rate || trade.profit_rate || 20
        const profitAmount = Math.round((Number(trade.stake_amount) * Number(profitRate) / 100) * 100) / 100
        const totalCredit = Number(trade.stake_amount) + profitAmount

        // Fetch and remove positions, create closing orders
        const { data: positions } = await supabaseClient
          .from('positions_orders')
          .select('*')
          .eq('trade_id', trade.id)

        if (positions && positions.length > 0) {
          for (const p of positions) {
            const exit = trade.current_price ?? p.mark_price ?? p.entry_price
            await supabaseClient.from('closing_orders').insert({
              user_id: p.user_id,
              symbol: p.symbol,
              side: p.side,
              entry_price: p.entry_price,
              exit_price: exit,
              quantity: p.quantity,
              leverage: p.leverage,
              realized_pnl: profitAmount,
              original_trade_id: trade.id,
              scale: p.scale ?? null,
              stake: p.stake ?? trade.stake_amount,
            })
          }
          await supabaseClient.from('positions_orders').delete().in('id', positions.map(p => p.id))
        } else {
          // Fallback closing order
          await supabaseClient.from('closing_orders').insert({
            user_id: trade.user_id,
            symbol: trade.trading_pair,
            side: trade.direction || 'LONG',
            entry_price: trade.entry_price || 0,
            exit_price: trade.current_price || trade.entry_price || 0,
            quantity: (trade.stake_amount && trade.entry_price) ? (trade.stake_amount / trade.entry_price) : 0,
            leverage: trade.leverage || 1,
            realized_pnl: profitAmount,
            original_trade_id: trade.id,
            stake: trade.stake_amount,
          })
        }

        // Update trade completion
        const { error: updWinErr } = await supabaseClient
          .from('trades')
          .update({
            completed_at: new Date().toISOString(),
            result: 'win',
            profit_loss_amount: profitAmount
          })
          .eq('id', trade.id)
        if (updWinErr) throw updWinErr

        // Credit stake + profit (idempotency check)
        const { data: existingTx } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('user_id', trade.user_id)
          .eq('trade_id', trade.id)
          .eq('type', 'deposit')
          .eq('payment_method', 'system_trade')
          .maybeSingle()

        if (!existingTx) {
          const { error: rpcErr } = await (supabaseClient as any).rpc('update_user_balance', {
            p_user_id: trade.user_id,
            p_amount: totalCredit,
            p_transaction_type: 'system_trade',
            p_description: `Trade win: ${trade.stake_amount} stake + ${profitAmount} profit (${profitRate}%)`,
            p_trade_id: trade.id
          })

          if (rpcErr) {
            console.warn('⚠️ RPC failed, manual credit:', rpcErr?.message)
            // Manual fallback
            const { data: balanceRow } = await supabaseClient
              .from('user_balances')
              .select('balance')
              .eq('user_id', trade.user_id)
              .maybeSingle()

            const newBalance = Number(balanceRow?.balance ?? 0) + totalCredit
            await supabaseClient
              .from('user_balances')
              .upsert({ 
                user_id: trade.user_id, 
                balance: newBalance, 
                currency: 'USDT' 
              })

            await supabaseClient.from('transactions').insert({
              user_id: trade.user_id,
              type: 'deposit',
              amount: totalCredit,
              status: 'completed',
              currency: 'USDT',
              payment_method: 'system_trade',
              description: `Trade win: ${trade.stake_amount} stake + ${profitAmount} profit (${profitRate}%)`,
              trade_id: trade.id,
            })
          }
        }

        console.log(`🏆 Finalized WIN trade ${trade.id} - Credited $${totalCredit} (${profitRate}% profit rate)`)
        processedWins++
      } catch (e) {
        console.error(`Error finalizing win trade ${trade.id}:`, e)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Expired trades processed successfully',
        losesProcessed: processedLoses,
        winsProcessed: processedWins,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Auto-lose function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})