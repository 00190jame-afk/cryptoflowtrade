import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
}

export const MarketPrices = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMarketData = async () => {
    try {
      // Fetch from CoinGecko but update Bitcoin price from Binance for consistency
      const [marketResponse, btcPriceResponse] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      ]);
      
      if (!marketResponse.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const data: CoinData[] = await marketResponse.json();
      
      // Update Bitcoin price with Binance data for consistency with Futures page
      if (btcPriceResponse.ok) {
        const btcData = await btcPriceResponse.json();
        const btcPrice = parseFloat(btcData.price);
        
        const btcIndex = data.findIndex(coin => coin.symbol === 'btc');
        if (btcIndex !== -1) {
          const originalPrice = data[btcIndex].current_price;
          data[btcIndex].current_price = btcPrice;
          // Recalculate market cap with new price
          data[btcIndex].market_cap = (data[btcIndex].market_cap / originalPrice) * btcPrice;
        }
      }
      
      // Sort by market cap rank to ensure correct order
      const sortedData = data.sort((a, b) => a.market_cap_rank - b.market_cap_rank);
      setCoins(sortedData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return formatCurrency(value);
  };

  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Market Prices</CardTitle>
          <CardDescription>Loading market data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Market Prices
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Top 100 cryptocurrencies by market cap
            {lastUpdate && (
              <span className="block text-xs mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead className="w-20">Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">24h Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coins.map((coin) => (
                <TableRow key={coin.id} className="border-border/50 hover:bg-muted/5">
                  <TableCell className="font-medium">
                    #{coin.market_cap_rank}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold uppercase text-sm">
                      {coin.symbol}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {coin.name}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(coin.current_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                      className={`flex items-center gap-1 justify-end ${
                        coin.price_change_percentage_24h >= 0 
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatLargeNumber(coin.market_cap)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatLargeNumber(coin.total_volume)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};