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
      .select('id, user_id, trading_pair, stake_amount, entry_price, leverage, direction')
      .eq('status', 'pending')
      .not('ends_at', 'is', null)
      .lt('ends_at', new Date().toISOString())

    if (fetchError) {
      console.error('❌ Error fetching expired trades:', fetchError)
      throw fetchError
    }

    if (!expiredTrades || expiredTrades.length === 0) {
      console.log('✅ No expired trades found')
      return new Response(
        JSON.stringify({ message: 'No expired trades found', count: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`📊 Found ${expiredTrades.length} expired trades to auto-lose`)

    let processed = 0
    for (const trade of expiredTrades) {
      try {
        // Fetch related positions (if any)
        const { data: positions } = await supabaseClient
          .from('positions_orders')
          .select('*')
          .eq('trade_id', trade.id)

        const realizedLoss = -Math.abs(trade.stake_amount)

        // 1) Update trade to lose with per-row loss
        const { error: updErr } = await supabaseClient
          .from('trades')
          .update({
            status: 'lose',
            completed_at: new Date().toISOString(),
            result: 'loss',
            profit_loss_amount: realizedLoss
          })
          .eq('id', trade.id)
        if (updErr) throw updErr

        // 2) Create closing orders and remove positions
        if (positions && positions.length > 0) {
          for (const p of positions) {
            const exit = p.mark_price ?? p.entry_price
            const closing = {
              user_id: p.user_id,
              symbol: p.symbol,
              side: p.side,
              entry_price: p.entry_price,
              exit_price: exit,
              quantity: p.quantity,
              leverage: p.leverage,
              realized_pnl: -Math.abs(p.stake ?? trade.stake_amount),
              original_trade_id: trade.id,
              scale: p.scale ?? null,
              stake: p.stake ?? trade.stake_amount,
            }
            await supabaseClient.from('closing_orders').insert(closing)
          }
          await supabaseClient.from('positions_orders').delete().in('id', positions.map(p => p.id))
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

        console.log(`💸 Auto-lost trade ${trade.id} for user ${trade.user_id} (${trade.trading_pair}) - Stake: $${trade.stake_amount}`)
        processed++
      } catch (e) {
        console.error(`Error processing trade ${trade.id}:`, e)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Expired trades processed successfully',
        count: processed,
        trades: expiredTrades.map(t => ({
          id: t.id,
          trading_pair: t.trading_pair,
          stake_amount: t.stake_amount
        }))
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