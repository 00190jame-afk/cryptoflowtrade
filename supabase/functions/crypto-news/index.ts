import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const coinMarketCapApiKey = Deno.env.get('COINMARKETCAP_API_KEY');
    
    if (!coinMarketCapApiKey) {
      console.error('CoinMarketCap API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching crypto news from CoinMarketCap...');

    // Fetch news from CoinMarketCap API
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/content/latest', {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': coinMarketCapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('CoinMarketCap API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch news from CoinMarketCap' }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched news from CoinMarketCap');

    // Transform the data to match our frontend structure
    const transformedNews = data.data?.map((article: any, index: number) => ({
      id: article.id || index + 1,
      category: article.type === 'article' ? 'Market Analysis' : 'News',
      title: article.title || 'Untitled',
      excerpt: article.subtitle || article.title || '',
      timestamp: article.releaseTime ? new Date(article.releaseTime).toLocaleString() : 'Recently',
      readTime: '3 min read',
      trend: index % 3 === 0 ? 'bullish' : 'neutral',
      image: article.cover?.thumbnail || `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop`,
      url: article.sourceUrl || '#',
      source: article.sourceName || 'CoinMarketCap'
    })) || [];

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedNews.slice(0, 20) // Limit to 20 articles
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in crypto-news function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});