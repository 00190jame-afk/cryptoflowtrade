import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminInviteCode {
  id: string;
  code: string;
  role: string;
  is_active: boolean;
  expires_at: string | null;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  created_by: string | null;
}

export const InviteCodesPage: React.FC = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [inviteCodes, setInviteCodes] = useState<AdminInviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCodeRole, setNewCodeRole] = useState<'admin' | 'super_admin'>('admin');

  useEffect(() => {
    if (isSuperAdmin) {
      fetchInviteCodes();
    }
  }, [isSuperAdmin]);

  const fetchInviteCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInviteCodes(data || []);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInviteCode = async () => {
    try {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('admin_invite_codes')
        .insert({
          code,
          role: newCodeRole,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      setShowCreateForm(false);
      await fetchInviteCodes();
    } catch (error) {
      console.error('Error creating invite code:', error);
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_invite_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;
      await fetchInviteCodes();
    } catch (error) {
      console.error('Error updating invite code:', error);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Only super admins can manage invite codes.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Invite Codes</h1>
          <p className="text-gray-600">Manage admin invitation codes</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Code
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Invite Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newCodeRole}
                  onChange={(e) => setNewCodeRole(e.target.value as 'admin' | 'super_admin')}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createInviteCode}>Create Code</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invite Codes ({inviteCodes.length} codes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Used By</th>
                  <th className="text-left p-2">Used At</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inviteCodes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono font-bold">{code.code}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        code.role === 'super_admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {code.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        code.used_by 
                          ? 'bg-gray-100 text-gray-800'
                          : code.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {code.used_by ? 'USED' : code.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {code.used_by ? `${code.used_by.slice(0, 8)}...` : '-'}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {code.used_at ? new Date(code.used_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {!code.used_by && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCodeStatus(code.id, code.is_active)}
                        >
                          {code.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inviteCodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No invite codes found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};