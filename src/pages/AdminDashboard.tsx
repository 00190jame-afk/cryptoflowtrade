import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, TrendingUp, Ticket, CreditCard, ArrowDownToLine,
  MessageSquare, LogOut, RefreshCw, Plus, Send, Check, X, DollarSign, Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserWithBalance {
  user_id: string;
  email: string | null;
  full_name: string | null;
  balance: number | null;
  frozen: number | null;
  on_hold: number | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { role, adminProfile } = useAdminRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [rechargeCodes, setRechargeCodes] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Balance edit dialog state
  const [editingUser, setEditingUser] = useState<UserWithBalance | null>(null);
  const [balanceForm, setBalanceForm] = useState({ balance: 0, frozen: 0, on_hold: 0, description: "" });

  // Message dialog state
  const [messageUser, setMessageUser] = useState<UserWithBalance | null>(null);
  const [messageText, setMessageText] = useState("");

  // Recharge code form
  const [rechargeAmount, setRechargeAmount] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    try {
      const { data: assignedUsers } = await supabase.rpc("get_admin_assigned_users", {
        p_admin_user_id: user.id,
      });
      if (!assignedUsers || assignedUsers.length === 0) { setUsers([]); return; }

      const userIds = assignedUsers.map((u: any) => u.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, created_at")
        .in("user_id", userIds);

      const { data: balances } = await supabase
        .from("user_balances")
        .select("user_id, balance, frozen, on_hold")
        .in("user_id", userIds);

      const combined = (profiles || []).map((p) => {
        const bal = (balances || []).find((b) => b.user_id === p.user_id);
        return { ...p, balance: bal?.balance ?? 0, frozen: bal?.frozen ?? 0, on_hold: bal?.on_hold ?? 0 };
      });
      setUsers(combined);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }, [user, toast]);

  const fetchTrades = useCallback(async () => {
    if (!user || users.length === 0) return;
    const userIds = users.map((u) => u.user_id);
    const { data } = await supabase
      .from("trades")
      .select("*")
      .in("user_id", userIds)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false });
    setTrades(data || []);
  }, [user, users]);

  const fetchInviteCodes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    setInviteCodes(data || []);
  }, [user]);

  const fetchRechargeCodes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("recharge_codes")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    setRechargeCodes(data || []);
  }, [user]);

  const fetchWithdrawals = useCallback(async () => {
    if (users.length === 0) return;
    const userIds = users.map((u) => u.user_id);
    const { data } = await supabase
      .from("withdraw_requests")
      .select("*")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });
    setWithdrawals(data || []);
  }, [users]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    if (activeTab === "trades") fetchTrades();
    if (activeTab === "invite") fetchInviteCodes();
    if (activeTab === "recharge") fetchRechargeCodes();
    if (activeTab === "withdrawals") fetchWithdrawals();
  }, [activeTab, fetchTrades, fetchInviteCodes, fetchRechargeCodes, fetchWithdrawals]);

  const handleUpdateBalance = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      await supabase.rpc("admin_update_user_balance", {
        p_user_id: editingUser.user_id,
        p_balance: balanceForm.balance,
        p_frozen: balanceForm.frozen,
        p_on_hold: balanceForm.on_hold,
        p_description: balanceForm.description || "Admin balance update",
      });
      toast({ title: "Balance updated" });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSetWin = async (tradeId: string) => {
    setLoading(true);
    try {
      await supabase.from("trades").update({ decision: "win", modified_by_admin: true }).eq("id", tradeId);
      toast({ title: "Trade set to WIN" });
      fetchTrades();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGenerateInviteCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("generate_invite_code");
      if (error) throw error;
      toast({ title: "Invite code generated", description: data });
      fetchInviteCodes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGenerateRechargeCode = async () => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount))) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: code, error } = await supabase.rpc("generate_recharge_code");
      if (error) throw error;
      // Update the generated code with the amount
      await supabase.from("recharge_codes").update({ amount: Number(rechargeAmount) }).eq("code", code);
      toast({ title: "Recharge code generated", description: `${code} - $${rechargeAmount}` });
      setRechargeAmount("");
      fetchRechargeCodes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!messageUser || !messageText.trim()) return;
    setLoading(true);
    try {
      await supabase.from("messages").insert({
        user_id: messageUser.user_id,
        message: messageText,
        is_read: false,
      });
      toast({ title: "Message sent" });
      setMessageUser(null);
      setMessageText("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleWithdrawalAction = async (id: string, status: string) => {
    setLoading(true);
    try {
      await supabase.from("withdraw_requests").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
      toast({ title: `Withdrawal ${status}` });
      fetchWithdrawals();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{adminProfile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="h-4 w-4 mr-2" /> Back to Home
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">Users</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-chart-1" />
            <div><p className="text-2xl font-bold">{trades.length}</p><p className="text-xs text-muted-foreground">Active Trades</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Ticket className="h-8 w-8 text-chart-2" />
            <div><p className="text-2xl font-bold">{inviteCodes.length}</p><p className="text-xs text-muted-foreground">Invite Codes</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <ArrowDownToLine className="h-8 w-8 text-chart-3" />
            <div><p className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'pending').length}</p><p className="text-xs text-muted-foreground">Pending Withdrawals</p></div>
          </CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="trades"><TrendingUp className="h-4 w-4 mr-1" />Trades</TabsTrigger>
            <TabsTrigger value="invite"><Ticket className="h-4 w-4 mr-1" />Invite</TabsTrigger>
            <TabsTrigger value="recharge"><CreditCard className="h-4 w-4 mr-1" />Recharge</TabsTrigger>
            <TabsTrigger value="withdrawals"><ArrowDownToLine className="h-4 w-4 mr-1" />Withdrawals</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-1" />Messages</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assigned Users</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchUsers}><RefreshCw className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Frozen</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-mono text-xs">{u.email || "N/A"}</TableCell>
                          <TableCell>{u.full_name || "—"}</TableCell>
                          <TableCell>${(u.balance ?? 0).toFixed(2)}</TableCell>
                          <TableCell>${(u.frozen ?? 0).toFixed(2)}</TableCell>
                          <TableCell className="space-x-1">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingUser(u);
                              setBalanceForm({ balance: u.balance ?? 0, frozen: u.frozen ?? 0, on_hold: u.on_hold ?? 0, description: "" });
                            }}>
                              <DollarSign className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setMessageUser(u)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No assigned users</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Trades</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchTrades}><RefreshCw className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Pair</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Stake</TableHead>
                        <TableHead>Leverage</TableHead>
                        <TableHead>Decision</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs">{t.email || t.user_id.slice(0, 8)}</TableCell>
                          <TableCell className="font-mono">{t.trading_pair}</TableCell>
                          <TableCell>
                            <Badge variant={t.direction === "long" ? "default" : "destructive"}>{t.direction}</Badge>
                          </TableCell>
                          <TableCell>${t.stake_amount}</TableCell>
                          <TableCell>{t.leverage}x</TableCell>
                          <TableCell>
                            <Badge variant={t.decision === "win" ? "default" : "secondary"}>
                              {t.decision || "none"}
                            </Badge>
                          </TableCell>
                          <TableCell>{t.status_indicator || t.status}</TableCell>
                          <TableCell>
                            {!t.decision && (
                              <Button size="sm" onClick={() => handleSetWin(t.id)} disabled={loading}>
                                <Check className="h-3 w-3 mr-1" /> Win
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {trades.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No active trades</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invite Codes Tab */}
          <TabsContent value="invite">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invite Codes</CardTitle>
                <Button size="sm" onClick={handleGenerateInviteCode} disabled={loading}>
                  <Plus className="h-4 w-4 mr-1" /> Generate
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inviteCodes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono font-bold">{c.code}</TableCell>
                          <TableCell>
                            <Badge variant={c.is_active ? "default" : "secondary"}>
                              {c.is_active ? "Active" : "Used"}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.current_uses || 0}/{c.max_uses || "∞"}</TableCell>
                          <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {inviteCodes.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No invite codes</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recharge Codes Tab */}
          <TabsContent value="recharge">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recharge Codes</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-28"
                  />
                  <Button size="sm" onClick={handleGenerateRechargeCode} disabled={loading}>
                    <Plus className="h-4 w-4 mr-1" /> Generate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rechargeCodes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono font-bold">{c.code}</TableCell>
                          <TableCell>${c.amount}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {rechargeCodes.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No recharge codes</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Withdrawal Requests</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchWithdrawals}><RefreshCw className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="text-xs">{w.email || w.user_id.slice(0, 8)}</TableCell>
                          <TableCell className="font-bold">${w.amount}</TableCell>
                          <TableCell>
                            <Badge variant={w.status === "pending" ? "secondary" : w.status === "approved" ? "default" : "destructive"}>
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="space-x-1">
                            {w.status === "pending" && (
                              <>
                                <Button size="sm" variant="default" onClick={() => handleWithdrawalAction(w.id, "approved")} disabled={loading}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleWithdrawalAction(w.id, "rejected")} disabled={loading}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {withdrawals.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No withdrawal requests</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Send Messages to Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {users.map((u) => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{u.full_name || u.email || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setMessageUser(u)}>
                        <Send className="h-4 w-4 mr-1" /> Message
                      </Button>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No users to message</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Balance Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Balance - {editingUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Balance ($)</Label>
              <Input type="number" value={balanceForm.balance} onChange={(e) => setBalanceForm({ ...balanceForm, balance: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Frozen ($)</Label>
              <Input type="number" value={balanceForm.frozen} onChange={(e) => setBalanceForm({ ...balanceForm, frozen: Number(e.target.value) })} />
            </div>
            <div>
              <Label>On Hold ($)</Label>
              <Input type="number" value={balanceForm.on_hold} onChange={(e) => setBalanceForm({ ...balanceForm, on_hold: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={balanceForm.description} onChange={(e) => setBalanceForm({ ...balanceForm, description: e.target.value })} placeholder="Reason for update" />
            </div>
            <Button onClick={handleUpdateBalance} disabled={loading} className="w-full">Update Balance</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={!!messageUser} onOpenChange={(open) => !open && setMessageUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message - {messageUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSendMessage} disabled={loading || !messageText.trim()} className="w-full">
              <Send className="h-4 w-4 mr-2" /> Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
