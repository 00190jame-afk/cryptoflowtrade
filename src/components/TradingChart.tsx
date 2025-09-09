import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Settings, Maximize2 } from "lucide-react";

interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7: number;
  ma25: number;
  ma99: number;
}

interface TradingChartProps {
  tradingPair: string;
  currentPrice: number;
  activeTrade?: {
    entry_price: number;
    target_price?: number;
    direction: string;
  } | null;
}

const TradingChart = ({ tradingPair, currentPrice, activeTrade }: TradingChartProps) => {
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [timeFrame, setTimeFrame] = useState("1m");
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);

  const timeFrames = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];

  // Generate realistic candlestick data
  const generateCandleData = (basePrice: number, periods: number = 100) => {
    const data: CandleData[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    
    for (let i = periods; i >= 0; i--) {
      const timestamp = now - i * 60000; // 1 minute intervals
      const time = new Date(timestamp);
      
      // Generate OHLC data
      const volatility = currentPrice * 0.005; // 0.5% volatility
      const change = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const close = Math.max(open + change, open * 0.995);
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = Math.floor(Math.random() * 1000) + 100;
      
      currentPrice = close;
      
      // Calculate moving averages (simplified)
      const ma7 = data.length >= 6 ? 
        data.slice(-6).reduce((sum, item) => sum + item.close, 0) / 7 + close / 7 : close;
      const ma25 = data.length >= 24 ? 
        data.slice(-24).reduce((sum, item) => sum + item.close, 0) / 25 + close / 25 : close;
      const ma99 = close; // Simplified for demo
      
      data.push({
        time: time.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp,
        open,
        high,
        low,
        close,
        volume,
        ma7,
        ma25,
        ma99
      });
    }
    
    return data;
  };

  // Initialize chart data
  useEffect(() => {
    const initialData = generateCandleData(currentPrice);
    setCandleData(initialData);
    
    // Calculate 24h stats
    if (initialData.length > 0) {
      const first = initialData[0];
      const last = initialData[initialData.length - 1];
      const change = last.close - first.open;
      const changePercent = (change / first.open) * 100;
      const volumes = initialData.reduce((sum, item) => sum + item.volume, 0);
      const highs = Math.max(...initialData.map(item => item.high));
      const lows = Math.min(...initialData.map(item => item.low));
      
      setPriceChange(change);
      setPriceChangePercent(changePercent);
      setVolume24h(volumes);
      setHigh24h(highs);
      setLow24h(lows);
    }
  }, [currentPrice]);

  // Update chart with real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setCandleData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastCandle = prevData[prevData.length - 1];
        const volatility = lastCandle.close * 0.001;
        const change = (Math.random() - 0.5) * volatility;
        const newClose = Math.max(lastCandle.close + change, lastCandle.close * 0.999);
        
        // Update the last candle or create new one
        const updatedData = [...prevData];
        const now = Date.now();
        
        // Create new candle every minute (simplified)
        if (now - lastCandle.timestamp > 60000) {
          const newCandle: CandleData = {
            time: new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            timestamp: now,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newClose),
            low: Math.min(lastCandle.close, newClose),
            close: newClose,
            volume: Math.floor(Math.random() * 1000) + 100,
            ma7: lastCandle.ma7 * 0.9 + newClose * 0.1, // Simplified MA
            ma25: lastCandle.ma25 * 0.96 + newClose * 0.04,
            ma99: lastCandle.ma99 * 0.99 + newClose * 0.01
          };
          
          updatedData.push(newCandle);
          return updatedData.slice(-100); // Keep last 100 candles
        } else {
          // Update current candle
          updatedData[updatedData.length - 1] = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newClose),
            low: Math.min(lastCandle.low, newClose),
            close: newClose
          };
          return updatedData;
        }
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const isPositive = priceChange >= 0;

  // Custom candlestick component
  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;
    
    const { open, high, low, close } = payload;
    const isGreen = close >= open;
    const color = isGreen ? '#00d4aa' : '#f84960';
    
    const bodyHeight = Math.abs(close - open);
    const bodyY = Math.min(close, open);
    const wickTop = high;
    const wickBottom = low;
    
    // Scale calculations (simplified)
    const scale = height / (Math.max(...candleData.map(d => d.high)) - Math.min(...candleData.map(d => d.low)));
    const baseY = y + height;
    
    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={baseY - (wickTop - Math.min(...candleData.map(d => d.low))) * scale}
          x2={x + width / 2}
          y2={baseY - (wickBottom - Math.min(...candleData.map(d => d.low))) * scale}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={baseY - (Math.max(open, close) - Math.min(...candleData.map(d => d.low))) * scale}
          width={width * 0.6}
          height={Math.max(bodyHeight * scale, 1)}
          fill={color}
        />
      </g>
    );
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (['open', 'high', 'low', 'close', 'ma7', 'ma25', 'ma99'].includes(name)) {
      return [`$${value.toFixed(2)}`, name.toUpperCase()];
    }
    if (name === 'volume') {
      return [`${value.toLocaleString()}`, 'Volume'];
    }
    return [value, name];
  };

  return (
    <Card className="glass-card bg-gray-900/95 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              {tradingPair}
            </CardTitle>
            <div className="flex items-center gap-2">
              {timeFrames.map((tf) => (
                <Button
                  key={tf}
                  variant={timeFrame === tf ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeFrame(tf)}
                  className={`h-7 px-2 text-xs ${
                    timeFrame === tf 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Maximize2 className="h-4 w-4" />
            </Button>
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
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
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
            <p className="text-white font-medium">{volume24h.toLocaleString()}</p>
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
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={candleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={11}
                interval="preserveStartEnd"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                yAxisId="price"
                stroke="#9CA3AF"
                fontSize={11}
                domain={['dataMin - 50', 'dataMax + 50']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="#9CA3AF"
                fontSize={11}
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: '#fff' }}
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              
              {/* Volume bars */}
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#374151"
                opacity={0.6}
              />
              
              {/* Moving averages */}
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="ma7" 
                stroke="#f59e0b"
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
              />
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="ma25" 
                stroke="#8b5cf6"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
              />
              
              {/* Current price line */}
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="close" 
                stroke={isPositive ? '#00d4aa' : '#f84960'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: isPositive ? '#00d4aa' : '#f84960' }}
              />
              
              {/* Trade reference lines */}
              {activeTrade && (
                <ReferenceLine 
                  yAxisId="price"
                  y={activeTrade.entry_price} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label="Entry"
                />
              )}
              
              {activeTrade && activeTrade.target_price && (
                <ReferenceLine 
                  yAxisId="price"
                  y={activeTrade.target_price} 
                  stroke={activeTrade.direction === 'LONG' ? '#00d4aa' : '#f84960'} 
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border-t border-gray-700">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-orange-400"></div>
              <span className="text-gray-400">MA(7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-purple-400"></div>
              <span className="text-gray-400">MA(25)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-gray-500"></div>
              <span className="text-gray-400">Volume</span>
            </div>
            {activeTrade && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-orange-500"></div>
                  <span className="text-gray-400">Entry</span>
                </div>
                {activeTrade.target_price && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-1 ${
                      activeTrade.direction === 'LONG' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-400">Target</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-gray-400">
            TradingView Chart • {timeFrame} • Real-time
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
