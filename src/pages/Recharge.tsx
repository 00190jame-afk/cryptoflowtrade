import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Recharge = () => {
  const [rechargeCode, setRechargeCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to recharge your account.",
        variant: "destructive",
      });
      return;
    }

    if (!rechargeCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recharge code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if code exists and get its details
      const { data: codeData, error: codeError } = await supabase
        .from("recharge_codes")
        .select("*")
        .eq("code", rechargeCode.trim())
        .single();

      if (codeError || !codeData) {
        toast({
          title: "Error",
          description: "Wrong recharge code, please enter the correct code.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (codeData.status === "redeemed") {
        toast({
          title: "Error",
          description: "This recharge code has already been used.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get current user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("user_balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (balanceError) {
        toast({
          title: "Error",
          description: "Failed to fetch your current balance.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const currentBalance = balanceData?.balance || 0;
      const newBalance = Number(currentBalance) + Number(codeData.amount);

      // Update user balance
      const { error: updateBalanceError } = await supabase
        .from("user_balances")
        .update({ balance: newBalance })
        .eq("user_id", user.id);

      if (updateBalanceError) {
        toast({
          title: "Error",
          description: "Failed to update your balance.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Mark code as redeemed
      const { error: updateCodeError } = await supabase
        .from("recharge_codes")
        .update({
          status: "redeemed",
          user_id: user.id,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", codeData.id);

      if (updateCodeError) {
        // Rollback balance update if code update fails
        await supabase
          .from("user_balances")
          .update({ balance: currentBalance })
          .eq("user_id", user.id);

        toast({
          title: "Error",
          description: "Failed to process recharge code.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Success
      toast({
        title: "Success!",
        description: `Your account has been recharged with ${codeData.amount} USDT.`,
      });

      setRechargeCode("");
    } catch (error) {
      console.error("Recharge error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Recharge Account</CardTitle>
              <CardDescription>
                Enter your recharge code to add USDT to your account balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecharge} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rechargeCode">Recharge Code</Label>
                  <Input
                    id="rechargeCode"
                    type="text"
                    placeholder="Enter your recharge code"
                    value={rechargeCode}
                    onChange={(e) => setRechargeCode(e.target.value.toUpperCase())}
                    className="font-mono"
                    maxLength={20}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !rechargeCode.trim()}
                >
                  {isLoading ? "Processing..." : "Recharge Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need help? Contact support for assistance with recharge codes.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Recharge;