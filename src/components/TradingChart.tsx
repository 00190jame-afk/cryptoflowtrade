import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface PriceData {
  time: string;
  price: number;
  volume: number;
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
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  // Initialize chart data
  useEffect(() => {
    const initialData: PriceData[] = [];
    const basePrice = currentPrice;
    const now = Date.now();
    
    // Generate 50 data points for the last 50 minutes
    for (let i = 49; i >= 0; i--) {
      const time = new Date(now - i * 60000); // 1 minute intervals
      const volatility = basePrice * 0.002; // 0.2% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = basePrice + randomChange * (Math.random() * 2);
      const volume = Math.floor(Math.random() * 1000000) + 500000;
      
      initialData.push({
        time: time.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: Math.max(price, basePrice * 0.95), // Don't go below 5% of base price
        volume
      });
    }
    
    setPriceData(initialData);
  }, [currentPrice]);

  // Update chart with real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prevData => {
        const lastPrice = prevData[prevData.length - 1]?.price || currentPrice;
        const volatility = lastPrice * 0.001; // 0.1% volatility per update
        const randomChange = (Math.random() - 0.5) * volatility;
        const newPrice = Math.max(lastPrice + randomChange, lastPrice * 0.999);
        
        const newDataPoint: PriceData = {
          time: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: newPrice,
          volume: Math.floor(Math.random() * 1000000) + 500000
        };

        // Keep only last 50 data points
        const updatedData = [...prevData.slice(-49), newDataPoint];
        
        // Calculate price change
        if (updatedData.length >= 2) {
          const firstPrice = updatedData[0].price;
          const change = newPrice - firstPrice;
          const changePercent = (change / firstPrice) * 100;
          setPriceChange(change);
          setPriceChangePercent(changePercent);
        }
        
        return updatedData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [currentPrice]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'price') {
      return [`$${value.toFixed(2)}`, 'Price'];
    }
    return [value, name];
  };

  const isPositive = priceChange >= 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {tradingPair} Chart
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={['dataMin - 50', 'dataMax + 50']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? '#16a34a' : '#dc2626'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: isPositive ? '#16a34a' : '#dc2626' }}
              />
              
              {/* Show entry price line for active trade */}
              {activeTrade && (
                <ReferenceLine 
                  y={activeTrade.entry_price} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  label="Entry"
                />
              )}
              
              {/* Show target price line for active trade */}
              {activeTrade && activeTrade.target_price && (
                <ReferenceLine 
                  y={activeTrade.target_price} 
                  stroke={activeTrade.direction === 'LONG' ? '#16a34a' : '#dc2626'} 
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart indicators */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Current Price</span>
            </div>
            {activeTrade && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-primary"></div>
                  <span className="text-muted-foreground">Entry Price</span>
                </div>
                {activeTrade.target_price && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-1 ${
                      activeTrade.direction === 'LONG' ? 'bg-green-600' : 'bg-red-600'
                    }`}></div>
                    <span className="text-muted-foreground">Target Price</span>
                  </div>
                )}
              </>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Live Data
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
