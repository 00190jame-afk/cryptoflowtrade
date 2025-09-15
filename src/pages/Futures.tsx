import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, Clock, BarChart3, X } from "lucide-react";
import Header from "@/components/Header";
import TradingChart from "@/components/TradingChart";
const TRADING_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ADA/USDT", "XRP/USDT", "DOT/USDT", "LTC/USDT", "DOGE/USDT", "AVAX/USDT"];
const LEVERAGES = [5, 10, 20, 50];
const SCALE_OPTIONS = [10, 20, 30, 40, 50];
const STOP_PROFIT_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
interface Trade {
  id: string;
  trading_pair: string;
  direction: string;
  stake_amount: number;
  leverage: number;
  entry_price: number;
  status: string;
  result: string;
  profit_rate: number;
  profit_loss_amount: number;
  created_at: string;
  completed_at?: string;
  trade_duration?: number;
  current_price?: number;
  ends_at?: string;
}
interface UserBalance {
  balance: number;
  currency: string;
}

interface PositionOrder {
  id: string;
  symbol: string;
  side: string;
  entry_price: number;
  mark_price: number;
  quantity: number;
  leverage: number;
  stake?: number;
  scale?: string;
  unrealized_pnl: number;
  realized_pnl?: number;
  trade_id: string;
  created_at: string;
}

