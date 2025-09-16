import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Mail, Calendar, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  is_verified: boolean;
  created_at: string;
  balance?: number;
}

export const UsersPage: React.FC = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const ids = (profiles || []).map((p: any) => p.user_id);
      let balancesMap = new Map<string, number>();

      if (ids.length > 0) {
        const { data: balances, error: balancesError } = await supabase
          .from('user_balances')
          .select('user_id, balance')
          .in('user_id', ids);

        if (!balancesError && balances) {
          balances.forEach((b: any) => {
            balancesMap.set(b.user_id, Number(b.balance) || 0);
          });
        }
      }

      const usersWithBalance = (profiles || []).map((user: any) => ({
        ...user,
        balance: balancesMap.get(user.user_id) ?? 0,
      }));

      setUsers(usersWithBalance);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">Manage user accounts and view their information</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User List ({users.length} users)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Verified</th>
                    <th className="text-left p-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                      </td>
                      <td className="p-2 text-sm text-gray-600">{user.email || 'N/A'}</td>
                      <td className="p-2 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                      <td className="p-2 font-medium">${user.balance?.toFixed(2) || '0.00'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};