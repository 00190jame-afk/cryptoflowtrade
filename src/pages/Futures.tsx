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
const TRADING_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ADA/USDT", "XRP/USDT", "DOT/USDT", "LTC/USDT", "DOGE/USDT", "MATIC/USDT", "AVAX/USDT", "ENR/USDT"];
const LEVERAGES = [5, 10, 20, 50];
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
  required_price_change: number;
  profit_loss_amount: number;
  created_at: string;
  completed_at?: string;
  trade_duration?: number;
  current_price?: number;
  target_price?: number;
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
  const [stopProfitPercentage, setStopProfitPercentage] = useState<number | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(45000);
  const [positionOrders, setPositionOrders] = useState<PositionOrder[]>([]);
  const [closingOrders, setClosingOrders] = useState<ClosingOrder[]>([]);
  const completingTradeRef = useRef<string | null>(null);

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
    'MATIC': 'polygon-ecosystem-token',
    'AVAX': 'avalanche-2'
    // ENR not mapped – will stay simulated
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

  // Fetch user balance
  const fetchBalance = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from("user_balances").select("balance, currency").eq("user_id", user.id).single();
    if (data) setBalance(data);
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

  
  // Complete expired trade function
  const completeExpiredTrade = async (trade: Trade) => {
    if (completingTradeRef.current === trade.id) {
      return; // Already completing this trade
    }
    
    console.log('Starting trade completion for expired trade:', trade.id);
    completingTradeRef.current = trade.id;

    try {
      // Re-fetch latest trade in case admin modified it
      const { data: latest } = await supabase
        .from('trades')
        .select('modified_by_admin, profit_loss_amount, result, status')
        .eq('id', trade.id)
        .single();

      // Check if trade was already completed by another process
      if (latest?.status === 'completed') {
        console.log('Trade already completed:', trade.id);
        completingTradeRef.current = null;
        return;
      }

      // Calculate profit based on stake tiers: 50-99.99→20%, 100-249.99→30%, 250+→40%
      const calculatedProfit = trade.stake_amount * (trade.profit_rate / 100);
      const profitAmount = latest?.modified_by_admin ? (latest.profit_loss_amount ?? 0) : calculatedProfit;
      
      // Determine result based on profit amount - negative = loss, positive = win
      const finalResult = profitAmount < 0 ? 'loss' : 'win';
      
      console.log(`Trade ${trade.id}: admin_modified=${latest?.modified_by_admin}, profit=${profitAmount}, result=${finalResult}`);

      // Get position to move to closing orders
      const { data: position } = await supabase
        .from('positions_orders')
        .select('*')
        .eq('trade_id', trade.id)
        .single();

      if (position) {
        // Move to closing orders with exit price same as entry price
        const closingData = {
          user_id: user!.id,
          symbol: position.symbol,
          side: position.side,
          entry_price: position.entry_price,
          exit_price: position.entry_price, // Same as entry for simplicity
          quantity: position.stake || position.quantity, // Use stake as quantity for display
          leverage: position.leverage,
          realized_pnl: profitAmount,
          original_trade_id: trade.id
        };

        await supabase.from('closing_orders').insert(closingData);
        
        // Remove from positions
        await supabase.from('positions_orders').delete().eq('trade_id', trade.id);
      }

      // Update trade status
      const { error } = await supabase.from('trades').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        profit_loss_amount: profitAmount,
        result: finalResult
      }).eq('id', trade.id);
      
      if (!error) {
        console.log('Trade completed successfully:', trade.id);
        // Update user balance by profit amount (stake + profit)
        await supabase.from('user_balances').update({
          balance: balance.balance + trade.stake_amount + profitAmount
        }).eq('user_id', user!.id);
        fetchBalance();
        fetchTrades();
        fetchPositionOrders();
        fetchClosingOrders();
      } else {
        console.error('Error completing trade:', error);
      }
    } catch (error) {
      console.error('Exception in completeExpiredTrade:', error);
    } finally {
      completingTradeRef.current = null;
    }
  };

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



  
  // Check for expired trades every 30 seconds
  useEffect(() => {
    const checkExpiredTrades = () => {
      const activeTrades = trades.filter(t => t.status === "active");
      activeTrades.forEach(trade => {
        if (trade.ends_at && new Date(trade.ends_at) <= new Date() && !completingTradeRef.current) {
          console.log('Found expired trade, completing:', trade.id);
          completeExpiredTrade(trade);
        }
      });
    };

    // Only check if we have trades and user is logged in
    if (trades.length > 0 && user) {
      const interval = setInterval(checkExpiredTrades, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [trades, user]);

  // Start new trade
  const startTrade = async () => {
    if (!user || !stakeAmount || isTrading) return;
    const stake = parseFloat(stakeAmount);
    if (stake < 50) {
      toast.error("Minimum stake is $50");
      return;
    }
    if (stake > balance.balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    setIsTrading(true);
    
    // Get the most current price just before trade execution
    let realTimePrice = currentPrice;
    try {
      const symbol = mapPairToBinanceSymbol(selectedPair);
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      if (response.ok) {
        const data = await response.json();
        realTimePrice = parseFloat(data.price);
        console.log(`Using real-time price for trade: ${realTimePrice}`);
        // Update the current price state to match
        setCurrentPrice(realTimePrice);
      }
    } catch (error) {
      console.log("Using existing current price for trade:", realTimePrice);
    }
    
    const profitRate = calculateProfitRate(stake);
    const tradeDuration = Math.floor(Math.random() * 241) + 60; // Random 60-300 seconds
      
    console.log(`Trade started: Entry=${realTimePrice}, Direction=${direction}, Duration=${tradeDuration}s, Stake=${stake}`);
    
    const tradeData = {
      user_id: user.id,
      trading_pair: selectedPair,
      direction,
      stake_amount: stake,
      leverage,
      entry_price: realTimePrice,
      profit_rate: profitRate,
      required_price_change: 0, // Not used in new system
      trade_duration: tradeDuration,
      ends_at: new Date(Date.now() + tradeDuration * 1000).toISOString(),
      current_price: realTimePrice,
      target_price: realTimePrice // Exit price same as entry for simplicity
    };
    const { data: newTrade, error } = await supabase.from('trades').insert(tradeData).select().single();
    if (error) {
      toast.error("Failed to start trade");
      setIsTrading(false);
      return;
    }

    // Create position order with new fields
    const positionData = {
      user_id: user.id,
      symbol: selectedPair,
      side: direction,
      entry_price: realTimePrice,
      mark_price: realTimePrice,
      quantity: stake / realTimePrice,
      leverage,
      stake: stake,
      scale: stopProfitPercentage ? `${stopProfitPercentage}%` : null,
      unrealized_pnl: 0,
      realized_pnl: null, // Empty at first
      trade_id: newTrade.id
    };
    await supabase.from('positions_orders').insert(positionData);

    // Deduct stake from balance
    await supabase.from("user_balances").update({
      balance: balance.balance - stake
    }).eq("user_id", user.id);
    toast.success("Trade started successfully!");
    setStakeAmount("");
    setIsTrading(false);
    fetchBalance();
    fetchTrades();
    fetchPositionOrders();
  };
  // Close position function
  const closePosition = async (positionId: string, tradeId: string) => {
    try {
      // Get position details
      const { data: position } = await supabase
        .from('positions_orders')
        .select('*')
        .eq('id', positionId)
        .single();

      if (!position) return;

      // Create closing order
      const exitPrice = currentPrice;
      const realizedPnl = (exitPrice - position.entry_price) * position.quantity * 
                         (position.side === 'LONG' ? 1 : -1);

      const closingData = {
        user_id: user!.id,
        symbol: position.symbol,
        side: position.side,
        entry_price: position.entry_price,
        exit_price: exitPrice,
        quantity: position.quantity,
        leverage: position.leverage,
        realized_pnl: realizedPnl,
        original_trade_id: tradeId
      };

      await supabase.from('closing_orders').insert(closingData);
      
      // Remove from positions orders
      await supabase.from('positions_orders').delete().eq('id', positionId);
      
      // Update trade status if exists
      await supabase.from('trades').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        profit_loss_amount: realizedPnl,
        result: realizedPnl < 0 ? 'loss' : 'win'
      }).eq('id', tradeId);

      toast.success('Position closed successfully');
      fetchPositionOrders();
      fetchClosingOrders();
      fetchTrades();
    } catch (error) {
      toast.error('Failed to close position');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTrades();
      fetchPositionOrders();
      fetchClosingOrders();
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
                    <Input type="number" placeholder="Minimum $50" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} min="50" />
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
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    <Button
                      variant={stopProfitPercentage === null ? "default" : "outline"}
                      onClick={() => setStopProfitPercentage(null)}
                      className="text-xs"
                      size="sm"
                    >
                      None
                    </Button>
                    {STOP_PROFIT_OPTIONS.map(percentage => (
                      <Button
                        key={percentage}
                        variant={stopProfitPercentage === percentage ? "default" : "outline"}
                        onClick={() => setStopProfitPercentage(percentage)}
                        className="text-xs"
                        size="sm"
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
          </div>

                {stakeAmount && parseFloat(stakeAmount) >= 50 && <Card className="p-4 bg-muted/10">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Profit Rate</p>
                        <p className="font-medium text-green-600">
                          {calculateProfitRate(parseFloat(stakeAmount))}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Required Movement</p>
                        <p className="font-medium">
                          {calculateRequiredPriceChange(calculateProfitRate(parseFloat(stakeAmount)), leverage).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Profit</p>
                        <p className="font-medium text-green-600">
                          ${(parseFloat(stakeAmount) * (calculateProfitRate(parseFloat(stakeAmount)) / 100)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>}

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
                                 <TableCell>${position.stake?.toFixed(2) || 'N/A'}</TableCell>
                                 <TableCell>${position.entry_price.toFixed(2)}</TableCell>
                                 <TableCell>{position.leverage}x</TableCell>
                                 <TableCell>{position.scale || 'None'}</TableCell>
                                 <TableCell className="text-muted-foreground">
                                   {position.realized_pnl ? `$${position.realized_pnl.toFixed(2)}` : '-'}
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
                                 <TableCell>${order.quantity.toFixed(2)}</TableCell>
                                 <TableCell>${order.entry_price.toFixed(2)}</TableCell>
                                 <TableCell>{order.leverage}x</TableCell>
                                 <TableCell>None</TableCell>
                                 <TableCell className={order.realized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                   ${order.realized_pnl.toFixed(2)}
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