interface ClosingOrder {
  id: string;
  symbol: string;
  side: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  leverage: number;
  realized_pnl: number;
  closed_at: string;
  scale?: string;
  stake?: number;
}
const Futures = () => {
  const {
    user
  } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState<UserBalance>({
    balance: 0,
    currency: "USDT"
  });
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [stakeAmount, setStakeAmount] = useState("");
  const [leverage, setLeverage] = useState(5);
  const [scale, setScale] = useState<number | null>(null);
  const [stopProfitPercentage, setStopProfitPercentage] = useState<number | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(45000);
  const [positionOrders, setPositionOrders] = useState<PositionOrder[]>([]);
  const [closingOrders, setClosingOrders] = useState<ClosingOrder[]>([]);

  // Calculate profit based on stake amount
  const calculateProfitRate = (stake: number): number => {
    if (stake >= 250) return 40;
    if (stake >= 100) return 30;
    if (stake >= 50) return 20;
    return 0;
  };

  // Calculate required price movement
  const calculateRequiredPriceChange = (profitRate: number, leverageValue: number): number => {
    return profitRate / leverageValue;
  };

  // Map pair to Binance symbol (e.g., BTC/USDT -> BTCUSDT)
  const mapPairToBinanceSymbol = (pair: string) => pair.replace('/', '');

  // Optional mapping for CoinGecko IDs (fallback)
  const COINGECKO_IDS: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'DOT': 'polkadot',
    'LTC': 'litecoin',
    'DOGE': 'dogecoin',
    'AVAX': 'avalanche-2'
  };
  const getBaseFromPair = (pair: string) => pair.split('/')[0];

  // Fetch profit rate from DB trade_rules by stake
  const getProfitRateFromDB = async (stake: number): Promise<number | null> => {
    const {
      data
    } = await (supabase as any).from('trade_rules').select('profit_rate, min_stake, max_stake').lte('min_stake', stake).gte('max_stake', stake).order('min_stake', {
      ascending: false
    }).limit(1);
    return data?.[0]?.profit_rate ?? null;
  };

  // Fetch user balance from same table as Assets page
  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_balances")
      .select("balance, currency, on_hold, frozen")
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setBalance({
        balance: data.balance,
        currency: data.currency || "USDT"
      });
    } else {
      // If no balance record, default to 0 without creating (RLS prevents client inserts)
      setBalance({ balance: 0, currency: "USDT" });
    }
  };

  // Fetch user trades
  const fetchTrades = async () => {
    if (!user) return;
    console.log('Fetching trades for user:', user.id);
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      console.log('Fetched trades:', data.length);
      setTrades(data);
    }
  };

  // Fetch positions orders
  const fetchPositionOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("positions_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      setPositionOrders(data);
    }
  };

  // Fetch closing orders
  const fetchClosingOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("closing_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("closed_at", { ascending: false });
    
    if (data) {
      setClosingOrders(data);
    }
  };

  
  // REMOVED: Client-side trade completion bypassed intended server flow
  // The database triggers and edge function now handle all trade completion logic

  // Live price updates from Binance with CoinGecko fallback
  useEffect(() => {
    let cancelled = false;
    const fetchPrice = async () => {
      try {
        const symbol = mapPairToBinanceSymbol(selectedPair);
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (res.ok) {
          const json = await res.json();
          const price = parseFloat(json.price);
          if (!cancelled && !isNaN(price)) setCurrentPrice(price);
          return;
        }
      } catch {}

      // Fallback: CoinGecko for supported bases
      try {
        const base = getBaseFromPair(selectedPair);
        const id = COINGECKO_IDS[base];
        if (id) {
          const res2 = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
          if (res2.ok) {
            const j = await res2.json();
            const price = parseFloat(j[id]?.usd);
            if (!cancelled && !isNaN(price)) setCurrentPrice(price);
            return;
          }
        }
      } catch {}

      // Final fallback: small random walk to avoid freezing UI
      setCurrentPrice(prev => Math.max(prev + (Math.random() - 0.5) * 50, 0.01));
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedPair]);



  
  // Periodic refresh to sync with database changes (trades processed by edge function)
  useEffect(() => {
    if (!user) return;
    
    const refreshInterval = setInterval(() => {
      fetchTrades();
      fetchPositionOrders();
      fetchClosingOrders();
      fetchBalance();
    }, 15000); // Refresh every 15 seconds to show latest trade status
    
    return () => clearInterval(refreshInterval);
  }, [user]);

  // Start new trade
  const startTrade = async () => {
    if (!user || !stakeAmount || isTrading) return;
    const stake = parseFloat(stakeAmount);
    if (stake < 50) {
      toast.error("Minimum stake is 50 USDT");
      return;
    }
    if (stake > balance.balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    setIsTrading(true);
    
    try {
      // Get real-time price
      let realTimePrice = currentPrice;
      try {
        const symbol = mapPairToBinanceSymbol(selectedPair);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          realTimePrice = parseFloat(data.price);
          setCurrentPrice(realTimePrice);
        }
      } catch (error) {
        console.log("Using existing current price for trade:", realTimePrice);
      }
      
      const dbRate = await getProfitRateFromDB(stake);
      const profitRate = dbRate ?? calculateProfitRate(stake);
      
      console.log(`Trade started: Stake=${stake}, ProfitRate=${profitRate}%`);
      
      // Let database set duration and ends_at automatically via triggers
      const tradeData = {
        user_id: user.id,
        trading_pair: selectedPair,
        direction,
        stake_amount: stake,
        leverage,
        entry_price: realTimePrice,
        profit_rate: profitRate,
        current_price: realTimePrice
      };
      
      const { data: newTrade, error } = await supabase.from('trades').insert(tradeData).select().single();
      if (error) {
        toast.error("Failed to start trade");
        setIsTrading(false);
        return;
      }

      // Create position order
      const positionData = {
        user_id: user.id,
        symbol: selectedPair,
        side: direction,
        entry_price: realTimePrice,
        mark_price: realTimePrice,
        quantity: stake / realTimePrice,
        leverage,
        stake: stake,
        scale: scale ? `${scale}%` : null,
        unrealized_pnl: 0,
        trade_id: newTrade.id
      };
      await supabase.from('positions_orders').insert(positionData);

      // Note: Stake deduction handled automatically by database trigger

      toast.success("Trade started successfully!");
      setStakeAmount("");
      fetchBalance();
      fetchTrades();
      fetchPositionOrders();
    } catch (error) {
      toast.error("Failed to start trade");
      console.error('Trade error:', error);
    } finally {
      setIsTrading(false);
    }
  };
  // REMOVED: Manual position closing bypassed intended server flow  
  // Positions are automatically closed when trades expire via edge function

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTrades();
      fetchPositionOrders();
      fetchClosingOrders();

      // Set up real-time subscription for balance changes
      const channel = supabase
        .channel('user_balance_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_balances',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('Balance changed, refreshing...');
          fetchBalance();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  if (!user) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in to access futures trading</h1>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Crypto Futures Trading</h1>
          
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Trading Chart - Full Width */}
          <div>
            <TradingChart tradingPair={selectedPair} currentPrice={currentPrice} />
          </div>

          {/* Trading Form - Streamlined */}
          <div>
            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trading Pair</label>
                    <Select value={selectedPair} onValueChange={setSelectedPair}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADING_PAIRS.map(pair => <SelectItem key={pair} value={pair}>{pair}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Direction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={direction === "LONG" ? "default" : "outline"} onClick={() => setDirection("LONG")} className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        LONG
                      </Button>
                      <Button variant={direction === "SHORT" ? "destructive" : "outline"} onClick={() => setDirection("SHORT")} className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        SHORT
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stake Amount (USDT)</label>
                    <Input type="number" placeholder="Minimum 50 USDT" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} min="50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leverage</label>
                    <Select value={leverage.toString()} onValueChange={v => setLeverage(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVERAGES.map(lev => <SelectItem key={lev} value={lev.toString()}>{lev}x</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Scale</label>
                  <Select value={scale ? scale.toString() : ""} onValueChange={(value) => setScale(value ? parseInt(value) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALE_OPTIONS.map((scaleOption) => (
                        <SelectItem key={scaleOption} value={scaleOption.toString()}>
                          {scaleOption}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <Button onClick={startTrade} disabled={!stakeAmount || parseFloat(stakeAmount) < 50 || isTrading} className="w-full gradient-primary" size="lg">
                  {isTrading ? "Starting Trade..." : "Start Trade"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trading Positions - Full Width */}
          <div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trading Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="positions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="positions">Positions ({positionOrders.length})</TabsTrigger>
                    <TabsTrigger value="closed">Closed Orders ({closingOrders.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="positions" className="space-y-4">
                    {positionOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No open positions
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                         <Table>
                           <TableHeader>
                             <TableRow>
                               <TableHead>Symbol</TableHead>
                               <TableHead>Side</TableHead>
                               <TableHead>Stake</TableHead>
                               <TableHead>Entry Price</TableHead>
                               <TableHead>Leverage</TableHead>
                               <TableHead>Scale</TableHead>
                               <TableHead>Realized PnL</TableHead>
                               <TableHead>Time</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {positionOrders.map((position) => (
                               <TableRow key={position.id}>
                                 <TableCell className="font-medium">{position.symbol}</TableCell>
                                 <TableCell>
                                   <Badge variant={position.side === 'LONG' ? 'default' : 'destructive'}>
                                     {position.side}
                                   </Badge>
                                 </TableCell>
                                  <TableCell>{position.stake?.toFixed(2) || 'N/A'} USDT</TableCell>
                                  <TableCell>${position.entry_price.toFixed(2)}</TableCell>
                                 <TableCell>{position.leverage}x</TableCell>
                                 <TableCell>{position.scale || 'None'}</TableCell>
                                 <TableCell className="text-muted-foreground">
                                   {position.realized_pnl ? `${position.realized_pnl.toFixed(2)} USDT` : '-'}
                                 </TableCell>
                                 <TableCell className="text-sm text-muted-foreground">
                                   {new Date(position.created_at).toLocaleString()}
                                 </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="closed" className="space-y-4">
                    {closingOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No closed orders
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                           <TableHeader>
                             <TableRow>
                               <TableHead>Symbol</TableHead>
                               <TableHead>Side</TableHead>
                               <TableHead>Stake</TableHead>
                               <TableHead>Entry Price</TableHead>
                               <TableHead>Leverage</TableHead>
                               <TableHead>Scale</TableHead>
                               <TableHead>Realized PnL</TableHead>
                               <TableHead>Time</TableHead>
                             </TableRow>
                           </TableHeader>
                          <TableBody>
                             {closingOrders.map((order) => (
                               <TableRow key={order.id}>
                                 <TableCell className="font-medium">{order.symbol}</TableCell>
                                 <TableCell>
                                   <Badge variant={order.side === 'LONG' ? 'default' : 'destructive'}>
                                     {order.side}
                                   </Badge>
                                 </TableCell>
                                  <TableCell>{order.stake?.toFixed(2) || order.quantity.toFixed(2)} USDT</TableCell>
                                  <TableCell>${order.entry_price.toFixed(2)}</TableCell>
                                 <TableCell>{order.leverage}x</TableCell>
                                  <TableCell>{order.scale || 'None'}</TableCell>
                                 <TableCell className={order.realized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                   {order.realized_pnl.toFixed(2)} USDT
                                 </TableCell>
                                 <TableCell className="text-sm text-muted-foreground">
                                   {new Date(order.closed_at).toLocaleString()}
                                 </TableCell>
                               </TableRow>
                             ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>;
};
export default Futures;