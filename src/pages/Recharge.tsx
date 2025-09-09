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
      // Use the secure RPC function to redeem the code atomically
      const { data, error } = await supabase.rpc('redeem_recharge_code', {
        p_code: rechargeCode.trim(),
        p_user_id: user.id
      });

      if (error) {
        toast({
          title: "Error", 
          description: error.message === 'Invalid recharge code' 
            ? "Wrong recharge code, please enter the correct code."
            : error.message === 'Recharge code has already been redeemed'
            ? "This recharge code has already been used."
            : "Failed to redeem recharge code. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const { amount } = data[0];
        toast({
          title: "Success!",
          description: `Your account has been recharged with ${amount} USDT.`,
        });
        setRechargeCode("");
      }
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