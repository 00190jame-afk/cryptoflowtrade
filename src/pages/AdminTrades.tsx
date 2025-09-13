import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import Header from "@/components/Header";

interface PendingTrade {
  id: string;
  user_id: string;
  trading_pair: string;
  direction: string;
  stake_amount: number;
  leverage: number;
  entry_price: number;
  profit_rate: number;
  created_at: string;
  ends_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  } | null;
}

const AdminTrades = () => {
  const { user } = useAuth();
  const [pendingTrades, setPendingTrades] = useState<PendingTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTradeId, setProcessingTradeId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTrades();
    
    // Set up real-time subscription for trades
    const channel = supabase
      .channel('admin-trades')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        },
        () => {
          fetchPendingTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            username
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending trades:', error);
        toast.error('Failed to fetch pending trades');
        return;
      }

      setPendingTrades((data as any) || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch pending trades');
    } finally {
      setLoading(false);
    }
  };

  const handleTradeDecision = async (tradeId: string, decision: 'win' | 'lose') => {
    if (processingTradeId) return;
    
    setProcessingTradeId(tradeId);
    
    try {
      // Get the trade details first
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (tradeError || !trade) {
        toast.error('Trade not found');
        return;
      }

      // Update trade status and result
      const { error: updateError } = await supabase
        .from('trades')
        .update({
          status: decision,
          result: decision,
          completed_at: new Date().toISOString(),
          modified_by_admin: true
        })
        .eq('id', tradeId);

      if (updateError) {
        toast.error('Failed to update trade');
        return;
      }

      // If WIN, add profit to user's balance
      if (decision === 'win') {
        const profitAmount = trade.stake_amount * (trade.profit_rate / 100);
        
        const { error: balanceError } = await (supabase as any).rpc('update_user_balance', {
          p_user_id: trade.user_id,
          p_amount: profitAmount,
          p_transaction_type: 'trade_profit',
          p_description: `Trade profit: ${profitAmount} USDT`,
          p_trade_id: tradeId
        });

        if (balanceError) {
          toast.error('Failed to update user balance');
          return;
        }

        toast.success(`Trade marked as WIN. User credited ${profitAmount} USDT`);
      } else {
        toast.success('Trade marked as LOSE');
      }

      // Remove position orders for this trade
      await supabase
        .from('positions_orders')
        .delete()
        .eq('trade_id', tradeId);

      fetchPendingTrades();
    } catch (error) {
      console.error('Error processing trade decision:', error);
      toast.error('Failed to process trade decision');
    } finally {
      setProcessingTradeId(null);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getTimeRemaining = (endsAt: string) => {
    const now = new Date().getTime();
    const endTime = new Date(endsAt).getTime();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading pending trades...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Trade Management</h1>
          <p className="text-muted-foreground">Review and confirm pending trades</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Trades ({pendingTrades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending trades at the moment
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Leverage</TableHead>
                      <TableHead>Entry Price</TableHead>
                      <TableHead>Profit Rate</TableHead>
                      <TableHead>Expected Profit</TableHead>
                      <TableHead>Time Remaining</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTrades.map((trade) => {
                      const expectedProfit = trade.stake_amount * (trade.profit_rate / 100);
                      const timeRemaining = getTimeRemaining(trade.ends_at);
                      const isExpired = timeRemaining === 'Expired';
                      
                      return (
                        <TableRow key={trade.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {trade.profiles?.first_name} {trade.profiles?.last_name}
                              </div>
                              {trade.profiles?.username && (
                                <div className="text-sm text-muted-foreground">
                                  @{trade.profiles.username}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{trade.trading_pair}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={trade.direction === 'LONG' ? 'default' : 'destructive'}
                              className={trade.direction === 'LONG' ? 'bg-green-600' : 'bg-red-600'}
                            >
                              {trade.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {trade.stake_amount}
                            </div>
                          </TableCell>
                          <TableCell>{trade.leverage}x</TableCell>
                          <TableCell>${trade.entry_price.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">
                              {trade.profit_rate}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">
                              ${expectedProfit.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                              {timeRemaining}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatTime(trade.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleTradeDecision(trade.id, 'win')}
                                disabled={processingTradeId === trade.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                WIN
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleTradeDecision(trade.id, 'lose')}
                                disabled={processingTradeId === trade.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                LOSE
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTrades;