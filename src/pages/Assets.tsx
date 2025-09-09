import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, CreditCard, Lock, ArrowUpRight, ArrowDownLeft, AlertCircle, Clock, Upload } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
interface UserBalance {
  balance: number;
  on_hold: number;
  frozen: number;
  currency: string;
}
interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  currency: string;
  payment_method: string;
  description: string;
  created_at: string;
}
const Assets = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeCode, setRechargeCode] = useState("");
  const [withdrawalCode, setWithdrawalCode] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserBalance();
      fetchTransactions();

      // Set up real-time subscription for withdraw_requests
      const channel = supabase.channel('withdraw_requests_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdraw_requests',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('Withdrawal request update:', payload);
        
        // Handle real-time notifications based on status changes
        if (payload.eventType === 'UPDATE') {
          const newRecord = payload.new;
          const oldRecord = payload.old;
          
          // Check if status changed from pending to approved/rejected
          if (oldRecord.status === 'pending' && newRecord.status === 'approved') {
            setNotification({
              type: 'success',
              message: `Successful! Your withdrawal code is: ${newRecord.withdraw_code}`
            });
            // Auto-hide after 10 seconds
            setTimeout(() => setNotification(null), 10000);
          } else if (oldRecord.status === 'pending' && newRecord.status === 'rejected') {
            setNotification({
              type: 'error',
              message: `Withdrawal rejected. ${newRecord.admin_notes || 'Please contact support for more information.'}`
            });
            // Auto-hide after 10 seconds
            setTimeout(() => setNotification(null), 10000);
          }
        }
        
        // Refresh transactions and balance when withdrawal request status changes
        fetchTransactions();
        fetchUserBalance();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  const fetchUserBalance = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('user_balances').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      if (data) {
        setUserBalance({
          balance: parseFloat(String(data.balance || 0)),
          on_hold: parseFloat(String(data.on_hold || 0)),
          frozen: parseFloat(String(data.frozen || 0)),
          currency: data.currency || 'USDT'
        });
      } else {
        // No balance record exists yet
        setUserBalance({
          balance: 0,
          on_hold: 0,
          frozen: 0,
          currency: 'USDT'
        });
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch balance information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchTransactions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('transactions').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive"
      });
    }
  };
  const handleRechargeCode = async () => {
    if (!rechargeCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recharge code",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    try {
      // Use the secure RPC function to redeem the code atomically
      const {
        data,
        error
      } = await supabase.rpc('redeem_recharge_code', {
        p_code: rechargeCode.trim(),
        p_user_id: user?.id
      });
      if (error) {
        const errorMessage = error.message === "Invalid recharge code" ? "Wrong recharge code, please enter the correct code." : error.message === "Recharge code has already been redeemed" ? "This recharge code has already been used." : "Failed to process recharge code. Please try again.";
        throw new Error(errorMessage);
      }
      if (data && data.length > 0) {
        const {
          amount
        } = data[0];
        await fetchUserBalance();
        await fetchTransactions();
        setRechargeCode("");
        toast({
          title: "Success",
          description: `Successfully redeemed ${amount} USDT with code ${rechargeCode}`
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem recharge code",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleWithdrawalRequest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to request a withdrawal",
        variant: "destructive"
      });
      return;
    }
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }
    if (amount > (userBalance?.balance || 0)) {
      toast({
        title: "Error",
        description: "Insufficient balance for this withdrawal amount",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    try {
      const {
        error
      } = await supabase.from('withdraw_requests').insert({
        user_id: user.id,
        amount: amount
      });
      if (error) {
        throw error;
      }
      setNotification({
        type: 'info',
        message: `Processing your withdrawal of ${amount.toFixed(2)} USDT. It will be completed shortly.`
      });
      setWithdrawalAmount("");
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleWithdrawalCode = async () => {
    if (!withdrawalCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a withdrawal code",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    try {
      // Simulate code verification - in real app, this would call an API
      // For demo purposes, we'll accept any code starting with "WC"
      if (!withdrawalCode.toUpperCase().startsWith('WC')) {
        throw new Error('Invalid withdrawal code format');
      }

      // Simulate withdrawing $50 for demo
      const withdrawalAmount = 50;
      if (userBalance && userBalance.balance < withdrawalAmount) {
        throw new Error('Insufficient balance for withdrawal');
      }
      const {
        error
      } = await supabase.from('transactions').insert({
        user_id: user?.id,
        type: 'withdrawal',
        amount: withdrawalAmount,
        status: 'pending',
        payment_method: 'withdrawal_code',
        external_transaction_id: withdrawalCode,
        description: `Withdrawal code redemption: ${withdrawalCode}`
      });
      if (error) throw error;
      await fetchUserBalance();
      await fetchTransactions();
      setWithdrawalCode("");
      toast({
        title: "Success",
        description: `Withdrawal of ${withdrawalAmount} USDT initiated with code ${withdrawalCode}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem withdrawal code",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen">
      <Header />
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Manage your portfolio and account balance</p>
        </div>

        {/* Notification Bar */}
        {notification && (
          <div className={`p-4 rounded-lg border ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          } flex items-center justify-between`}>
            <p className="font-medium">{notification.message}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotification(null)}
              className="h-auto p-1 hover:bg-transparent"
            >
              ✕
            </Button>
          </div>
        )}

        {/* Asset Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {userBalance?.balance.toFixed(2) || '0.00'} USDT
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for trading and withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {userBalance?.on_hold.toFixed(2) || '0.00'} USDT
              </div>
              <p className="text-xs text-muted-foreground">
                Temporarily held for processing
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frozen</CardTitle>
              <Lock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {userBalance?.frozen.toFixed(2) || '0.00'} USDT
              </div>
              <p className="text-xs text-muted-foreground">
                Locked or restricted funds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Total Portfolio Value */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {((userBalance?.balance || 0) + (userBalance?.on_hold || 0) + (userBalance?.frozen || 0)).toFixed(2)} USDT
            </div>
            <div className="flex gap-4 mt-4">
              <Badge variant="secondary">
                Currency: {userBalance?.currency || 'USDT'}
              </Badge>
              <Badge variant="outline">
                Last Updated: {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Code Redemption Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recharge Code */}
          <Card className="glass-card border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <ArrowDownLeft className="h-5 w-5" />
                Redeem Recharge Code
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add funds to your account using a recharge code
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recharge-code">Recharge Code</Label>
                <Input id="recharge-code" placeholder="Enter your Supabase-generated recharge code" value={rechargeCode} onChange={e => setRechargeCode(e.target.value)} className="font-mono" />
              </div>
              <Button onClick={handleRechargeCode} disabled={isProcessing || !rechargeCode.trim()} className="w-full bg-green-600 hover:bg-green-700">
                {isProcessing ? "Processing..." : "Redeem Recharge Code"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Enter your Supabase-generated recharge code here
              </p>
            </CardContent>
          </Card>

          {/* Redeem Recharge Code for Withdrawal */}
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Upload className="h-5 w-5" />
                Redeem Withdrawal Code
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Submit a withdrawal request to be processed by admin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount">Withdrawal Amount (USDT)</Label>
                <Input id="withdrawal-amount" type="number" placeholder="Enter amount to withdraw" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} min="0" max={userBalance?.balance || 0} step="0.01" />
              </div>
              <div className="text-sm text-muted-foreground">
                Available balance: {userBalance?.balance.toFixed(2) || '0.00'} USDT
              </div>
              <Button onClick={handleWithdrawalRequest} disabled={isProcessing || !withdrawalAmount.trim() || parseFloat(withdrawalAmount) <= 0} className="w-full bg-blue-600 hover:bg-blue-700">
                {isProcessing ? "Processing..." : "Redeem Withdrawal Code"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Your request will be reviewed and processed by an administrator
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Transaction History */}
        <Card className="glass-card border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Recent transactions and account activity
            </p>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} {transaction.currency || 'USDT'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {transaction.description || 'No description'}
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table> : <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground">Your transaction history will appear here</p>
              </div>}
          </CardContent>
        </Card>

        <Separator />

        {/* Additional Info */}
        <Card className="glass-card border-muted/20">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">Fund Processing Times</p>
                <p className="text-sm text-muted-foreground">Recharge codes are processed instantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">Security Notice</p>
                <p className="text-sm text-muted-foreground">
                  Never share your redemption codes with anyone. Keep them secure until ready to use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>;
};
export default Assets;