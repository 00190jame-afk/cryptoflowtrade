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

    // Update all expired trades to 'lose' status
    const tradeIds = expiredTrades.map(trade => trade.id)
    
    const { data: updatedTrades, error: updateError } = await supabaseClient
      .from('trades')
      .update({
        status: 'lose',
        completed_at: new Date().toISOString(),
        result: 'loss',
        profit_loss_amount: expiredTrades.reduce((acc, trade) => {
          const tradeUpdate = expiredTrades.find(t => t.id === trade.id)
          return acc + (tradeUpdate ? -tradeUpdate.stake_amount : 0)
        }, 0)
      })
      .in('id', tradeIds)
      .select()

    if (updateError) {
      console.error('❌ Error updating expired trades:', updateError)
      throw updateError
    }

    console.log(`✅ Successfully auto-lost ${updatedTrades?.length || 0} trades`)
    
    // Log each trade that was auto-lost
    expiredTrades.forEach(trade => {
      console.log(`💸 Auto-lost trade ${trade.id} for user ${trade.user_id} (${trade.trading_pair}) - Stake: $${trade.stake_amount}`)
    })

    return new Response(
      JSON.stringify({ 
        message: 'Expired trades processed successfully',
        count: updatedTrades?.length || 0,
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