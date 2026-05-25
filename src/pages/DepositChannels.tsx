import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CoinIcon } from "@/components/deposit/CoinIcon";

interface Row { coin: string; network: string; }

const DepositChannels = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("deposit_wallets")
        .select("coin, network")
        .eq("is_active", true);
      const map: Record<string, string[]> = {};
      (data as Row[] | null)?.forEach(({ coin, network }) => {
        const c = coin.toUpperCase();
        if (!map[c]) map[c] = [];
        if (!map[c].includes(network)) map[c].push(network);
      });
      setCoins(map);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const entries = Object.entries(coins).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-6 pb-2">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      <main className="container mx-auto px-4 pb-12 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Recharge Channel</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a cryptocurrency to deposit</p>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : entries.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No deposit channels available right now. Please check back later.
            </Card>
          ) : (
            entries.map(([coin, networks]) => (
              <Link key={coin} to={`/deposit/${coin.toLowerCase()}`}>
                <Card className="p-4 flex items-center gap-4 transition-all hover:border-primary/60 hover:bg-accent/30 group">
                  <CoinIcon coin={coin} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{coin}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {networks.map((n) => (
                        <Badge key={n} variant="secondary" className="text-[10px]">{n}</Badge>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DepositChannels;
