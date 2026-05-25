import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CoinIcon } from "@/components/deposit/CoinIcon";

interface DepositRow {
  id: string;
  coin: string;
  network: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  screenshot_url: string | null;
}

const statusVariant: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

const DepositHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DepositRow[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("deposit_requests")
        .select("id, coin, network, amount, status, admin_note, created_at, screenshot_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      setRows((data as DepositRow[]) || []);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel("deposit_requests_user")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "deposit_requests", filter: `user_id=eq.${user.id}` },
        () => load()
      ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Transaction ID copied");
  };

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

      <main className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Deposit History</h1>
            <p className="text-sm text-muted-foreground mt-1">Track the status of your deposit requests</p>
          </div>
          <Button asChild>
            <Link to="/deposit/channels"><Plus className="h-4 w-4 mr-1" /> New Deposit</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : rows.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No deposits yet. <Link to="/deposit/channels" className="text-primary underline">Make your first deposit</Link>
            </Card>
          ) : (
            rows.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start gap-4">
                  <CoinIcon coin={r.coin} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{r.amount} {r.coin}</span>
                      <Badge variant="outline" className="text-[10px]">{r.network}</Badge>
                      <Badge className={`text-[10px] border ${statusVariant[r.status]}`}>{r.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                    {r.admin_note && (
                      <div className="text-xs mt-2 p-2 rounded bg-muted/50 border border-border">
                        <span className="font-semibold">Note:</span> {r.admin_note}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => copyId(r.id)}
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-2"
                    >
                      <Copy className="h-3 w-3" /> {r.id.slice(0, 8)}…
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DepositHistory;
