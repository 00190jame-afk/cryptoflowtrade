import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const InviteCodesPage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invite Codes</h1>
        <p className="text-gray-600">Manage admin invitation codes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invite Code Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Invite code management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};