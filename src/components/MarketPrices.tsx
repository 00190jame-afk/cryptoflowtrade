import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { usePerformance } from "@/hooks/usePerformance";

export const MarketPrices = () => {
  usePerformance('MarketPrices');
  
  const { 
    data: coins, 
    isLoading, 
    isError, 
    error, 
    isRefetching, 
    isOnline, 
    refreshData, 
    lastUpdated 
  } = useMarketData();

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

  if (isLoading) {
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

  if (isError) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <WifiOff className="h-5 w-5" />
            Connection Error
          </CardTitle>
          <CardDescription>
            {error?.message || 'Failed to load market data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshData} disabled={!isOnline} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isOnline ? 'Try Again' : 'Offline'}
          </Button>
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
            {isRefetching ? (
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Top 20 cryptocurrencies by market cap
            {lastUpdated && (
              <span className="flex items-center gap-1 text-xs mt-1">
                <Clock className="h-3 w-3" />
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData} 
          disabled={isRefetching || !isOnline}
          className="ml-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                     #{coins.indexOf(coin) + 1}
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