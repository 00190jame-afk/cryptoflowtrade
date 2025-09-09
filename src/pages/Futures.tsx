import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, Target, Clock, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import TradingChart from "@/components/TradingChart";

const TRADING_PAIRS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ADA/USDT", "XRP/USDT",
  "DOT/USDT", "LTC/USDT", "DOGE/USDT", "MATIC/USDT", "AVAX/USDT", "ENR/USDT"
];

const LEVERAGES = [5, 10, 20, 50];

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
}

interface UserBalance {
  balance: number;
  currency: string;
}

const Futures = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState<UserBalance>({ balance: 0, currency: "USDT" });
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [stakeAmount, setStakeAmount] = useState("");
  const [leverage, setLeverage] = useState(5);
  const [isTrading, setIsTrading] = useState(false);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [tradeProgress, setTradeProgress] = useState(0);
  const [currentPrice, setCurrentPrice] = useState<number>(45000);

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

  // Fetch user balance
  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_balances")
      .select("balance, currency")
      .eq("user_id", user.id)
      .single();
    if (data) setBalance(data);
  };

  // Fetch user trades
  const fetchTrades = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setTrades(data);
      const active = data.find(t => t.status === "active");
      setActiveTrade(active || null);
    }
  };

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 100;
        return Math.max(prev + change, 1000);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle active trade countdown
  useEffect(() => {
    if (!activeTrade) return;

    const startTime = new Date(activeTrade.created_at).getTime();
    const duration = activeTrade.trade_duration || 180;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setTradeProgress(progress);

      if (progress >= 100) {
        completeTrade();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeTrade]);

  // Complete trade
  const completeTrade = async () => {
    if (!activeTrade) return;

    const profitAmount = activeTrade.stake_amount * (activeTrade.profit_rate / 100);
    
    // Update trade status
    const { error } = await supabase
      .from("trades")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        profit_loss_amount: profitAmount
      })
      .eq("id", activeTrade.id);

    if (!error) {
      // Update user balance
      await supabase
        .from("user_balances")
        .update({
          balance: balance.balance + profitAmount
        })
        .eq("user_id", user!.id);

      toast.success(`Trade completed! Profit: $${profitAmount.toFixed(2)}`);
      setActiveTrade(null);
      setTradeProgress(0);
      fetchBalance();
      fetchTrades();
    }
  };

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

    if (activeTrade) {
      toast.error("You already have an active trade");
      return;
    }

    setIsTrading(true);

    const profitRate = calculateProfitRate(stake);
    const requiredPriceChange = calculateRequiredPriceChange(profitRate, leverage);
    const tradeDuration = Math.floor(Math.random() * 241) + 60; // 60-300 seconds
    const targetPrice = direction === "LONG" 
      ? currentPrice * (1 + requiredPriceChange / 100)
      : currentPrice * (1 - requiredPriceChange / 100);

    const tradeData = {
      user_id: user.id,
      trading_pair: selectedPair,
      direction,
      stake_amount: stake,
      leverage,
      entry_price: currentPrice,
      profit_rate: profitRate,
      required_price_change: requiredPriceChange,
      trade_duration: tradeDuration,
      current_price: currentPrice,
      target_price: targetPrice
    };

    const { error } = await supabase.from("trades").insert(tradeData);

    if (error) {
      toast.error("Failed to start trade");
      setIsTrading(false);
      return;
    }

    // Deduct stake from balance
    await supabase
      .from("user_balances")
      .update({ balance: balance.balance - stake })
      .eq("user_id", user.id);

    toast.success("Trade started successfully!");
    setStakeAmount("");
    setIsTrading(false);
    fetchBalance();
    fetchTrades();
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTrades();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in to access futures trading</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Crypto Futures Trading</h1>
          <p className="text-muted-foreground">
            Trade with fixed profit rules and immediate execution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Chart - Full Width */}
          <div className="lg:col-span-3">
            <TradingChart 
              tradingPair={selectedPair}
              currentPrice={currentPrice}
              activeTrade={activeTrade}
            />
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Trade */}
            {activeTrade && (
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Active Trade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pair</p>
                      <p className="font-medium">{activeTrade.trading_pair}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Direction</p>
                      <Badge variant={activeTrade.direction === "LONG" ? "default" : "destructive"}>
                        {activeTrade.direction === "LONG" ? (
                          <><TrendingUp className="h-3 w-3 mr-1" /> LONG</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" /> SHORT</>
                        )}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stake</p>
                      <p className="font-medium">${activeTrade.stake_amount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Leverage</p>
                      <p className="font-medium">{activeTrade.leverage}x</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(tradeProgress)}%</span>
                    </div>
                    <Progress value={tradeProgress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-medium">${activeTrade.entry_price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Price</p>
                      <p className="font-medium">${activeTrade.target_price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Profit</p>
                      <p className="font-medium text-green-600">
                        ${(activeTrade.stake_amount * (activeTrade.profit_rate / 100)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trading Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  New Trade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trading Pair</label>
                    <Select value={selectedPair} onValueChange={setSelectedPair}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADING_PAIRS.map(pair => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Direction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={direction === "LONG" ? "default" : "outline"}
                        onClick={() => setDirection("LONG")}
                        className="flex items-center gap-2"
                      >
                        <TrendingUp className="h-4 w-4" />
                        LONG
                      </Button>
                      <Button
                        variant={direction === "SHORT" ? "destructive" : "outline"}
                        onClick={() => setDirection("SHORT")}
                        className="flex items-center gap-2"
                      >
                        <TrendingDown className="h-4 w-4" />
                        SHORT
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stake Amount (USDT)</label>
                    <Input
                      type="number"
                      placeholder="Minimum $50"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      min="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leverage</label>
                    <Select value={leverage.toString()} onValueChange={(v) => setLeverage(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVERAGES.map(lev => (
                          <SelectItem key={lev} value={lev.toString()}>{lev}x</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {stakeAmount && parseFloat(stakeAmount) >= 50 && (
                  <Card className="p-4 bg-muted/10">
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
                  </Card>
                )}

                <Button
                  onClick={startTrade}
                  disabled={!stakeAmount || parseFloat(stakeAmount) < 50 || isTrading || !!activeTrade}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {isTrading ? "Starting Trade..." : "Start Trade"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Balance */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${balance.balance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{balance.currency}</p>
              </CardContent>
            </Card>

            {/* Current Price */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {selectedPair}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Live Price</p>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center p-2 rounded bg-muted/10">
                    <div>
                      <p className="text-sm font-medium">{trade.trading_pair}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.direction} • ${trade.stake_amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        trade.result === 'win' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profit_loss_amount > 0 ? '+' : ''}${trade.profit_loss_amount?.toFixed(2)}
                      </p>
                      <Badge variant={trade.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {trade.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {trades.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No trades yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Futures;