import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Image as ImageIcon } from "lucide-react";

interface Req {
  id: string;
  user_id: string;
  coin: string;
  network: string;
  wallet_address: string;
  amount: number;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

export const DepositRequestsTab = () => {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [acting, setActing] = useState<{ req: Req; action: "approved" | "rejected" } | null>(null);
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("deposit_requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows((data as Req[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const viewProof = async (path: string) => {
    const { data, error } = await supabase.storage.from("deposit-proofs").createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const submitAction = async () => {
    if (!acting) return;
    if (acting.action === "rejected" && !note.trim()) {
      toast.error("Please provide a note when rejecting"); return;
    }
    const { error } = await supabase.from("deposit_requests")
      .update({ status: acting.action, admin_note: note.trim() || null })
      .eq("id", acting.req.id);
    if (error) return toast.error(error.message);
    toast.success(acting.action === "approved" ? "Deposit approved & balance credited" : "Deposit rejected");
    setActing(null); setNote(""); load();
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Deposit Requests</h3>
          <p className="text-sm text-muted-foreground">Review and approve user-submitted deposits.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No deposit requests.</div>
        ) : rows.map((r) => (
          <div key={r.id} className="p-3 rounded border border-border space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{r.amount} {r.coin}</span>
              <Badge variant="outline" className="text-[10px]">{r.network}</Badge>
              <Badge className={`text-[10px] border ${statusColors[r.status]}`}>{r.status}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono break-all">{r.wallet_address}</div>
            <div className="text-xs text-muted-foreground">User: <span className="font-mono">{r.user_id.slice(0, 8)}…</span></div>
            {r.admin_note && <div className="text-xs p-2 rounded bg-muted/50 border border-border"><span className="font-semibold">Note:</span> {r.admin_note}</div>}
            <div className="flex gap-2 flex-wrap pt-1">
              {r.screenshot_url && (
                <Button size="sm" variant="outline" onClick={() => viewProof(r.screenshot_url!)}>
                  <ImageIcon className="h-3 w-3 mr-1" /> View proof
                </Button>
              )}
              {r.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => { setActing({ req: r, action: "approved" }); setNote(""); }}>
                    <Check className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setActing({ req: r, action: "rejected" }); setNote(""); }}>
                    <X className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!acting} onOpenChange={(v) => { if (!v) setActing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{acting?.action === "approved" ? "Approve Deposit" : "Reject Deposit"}</DialogTitle>
          </DialogHeader>
          {acting && (
            <div className="space-y-3">
              <div className="text-sm">
                Amount: <strong>{acting.req.amount} {acting.req.coin}</strong> · Network: {acting.req.network}
              </div>
              {acting.action === "approved" && (
                <div className="text-xs p-2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  Approving will credit {acting.req.amount} to the user's balance.
                </div>
              )}
              <div>
                <Label>Admin note {acting.action === "rejected" && <span className="text-rose-500">*</span>}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={acting.action === "rejected" ? "Reason for rejection" : "Optional"} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActing(null)}>Cancel</Button>
            <Button onClick={submitAction} variant={acting?.action === "rejected" ? "destructive" : "default"}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
