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
import { Wallet, CreditCard, Lock, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";

interface UserBalance {
  balance: number;
  on_hold: number;
  frozen: number;
  currency: string;
}

const Assets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [rechargeCode, setRechargeCode] = useState("");
  const [withdrawalCode, setWithdrawalCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserBalance();
    }
  }, [user]);

  const fetchUserBalance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserBalance({
          balance: parseFloat(String(data.balance || 0)),
          on_hold: parseFloat(String(data.on_hold || 0)),
          frozen: parseFloat(String(data.frozen || 0)),
          currency: data.currency || 'USD'
        });
      } else {
        // No balance record exists yet
        setUserBalance({
          balance: 0,
          on_hold: 0,
          frozen: 0,
          currency: 'USD'
        });
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch balance information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRechargeCode = async () => {
    if (!rechargeCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recharge code",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate code verification - in real app, this would call an API
      // For demo purposes, we'll accept any code starting with "RC"
      if (!rechargeCode.toUpperCase().startsWith('RC')) {
        throw new Error('Invalid recharge code format');
      }

      // Simulate adding $100 for demo
      const rechargeAmount = 100;
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: 'deposit',
          amount: rechargeAmount,
          status: 'completed',
          payment_method: 'recharge_code',
          external_transaction_id: rechargeCode,
          description: `Recharge code redemption: ${rechargeCode}`
        });

      if (error) throw error;

      await fetchUserBalance();
      setRechargeCode("");
      
      toast({
        title: "Success",
        description: `Successfully redeemed $${rechargeAmount} with code ${rechargeCode}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem recharge code",
        variant: "destructive",
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
        variant: "destructive",
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

      const { error } = await supabase
        .from('transactions')
        .insert({
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
      setWithdrawalCode("");
      
      toast({
        title: "Success",
        description: `Withdrawal of $${withdrawalAmount} initiated with code ${withdrawalCode}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem withdrawal code",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Manage your portfolio and account balance</p>
        </div>

        {/* Asset Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${userBalance?.balance.toFixed(2) || '0.00'}
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
                ${userBalance?.on_hold.toFixed(2) || '0.00'}
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
                ${userBalance?.frozen.toFixed(2) || '0.00'}
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
              ${((userBalance?.balance || 0) + (userBalance?.on_hold || 0) + (userBalance?.frozen || 0)).toFixed(2)}
            </div>
            <div className="flex gap-4 mt-4">
              <Badge variant="secondary">
                Currency: {userBalance?.currency || 'USD'}
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
                <Input
                  id="recharge-code"
                  placeholder="Enter recharge code (e.g., RC123456)"
                  value={rechargeCode}
                  onChange={(e) => setRechargeCode(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={handleRechargeCode}
                disabled={isProcessing || !rechargeCode.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Processing..." : "Redeem Recharge Code"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo: Use codes starting with "RC" (e.g., RC123456)
              </p>
            </CardContent>
          </Card>

          {/* Withdrawal Code */}
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <ArrowUpRight className="h-5 w-5" />
                Redeem Withdrawal Code
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Initiate withdrawal using a withdrawal code
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-code">Withdrawal Code</Label>
                <Input
                  id="withdrawal-code"
                  placeholder="Enter withdrawal code (e.g., WC123456)"
                  value={withdrawalCode}
                  onChange={(e) => setWithdrawalCode(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={handleWithdrawalCode}
                disabled={isProcessing || !withdrawalCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Processing..." : "Redeem Withdrawal Code"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo: Use codes starting with "WC" (e.g., WC123456)
              </p>
            </CardContent>
          </Card>
        </div>

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
                <p className="text-sm text-muted-foreground">
                  Recharge codes are processed instantly. Withdrawal codes may take 1-3 business days to complete.
                </p>
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
  );
};

export default Assets;