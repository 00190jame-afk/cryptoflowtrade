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
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, TrendingUp, Ticket, CreditCard, ArrowDownToLine,
  MessageSquare, LogOut, RefreshCw, Plus, Send, Check, X,
  DollarSign, Shield, Settings, BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { adminProfile } = useAdminRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTrades, setAllTrades] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [tradeRules, setTradeRules] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [rechargeCodes, setRechargeCodes] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [adminInviteCodes, setAdminInviteCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [editingUser, setEditingUser] = useState<any>(null);
  const [balanceForm, setBalanceForm] = useState({ balance: 0, frozen: 0, on_hold: 0, description: "" });
  const [messageUser, setMessageUser] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({ min_stake: 0, max_stake: 0, profit_rate: 0 });

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalTrades: 0, totalBalance: 0, pendingWithdrawals: 0 });

  const fetchAllUsers = useCallback(async () => {
    const { data: profiles } = await supabase.from("profiles").select("user_id, email, full_name, created_at").order("created_at", { ascending: false });
    const { data: balances } = await supabase.from("user_balances").select("user_id, balance, frozen, on_hold");
    const combined = (profiles || []).map((p) => {
      const bal = (balances || []).find((b) => b.user_id === p.user_id);
      return { ...p, balance: bal?.balance ?? 0, frozen: bal?.frozen ?? 0, on_hold: bal?.on_hold ?? 0 };
    });
    setAllUsers(combined);
    const totalBalance = combined.reduce((sum, u) => sum + (u.balance || 0), 0);
    setStats((s) => ({ ...s, totalUsers: combined.length, totalBalance }));
  }, []);

  const fetchAllTrades = useCallback(async () => {
    const { data } = await supabase.from("trades").select("*").in("status", ["pending", "active"]).order("created_at", { ascending: false });
    setAllTrades(data || []);
    setStats((s) => ({ ...s, totalTrades: (data || []).length }));
  }, []);

  const fetchAdmins = useCallback(async () => {
    const { data } = await supabase.from("admin_profiles").select("*").order("created_at", { ascending: false });
    setAdmins(data || []);
  }, []);

  const fetchTradeRules = useCallback(async () => {
    const { data } = await supabase.from("trade_rules").select("*").order("created_at", { ascending: false });
    setTradeRules(data || []);
  }, []);

  const fetchInviteCodes = useCallback(async () => {
    const { data } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
    setInviteCodes(data || []);
  }, []);

  const fetchRechargeCodes = useCallback(async () => {
    const { data } = await supabase.from("recharge_codes").select("*").order("created_at", { ascending: false });
    setRechargeCodes(data || []);
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    const { data } = await supabase.from("withdraw_requests").select("*").order("created_at", { ascending: false });
    setWithdrawals(data || []);
    setStats((s) => ({ ...s, pendingWithdrawals: (data || []).filter((w) => w.status === "pending").length }));
  }, []);

  const fetchAdminInviteCodes = useCallback(async () => {
    const { data } = await supabase.from("admin_invite_codes").select("*").order("created_at", { ascending: false });
    setAdminInviteCodes(data || []);
  }, []);

  useEffect(() => {
    fetchAllUsers();
    fetchAllTrades();
    fetchWithdrawals();
  }, [fetchAllUsers, fetchAllTrades, fetchWithdrawals]);

  useEffect(() => {
    if (activeTab === "admins") { fetchAdmins(); fetchAdminInviteCodes(); }
    if (activeTab === "rules") fetchTradeRules();
    if (activeTab === "invite") fetchInviteCodes();
    if (activeTab === "recharge") fetchRechargeCodes();
  }, [activeTab, fetchAdmins, fetchAdminInviteCodes, fetchTradeRules, fetchInviteCodes, fetchRechargeCodes]);

  const handleUpdateBalance = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      await supabase.rpc("admin_update_user_balance", {
        p_user_id: editingUser.user_id,
        p_balance: balanceForm.balance,
        p_frozen: balanceForm.frozen,
        p_on_hold: balanceForm.on_hold,
        p_description: balanceForm.description || "Super Admin balance update",
      });
      toast({ title: "Balance updated" });
      setEditingUser(null);
      fetchAllUsers();
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
      fetchAllTrades();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleToggleAdmin = async (adminId: string, isActive: boolean) => {
    setLoading(true);
    try {
      await supabase.from("admin_profiles").update({ is_active: !isActive }).eq("id", adminId);
      toast({ title: `Admin ${isActive ? "deactivated" : "activated"}` });
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleCreateAdminInvite = async (role: string) => {
    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabase.from("admin_invite_codes").insert({
        code,
        role,
        created_by: user?.id,
        is_active: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast({ title: "Admin invite code created", description: code });
      fetchAdminInviteCodes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleUpdateTradeRule = async () => {
    if (!editingRule) return;
    setLoading(true);
    try {
      await supabase.from("trade_rules").update({
        min_stake: ruleForm.min_stake,
        max_stake: ruleForm.max_stake,
        profit_rate: ruleForm.profit_rate,
      }).eq("id", editingRule.id);
      toast({ title: "Trade rule updated" });
      setEditingRule(null);
      fetchTradeRules();
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
      await supabase.from("messages").insert({ user_id: messageUser.user_id, message: messageText, is_read: false });
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
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Super Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{adminProfile?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{stats.totalUsers}</p><p className="text-xs text-muted-foreground">Total Users</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-chart-1" />
            <div><p className="text-2xl font-bold">{stats.totalTrades}</p><p className="text-xs text-muted-foreground">Active Trades</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-chart-2" />
            <div><p className="text-2xl font-bold">${stats.totalBalance.toFixed(0)}</p><p className="text-xs text-muted-foreground">Total Balance</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <ArrowDownToLine className="h-8 w-8 text-chart-3" />
            <div><p className="text-2xl font-bold">{stats.pendingWithdrawals}</p><p className="text-xs text-muted-foreground">Pending Withdrawals</p></div>
          </CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1 hidden md:block" />Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1 hidden md:block" />Users</TabsTrigger>
            <TabsTrigger value="trades"><TrendingUp className="h-4 w-4 mr-1 hidden md:block" />Trades</TabsTrigger>
            <TabsTrigger value="admins"><Shield className="h-4 w-4 mr-1 hidden md:block" />Admins</TabsTrigger>
            <TabsTrigger value="rules"><Settings className="h-4 w-4 mr-1 hidden md:block" />Rules</TabsTrigger>
            <TabsTrigger value="invite"><Ticket className="h-4 w-4 mr-1 hidden md:block" />Invite</TabsTrigger>
            <TabsTrigger value="recharge"><CreditCard className="h-4 w-4 mr-1 hidden md:block" />Recharge</TabsTrigger>
            <TabsTrigger value="withdrawals"><ArrowDownToLine className="h-4 w-4 mr-1 hidden md:block" />Withdrawals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
                <CardContent>
                  {allUsers.slice(0, 5).map((u) => (
                    <div key={u.user_id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{u.full_name || u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="font-mono text-sm">${(u.balance || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Recent Trades</CardTitle></CardHeader>
                <CardContent>
                  {allTrades.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-mono text-sm">{t.trading_pair}</p>
                        <p className="text-xs text-muted-foreground">{t.email || t.user_id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={t.direction === "long" ? "default" : "destructive"} className="text-xs">{t.direction}</Badge>
                        <p className="text-xs mt-1">${t.stake_amount}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Users ({allUsers.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchAllUsers}><RefreshCw className="h-4 w-4" /></Button>
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
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-mono text-xs">{u.email || "N/A"}</TableCell>
                          <TableCell>{u.full_name || "—"}</TableCell>
                          <TableCell>${(u.balance ?? 0).toFixed(2)}</TableCell>
                          <TableCell>${(u.frozen ?? 0).toFixed(2)}</TableCell>
                          <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="space-x-1">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingUser(u);
                              setBalanceForm({ balance: u.balance ?? 0, frozen: u.frozen ?? 0, on_hold: u.on_hold ?? 0, description: "" });
                            }}><DollarSign className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => setMessageUser(u)}>
                              <Send className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle>Active Trades ({allTrades.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchAllTrades}><RefreshCw className="h-4 w-4" /></Button>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTrades.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs">{t.email || t.user_id.slice(0, 8)}</TableCell>
                          <TableCell className="font-mono">{t.trading_pair}</TableCell>
                          <TableCell><Badge variant={t.direction === "long" ? "default" : "destructive"}>{t.direction}</Badge></TableCell>
                          <TableCell>${t.stake_amount}</TableCell>
                          <TableCell>{t.leverage}x</TableCell>
                          <TableCell><Badge variant={t.decision === "win" ? "default" : "secondary"}>{t.decision || "none"}</Badge></TableCell>
                          <TableCell>
                            {!t.decision && (
                              <Button size="sm" onClick={() => handleSetWin(t.id)} disabled={loading}>
                                <Check className="h-3 w-3 mr-1" /> Win
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {allTrades.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No active trades</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Admin Profiles</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchAdmins}><RefreshCw className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Invite Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs">{a.email}</TableCell>
                            <TableCell>{a.full_name || "—"}</TableCell>
                            <TableCell><Badge>{a.role}</Badge></TableCell>
                            <TableCell className="font-mono text-xs">{a.primary_invite_code || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={a.is_active ? "default" : "secondary"}>
                                {a.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant={a.is_active ? "destructive" : "default"} onClick={() => handleToggleAdmin(a.id, a.is_active)} disabled={loading || a.user_id === user?.id}>
                                {a.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Admin Invite Codes</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleCreateAdminInvite("admin")} disabled={loading}>
                      <Plus className="h-4 w-4 mr-1" /> Admin Code
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleCreateAdminInvite("super_admin")} disabled={loading}>
                      <Plus className="h-4 w-4 mr-1" /> Super Admin Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Expires</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminInviteCodes.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono font-bold">{c.code}</TableCell>
                            <TableCell><Badge>{c.role}</Badge></TableCell>
                            <TableCell>
                              <Badge variant={c.is_active && !c.used_by ? "default" : "secondary"}>
                                {c.used_by ? "Used" : c.is_active ? "Active" : "Expired"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</TableCell>
                          </TableRow>
                        ))}
                        {adminInviteCodes.length === 0 && (
                          <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No admin invite codes</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trade Rules Tab */}
          <TabsContent value="rules">
            <Card>
              <CardHeader><CardTitle>Trade Rules</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Min Stake</TableHead>
                        <TableHead>Max Stake</TableHead>
                        <TableHead>Profit Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tradeRules.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>${r.min_stake}</TableCell>
                          <TableCell>${r.max_stake}</TableCell>
                          <TableCell>{(r.profit_rate * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingRule(r);
                              setRuleForm({ min_stake: r.min_stake, max_stake: r.max_stake, profit_rate: r.profit_rate });
                            }}>Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {tradeRules.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No trade rules</TableCell></TableRow>
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
                <CardTitle>All Invite Codes</CardTitle>
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
                        <TableHead>Admin</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inviteCodes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono font-bold">{c.code}</TableCell>
                          <TableCell className="text-xs">{c.admin_name || "—"}</TableCell>
                          <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Used"}</Badge></TableCell>
                          <TableCell>{c.current_uses || 0}/{c.max_uses || "∞"}</TableCell>
                          <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle>All Recharge Codes</CardTitle>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Amount" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} className="w-28" />
                  <Button size="sm" onClick={handleGenerateRechargeCode} disabled={loading}><Plus className="h-4 w-4 mr-1" /> Generate</Button>
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
                          <TableCell><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                          <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle>All Withdrawal Requests</CardTitle>
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
                            <Badge variant={w.status === "pending" ? "secondary" : w.status === "approved" ? "default" : "destructive"}>{w.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="space-x-1">
                            {w.status === "pending" && (
                              <>
                                <Button size="sm" variant="default" onClick={() => handleWithdrawalAction(w.id, "approved")} disabled={loading}><Check className="h-3 w-3" /></Button>
                                <Button size="sm" variant="destructive" onClick={() => handleWithdrawalAction(w.id, "rejected")} disabled={loading}><X className="h-3 w-3" /></Button>
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
        </Tabs>
      </div>

      {/* Edit Balance Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Balance - {editingUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Balance ($)</Label><Input type="number" value={balanceForm.balance} onChange={(e) => setBalanceForm({ ...balanceForm, balance: Number(e.target.value) })} /></div>
            <div><Label>Frozen ($)</Label><Input type="number" value={balanceForm.frozen} onChange={(e) => setBalanceForm({ ...balanceForm, frozen: Number(e.target.value) })} /></div>
            <div><Label>On Hold ($)</Label><Input type="number" value={balanceForm.on_hold} onChange={(e) => setBalanceForm({ ...balanceForm, on_hold: Number(e.target.value) })} /></div>
            <div><Label>Description</Label><Input value={balanceForm.description} onChange={(e) => setBalanceForm({ ...balanceForm, description: e.target.value })} placeholder="Reason" /></div>
            <Button onClick={handleUpdateBalance} disabled={loading} className="w-full">Update Balance</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={!!messageUser} onOpenChange={(open) => !open && setMessageUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message - {messageUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Type your message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} />
            <Button onClick={handleSendMessage} disabled={loading || !messageText.trim()} className="w-full"><Send className="h-4 w-4 mr-2" /> Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Trade Rule Dialog */}
      <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Trade Rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Min Stake ($)</Label><Input type="number" value={ruleForm.min_stake} onChange={(e) => setRuleForm({ ...ruleForm, min_stake: Number(e.target.value) })} /></div>
            <div><Label>Max Stake ($)</Label><Input type="number" value={ruleForm.max_stake} onChange={(e) => setRuleForm({ ...ruleForm, max_stake: Number(e.target.value) })} /></div>
            <div><Label>Profit Rate (decimal)</Label><Input type="number" step="0.01" value={ruleForm.profit_rate} onChange={(e) => setRuleForm({ ...ruleForm, profit_rate: Number(e.target.value) })} /></div>
            <Button onClick={handleUpdateTradeRule} disabled={loading} className="w-full">Update Rule</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
