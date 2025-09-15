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
          profit_rate: number
        }
        Update: {
          status?: string
          completed_at?: string
          result?: string
          profit_loss_amount?: number
        }
      }
      trade_rules: {
        Row: {
          id: string
          min_stake: number
          max_stake: number
          profit_rate: number
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

    console.log('🔍 Checking for expired trades to auto-lose...')

    // Find all pending trades that have passed their end time (AUTO-LOSE)
    const { data: expiredTrades, error: fetchError } = await supabaseClient
      .from('trades')
      .select('id, user_id, trading_pair, stake_amount, entry_price, leverage, direction, profit_rate')
      .eq('status', 'pending')
      .not('ends_at', 'is', null)
      .lt('ends_at', new Date().toISOString())

    if (fetchError) {
      console.error('❌ Error fetching expired trades:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${expiredTrades?.length ?? 0} expired pending trades to auto-lose`)

    let processedLoses = 0
    for (const trade of expiredTrades ?? []) {
      try {
        const realizedLoss = -Math.abs(trade.stake_amount)

        // Idempotency: if we already created a closing order for this trade, skip inserts
        const { data: existingClose } = await supabaseClient
          .from('closing_orders')
          .select('id')
          .eq('original_trade_id', trade.id)
          .maybeSingle()

        if (!existingClose) {
          // Fetch related positions for this trade
          const { data: positions } = await supabaseClient
            .from('positions_orders')
            .select('*')
            .eq('trade_id', trade.id)

          if (positions && positions.length > 0) {
            for (const p of positions) {
              await supabaseClient.from('closing_orders').insert({
                user_id: p.user_id,
                symbol: p.symbol,
                side: p.side,
                entry_price: p.entry_price,
                exit_price: p.entry_price, // exit at entry for full stake loss
                quantity: p.quantity,
                leverage: p.leverage,
                realized_pnl: -(Number(p.stake ?? trade.stake_amount) || 0),
                original_trade_id: trade.id,
                scale: p.scale ?? null,
                stake: p.stake ?? trade.stake_amount,
              })
            }
          } else {
            // Fallback closing order if no position rows exist
            await supabaseClient.from('closing_orders').insert({
              user_id: trade.user_id,
              symbol: trade.trading_pair,
              side: trade.direction || 'LONG',
              entry_price: trade.entry_price || 0,
              exit_price: trade.entry_price || 0,
              quantity: (trade.stake_amount && trade.entry_price) ? (trade.stake_amount / trade.entry_price) : 0,
              leverage: trade.leverage || 1,
              realized_pnl: realizedLoss,
              original_trade_id: trade.id,
              stake: trade.stake_amount,
            })
          }

          // Remove any open positions tied to this trade
          await supabaseClient
            .from('positions_orders')
            .delete()
            .eq('trade_id', trade.id)
        }

        // Finally, mark the trade as lose (after positions are removed to avoid trigger conflicts)
        const { error: updErr } = await supabaseClient
          .from('trades')
          .update({
            status: 'lose',
            completed_at: new Date().toISOString(),
            result: 'loss',
            profit_loss_amount: realizedLoss,
          })
          .eq('id', trade.id)
        if (updErr) throw updErr

        console.log(`💸 Auto-lost trade ${trade.id} for user ${trade.user_id} (${trade.trading_pair}) - Stake: $${trade.stake_amount}`)
        processedLoses++
      } catch (e) {
        console.error(`Error processing trade ${trade.id}:`, e)
      }
    }

    // Now process COMPLETED WINS (scheduled) - Only finalize after ends_at
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

    console.log(`🏆 Found ${winsToComplete?.length ?? 0} wins to finalize`)

    let processedWins = 0
    for (const trade of winsToComplete ?? []) {
      try {
        // Idempotency: Check if already processed
        const { data: existingClose } = await supabaseClient
          .from('closing_orders')
          .select('id')
          .eq('original_trade_id', trade.id)
          .maybeSingle()

        if (!existingClose) {
          // Fetch related positions for closing orders
          const { data: positions } = await supabaseClient
            .from('positions_orders')
            .select('*')
            .eq('trade_id', trade.id)

          if (positions && positions.length > 0) {
            for (const p of positions) {
              const exit = trade.current_price ?? p.mark_price ?? p.entry_price
              const stakeForPos = p.stake ?? trade.stake_amount
              const profitForPos = Math.round((Number(stakeForPos) * Number(trade.profit_rate) / 100) * 100) / 100
              
              await supabaseClient.from('closing_orders').insert({
                user_id: p.user_id,
                symbol: p.symbol,
                side: p.side,
                entry_price: p.entry_price,
                exit_price: exit,
                quantity: p.quantity,
                leverage: p.leverage,
                realized_pnl: profitForPos,
                original_trade_id: trade.id,
                scale: p.scale ?? null,
                stake: stakeForPos,
              })
            }
            // Remove positions after creating closing orders
            await supabaseClient.from('positions_orders').delete().in('id', positions.map(p => p.id))
          } else {
            // Fallback closing order if no position rows exist
            const profit = Math.round((Number(trade.stake_amount) * Number(trade.profit_rate) / 100) * 100) / 100
            await supabaseClient.from('closing_orders').insert({
              user_id: trade.user_id,
              symbol: trade.trading_pair,
              side: trade.direction || 'LONG',
              entry_price: trade.entry_price || 0,
              exit_price: trade.entry_price || 0,
              quantity: (trade.stake_amount && trade.entry_price) ? (trade.stake_amount / trade.entry_price) : 0,
              leverage: trade.leverage || 1,
              realized_pnl: profit,
              original_trade_id: trade.id,
              stake: trade.stake_amount,
            })
          }
        }

        const profitAmount = Math.round((Number(trade.stake_amount) * Number(trade.profit_rate) / 100) * 100) / 100
        const totalCredit = Number(trade.stake_amount) + profitAmount

        // Update trade to mark completion
        const { error: updWinErr } = await supabaseClient
          .from('trades')
          .update({
            completed_at: new Date().toISOString(),
            result: 'win',
            profit_loss_amount: profitAmount
          })
          .eq('id', trade.id)
        if (updWinErr) throw updWinErr

        // Credit stake + profit exactly once (idempotency check)
        const { data: existingTx } = await supabaseClient
          .from('transactions')
          .select('id')
          .eq('user_id', trade.user_id)
          .eq('trade_id', trade.id)
          .eq('type', 'deposit')
          .eq('payment_method', 'system_trade')
          .maybeSingle()

        if (!existingTx) {
          // Try RPC first for consistency
          const { error: rpcErr } = await (supabaseClient as any).rpc('update_user_balance', {
            p_user_id: trade.user_id,
            p_amount: totalCredit,
            p_transaction_type: 'system_trade',
            p_description: 'Trade win payout + stake return',
            p_trade_id: trade.id
          })

          if (rpcErr) {
            console.warn('⚠️ RPC update_user_balance failed, falling back to manual credit:', rpcErr?.message)
            // Manual credit fallback
            const { data: balanceRow } = await supabaseClient
              .from('user_balances')
              .select('id, balance')
              .eq('user_id', trade.user_id)
              .maybeSingle()

            if (balanceRow) {
              await supabaseClient
                .from('user_balances')
                .update({ balance: Number(balanceRow.balance ?? 0) + totalCredit, updated_at: new Date().toISOString() })
                .eq('user_id', trade.user_id)
            } else {
              await supabaseClient
                .from('user_balances')
                .insert({ user_id: trade.user_id, balance: totalCredit, currency: 'USDT' })
            }

            await supabaseClient.from('transactions').insert({
              user_id: trade.user_id,
              type: 'deposit',
              amount: totalCredit,
              status: 'completed',
              currency: 'USDT',
              payment_method: 'system_trade',
              description: 'Trade win payout + stake return',
              trade_id: trade.id,
            })
          }
        }

        console.log(`🏆 Finalized WIN trade ${trade.id} for user ${trade.user_id} (${trade.trading_pair}) - Credited $${totalCredit} (stake + profit)`)        
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