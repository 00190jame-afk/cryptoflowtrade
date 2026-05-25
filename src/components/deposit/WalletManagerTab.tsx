import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Wallet {
  id: string;
  coin: string;
  network: string;
  wallet_address: string;
  qr_code_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const WalletManagerTab = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ coin: "", network: "", wallet_address: "" });
  const [qrFile, setQrFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("deposit_wallets")
      .select("*")
      .order("created_at", { ascending: false });
    setWallets((data as Wallet[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ coin: "", network: "", wallet_address: "" }); setQrFile(null); };

  const create = async () => {
    if (!form.coin || !form.network || !form.wallet_address) {
      toast.error("All fields are required"); return;
    }
    setSaving(true);
    try {
      let qr_url: string | null = null;
      if (qrFile) {
        const ext = qrFile.name.split(".").pop() || "png";
        const path = `${form.coin.toUpperCase()}-${form.network}-${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("deposit-qr").upload(path, qrFile, { contentType: qrFile.type });
        if (error) throw error;
        qr_url = supabase.storage.from("deposit-qr").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("deposit_wallets").insert({
        coin: form.coin.toUpperCase().trim(),
        network: form.network.toUpperCase().trim(),
        wallet_address: form.wallet_address.trim(),
        qr_code_url: qr_url,
        created_by: user?.id,
      });
      if (error) throw error;
      toast.success("Wallet added");
      setOpen(false); reset(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const toggle = async (w: Wallet) => {
    const { error } = await supabase.from("deposit_wallets").update({ is_active: !w.is_active }).eq("id", w.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this wallet?")) return;
    const { error } = await supabase.from("deposit_wallets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Deposit Wallets</h3>
          <p className="text-sm text-muted-foreground">Manage wallet addresses shown to users on the deposit pages.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Wallet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Deposit Wallet</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Coin (e.g. USDT)</Label>
                <Input value={form.coin} onChange={(e) => setForm({ ...form, coin: e.target.value })} />
              </div>
              <div>
                <Label>Network (e.g. TRC20, ERC20, BEP20)</Label>
                <Input value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} />
              </div>
              <div>
                <Label>Wallet Address</Label>
                <Input value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} className="font-mono text-xs" />
              </div>
              <div>
                <Label>QR Code Image (optional)</Label>
                <label className="flex items-center gap-2 mt-1 p-3 rounded border border-dashed border-border cursor-pointer hover:border-primary">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">{qrFile ? qrFile.name : "Upload image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setQrFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : wallets.length === 0 ? (
          <div className="text-sm text-muted-foreground">No wallets configured.</div>
        ) : wallets.map((w) => (
          <div key={w.id} className="flex items-center gap-3 p-3 rounded border border-border flex-wrap">
            {w.qr_code_url && <img src={w.qr_code_url} alt="" className="h-10 w-10 rounded bg-white object-contain" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{w.coin}</span>
                <Badge variant="secondary">{w.network}</Badge>
                {!w.is_active && <Badge variant="outline">Inactive</Badge>}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">{w.wallet_address}</div>
            </div>
            <Switch checked={w.is_active} onCheckedChange={() => toggle(w)} />
            <Button variant="ghost" size="icon" onClick={() => remove(w.id)}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
