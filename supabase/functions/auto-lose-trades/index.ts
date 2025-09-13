import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

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
          direction: string
          stake_amount: number
          leverage: number
          entry_price: number
          profit_rate: number
          status: string
          result: string
          ends_at: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          trading_pair: string
          direction: string
          stake_amount: number
          leverage: number
          entry_price: number
          profit_rate: number
          status?: string
          result?: string
          ends_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          trading_pair?: string
          direction?: string
          stake_amount?: number
          leverage?: number
          entry_price?: number
          profit_rate?: number
          status?: string
          result?: string
          ends_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      positions_orders: {
        Row: {
          id: string
          trade_id: string
        }
        Insert: {
          id?: string
          trade_id: string
        }
        Update: {
          id?: string
          trade_id?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    console.log('Starting auto-lose trades check...')

    // Accept optional direct target trade from request body
    let payload: any = {}
    try {
      payload = await req.json()
    } catch (_) {
      // no body provided, proceed with bulk processing
    }
    const directTradeId = payload?.tradeId as string | undefined

    if (directTradeId) {
      console.log('Direct auto-lose for tradeId from request:', directTradeId)
      const { data: tradeRow, error: tradeFetchErr } = await supabase
        .from('trades')
        .select('id, status')
        .eq('id', directTradeId)
        .maybeSingle()

      if (tradeFetchErr) {
        console.error('Error fetching trade by id:', tradeFetchErr)
      } else if (!tradeRow) {
        console.log('Trade not found, nothing to do:', directTradeId)
      } else if (tradeRow.status === 'active') {
        const { error: updateError } = await supabase
          .from('trades')
          .update({
            status: 'completed',
            result: 'lose',
            profit_loss_amount: 0,
            status_indicator: '⚪️ COMPLETED',
            completed_at: new Date().toISOString()
          })
          .eq('id', directTradeId)
          .eq('status', 'active')

        if (updateError) {
          console.error('Error updating direct trade:', updateError)
        } else {
          const { error: deleteError } = await supabase
            .from('positions_orders')
            .delete()
            .eq('trade_id', directTradeId)
          if (deleteError) {
            console.error('Error deleting positions for direct trade:', deleteError)
          }
        }

        const result = { message: 'Processed direct trade', processed: updateError ? 0 : 1, total: 1 }
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      } else {
        console.log('Trade already not active, skipping:', directTradeId)
        const result = { message: 'Trade not active', processed: 0, total: 1 }
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      }
    }

    // Find trades that have expired and are still active/pending
    const { data: expiredTrades, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('status', 'active')
      .lt('ends_at', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching expired trades:', fetchError)
      throw fetchError
    }

    console.log(`Found ${expiredTrades?.length || 0} expired trades`)

    if (!expiredTrades || expiredTrades.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired trades found', processed: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let processed = 0
    const errors: string[] = []

    // Process each expired trade
    for (const trade of expiredTrades) {
      try {
        console.log(`Processing expired trade: ${trade.id}`)

        // Update trade to completed with lose result and sync indicator
        const { error: updateError } = await supabase
          .from('trades')
          .update({
            status: 'completed',
            result: 'lose',
            profit_loss_amount: 0,
            status_indicator: '⚪️ COMPLETED',
            completed_at: new Date().toISOString()
          })
          .eq('id', trade.id)
          .eq('status', 'active')

        if (updateError) {
          console.error(`Error updating trade ${trade.id}:`, updateError)
          errors.push(`Failed to update trade ${trade.id}: ${updateError.message}`)
          continue
        }

        // Remove associated position orders
        const { error: deleteError } = await supabase
          .from('positions_orders')
          .delete()
          .eq('trade_id', trade.id)

        if (deleteError) {
          console.error(`Error deleting positions for trade ${trade.id}:`, deleteError)
          // Don't treat this as a critical error, just log it
        }

        processed++
        console.log(`Successfully processed trade ${trade.id}`)

      } catch (error) {
        console.error(`Error processing trade ${trade.id}:`, error)
        errors.push(`Failed to process trade ${trade.id}: ${error.message}`)
      }
    }

    const result = {
      message: `Processed ${processed} expired trades`,
      processed,
      total: expiredTrades.length,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('Auto-lose process completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Auto-lose function error:', error)
    
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