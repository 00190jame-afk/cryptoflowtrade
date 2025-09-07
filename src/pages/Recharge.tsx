import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Recharge = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem a recharge code.",
        variant: "destructive"
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a recharge code.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if code exists and get its details
      const { data: rechargeCode, error: fetchError } = await supabase
        .from('recharge_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching recharge code:', fetchError);
        toast({
          title: "Error",
          description: "Failed to validate recharge code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!rechargeCode) {
        toast({
          title: "Invalid Code",
          description: "Wrong recharge code, please enter the correct code.",
          variant: "destructive"
        });
        return;
      }

      if (rechargeCode.status === 'redeemed') {
        toast({
          title: "Code Already Used",
          description: "This recharge code has already been used.",
          variant: "destructive"
        });
        return;
      }

      // Start a transaction to update both tables
      const { error: updateError } = await supabase.rpc('redeem_recharge_code', {
        recharge_code: code.trim().toUpperCase(),
        user_id: user.id
      });

      if (updateError) {
        console.error('Error redeeming code:', updateError);
        toast({
          title: "Error",
          description: "Failed to redeem recharge code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: `Your account has been recharged with ${rechargeCode.amount} USDT.`,
        variant: "default"
      });

      setCode('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Recharge Account</CardTitle>
              <CardDescription>
                Enter your recharge code to add USDT to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecharge} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Recharge Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter your recharge code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="text-center font-mono tracking-wider"
                    maxLength={12}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !code.trim()}
                >
                  {loading ? 'Processing...' : 'Redeem Code'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Recharge;