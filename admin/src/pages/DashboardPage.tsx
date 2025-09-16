import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTrades: number;
  totalBalance: number;
  pendingTrades: number;
  myUsers?: number;
  myTrades?: number;
}

export const DashboardPage: React.FC = () => {
  const { adminProfile, isSuperAdmin } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTrades: 0,
    totalBalance: 0,
    pendingTrades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isSuperAdmin) {
          // Super admin sees all data
          const [usersResult, tradesResult, balancesResult, pendingResult] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact' }),
            supabase.from('trades').select('id', { count: 'exact' }),
            supabase.from('user_balances').select('balance'),
            supabase.from('trades').select('id', { count: 'exact' }).eq('status', 'pending'),
          ]);

          const totalBalance = balancesResult.data?.reduce((sum, balance) => sum + (balance.balance || 0), 0) || 0;

          setStats({
            totalUsers: usersResult.count || 0,
            totalTrades: tradesResult.count || 0,
            totalBalance: totalBalance,
            pendingTrades: pendingResult.count || 0,
          });
        } else {
          // Regular admin sees only their assigned users' data
          const assignedUsersResult = await supabase.rpc('get_admin_assigned_users', {
            p_admin_user_id: adminProfile?.user_id
          });

          if (assignedUsersResult.data && assignedUsersResult.data.length > 0) {
            const userIds = assignedUsersResult.data.map((u: any) => u.user_id);

            const [tradesResult, balancesResult, pendingResult] = await Promise.all([
              supabase.from('trades').select('id', { count: 'exact' }).in('user_id', userIds),
              supabase.from('user_balances').select('balance').in('user_id', userIds),
              supabase.from('trades').select('id', { count: 'exact' }).in('user_id', userIds).eq('status', 'pending'),
            ]);

            const totalBalance = balancesResult.data?.reduce((sum, balance) => sum + (balance.balance || 0), 0) || 0;

            setStats({
              totalUsers: userIds.length,
              totalTrades: tradesResult.count || 0,
              totalBalance: totalBalance,
              pendingTrades: pendingResult.count || 0,
              myUsers: userIds.length,
              myTrades: tradesResult.count || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (adminProfile) {
      fetchStats();
    }
  }, [adminProfile, isSuperAdmin]);

  const statCards = [
    {
      title: isSuperAdmin ? 'Total Users' : 'My Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: isSuperAdmin ? 'Total Trades' : 'My Trades',
      value: stats.totalTrades,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Balance',
      value: `$${stats.totalBalance.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Pending Trades',
      value: stats.pendingTrades,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {adminProfile?.full_name || adminProfile?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {typeof card.value === 'string' ? card.value : card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Super Admin Access</h3>
          <p className="text-blue-700 text-sm">
            You have full access to all users, trades, and system settings.
          </p>
        </div>
      )}
    </div>
  );
};