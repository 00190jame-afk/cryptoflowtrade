import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Upload, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CoinIcon } from "@/components/deposit/CoinIcon";

interface Wallet {
  id: string;
  coin: string;
  network: string;
  wallet_address: string;
  qr_code_url: string | null;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const schema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(1_000_000, "Amount too large"),
});

const DepositDetails = () => {
  const { coin } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [networkIdx, setNetworkIdx] = useState(0);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !coin) return;
    (async () => {
      const { data } = await supabase
        .from("deposit_wallets")
        .select("id, coin, network, wallet_address, qr_code_url")
        .ilike("coin", coin)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setWallets((data as Wallet[]) || []);
      setLoading(false);
    })();
  }, [user, coin]);

  const active = useMemo(() => wallets[networkIdx], [wallets, networkIdx]);
  const coinName = (active?.coin || coin || "").toUpperCase();

  const onFile = (f: File | null) => {
    if (!f) { setFile(null); setPreview(null); return; }
    if (!ALLOWED.includes(f.type)) { toast.error("Only JPG, PNG or WEBP images allowed"); return; }
    if (f.size > MAX_SIZE) { toast.error("File must be under 5MB"); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const copy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.wallet_address);
    toast.success("Address copied successfully");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !active) return;
    const parsed = schema.safeParse({ amount: Number(amount) });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!file) { toast.error("Please upload a screenshot of your transfer"); return; }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("deposit-proofs")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("deposit_requests").insert({
        user_id: user.id,
        coin: coinName,
        network: active.network,
        wallet_address: active.wallet_address,
        amount: parsed.data.amount,
        screenshot_url: path,
      });
      if (insErr) throw insErr;

      toast.success("Deposit request submitted! Awaiting approval.");
      navigate("/deposit/history");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-6 pb-2">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/deposit/channels" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Channels
          </Link>
        </Button>
      </div>

      <main className="container mx-auto px-4 pb-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <CoinIcon coin={coinName} />
          <div>
            <h1 className="text-2xl font-bold">Deposit {coinName}</h1>
            {active && <p className="text-sm text-muted-foreground">Network: {active.network}</p>}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : !active ? (
          <Card className="p-6 text-center text-muted-foreground">
            No active wallet configured for {coinName}. Please contact support.
          </Card>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <Card className="p-5 space-y-4">
              {wallets.length > 1 && (
                <div>
                  <Label className="mb-2 block">Network</Label>
                  <Select value={String(networkIdx)} onValueChange={(v) => setNetworkIdx(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {wallets.map((w, i) => (
                        <SelectItem key={w.id} value={String(i)}>{w.network}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col items-center gap-3 py-2">
                {active.qr_code_url ? (
                  <img
                    src={active.qr_code_url}
                    alt={`${coinName} ${active.network} QR`}
                    className="h-48 w-48 rounded-lg border border-border bg-white p-2 object-contain"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                    No QR available
                  </div>
                )}
                <Badge variant="secondary">{active.network}</Badge>
              </div>

              <div>
                <Label className="mb-2 block">Wallet Address</Label>
                <div className="flex gap-2">
                  <Input value={active.wallet_address} readOnly className="font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy address">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <Label htmlFor="amount" className="mb-2 block">Deposit Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label className="mb-2 block">Transfer Screenshot</Label>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-64 w-full object-contain rounded-lg border border-border bg-muted/30" />
                    <Button
                      type="button" variant="secondary" size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => onFile(null)}
                    ><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-border hover:border-primary/60 cursor-pointer transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload (JPG, PNG, WEBP · max 5MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => onFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Deposit"}
              </Button>
            </Card>

            <Card className="p-5 bg-muted/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Only send <strong>{coinName}</strong> over <strong>{active.network}</strong>. Wrong-network deposits may be lost.</p>
                  <p>• Deposits typically require network confirmations before approval.</p>
                  <p>• Upload a clear screenshot of your transfer for faster processing.</p>
                </div>
              </div>
            </Card>
          </form>
        )}
      </main>
    </div>
  );
};

export default DepositDetails;
