import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const TradesPage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
        <p className="text-gray-600">Monitor and manage trading activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trade Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Trade management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};