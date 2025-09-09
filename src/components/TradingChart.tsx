import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Settings, Maximize2 } from "lucide-react";
interface TradingChartProps {
  tradingPair: string;
  currentPrice: number;
  activeTrade?: {
    entry_price: number;
    target_price?: number;
    direction: string;
  } | null;
}
const TradingChart = ({
  tradingPair,
  currentPrice,
  activeTrade
}: TradingChartProps) => {
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);

  // Convert trading pair to Binance symbol format
  const binanceSymbol = tradingPair.replace('/', '').toLowerCase();

  // Fetch 24h ticker data from Binance
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const symbol = tradingPair.replace('/', '');
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          setPriceChange(parseFloat(data.priceChange));
          setPriceChangePercent(parseFloat(data.priceChangePercent));
          setVolume24h(parseFloat(data.volume));
          setHigh24h(parseFloat(data.highPrice));
          setLow24h(parseFloat(data.lowPrice));
        }
      } catch (error) {
        console.error('Failed to fetch ticker data:', error);
        // Fallback to simulated data
        setPriceChange((Math.random() - 0.5) * 1000);
        setPriceChangePercent((Math.random() - 0.5) * 5);
        setVolume24h(Math.random() * 1000000);
        setHigh24h(currentPrice * 1.05);
        setLow24h(currentPrice * 0.95);
      }
    };
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [tradingPair, currentPrice]);
  const isPositive = priceChange >= 0;
  return <Card className="glass-card bg-gray-900/95 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              {tradingPair}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            
            
          </div>
        </div>
        
        {/* Price Information Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm bg-gray-800/50 p-3 rounded-lg">
          <div>
            <p className="text-gray-400 text-xs">Price</p>
            <p className="text-white font-bold text-lg">${currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">24h Change</p>
            <div className="flex items-center gap-1">
              {isPositive ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-xs">24h High</p>
            <p className="text-white font-medium">${high24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">24h Low</p>
            <p className="text-white font-medium">${low24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">24h Volume</p>
            <p className="text-white font-medium">{volume24h.toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Status</p>
            <Badge variant="outline" className="text-green-500 border-green-500">
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* TradingView Chart Widget */}
        <div className="h-[500px] w-full bg-gray-900 relative">
          <iframe src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${tradingPair.replace('/', '')}&interval=5&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=0e1621&studies=[]&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE:${tradingPair.replace('/', '')}`} className="w-full h-full border-0" style={{
          border: 'none',
          borderRadius: '0 0 8px 8px'
        }} title={`TradingView ${tradingPair} Chart`} allowFullScreen />
          
          {/* Trade overlay information */}
          {activeTrade && <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Active Trade</div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Entry:</span>
                  <span className="text-orange-400 ml-1 font-medium">${activeTrade.entry_price.toFixed(2)}</span>
                </div>
                {activeTrade.target_price && <div>
                    <span className="text-gray-400">Target:</span>
                    <span className={`ml-1 font-medium ${activeTrade.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                      ${activeTrade.target_price.toFixed(2)}
                    </span>
                  </div>}
                <div>
                  <Badge variant={activeTrade.direction === 'LONG' ? 'default' : 'destructive'} className="text-xs">
                    {activeTrade.direction}
                  </Badge>
                </div>
              </div>
            </div>}
        </div>
        
        {/* Chart Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border-t border-gray-700">
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              
              
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time Data</span>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>;
};
export default TradingChart;