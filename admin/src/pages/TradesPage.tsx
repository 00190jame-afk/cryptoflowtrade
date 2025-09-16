import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Clock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface Trade {
  id: string;
  user_id: string;
  email: string;
  trading_pair: string;
  direction: string;
  stake_amount: number;
  leverage: number;
  entry_price: number;
  current_price: number;
  status: string;
  status_indicator: string;
  profit_loss_amount: number;
  created_at: string;
  completed_at: string;
  ends_at: string;
}

export const TradesPage: React.FC = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchTrades();
  }, [isSuperAdmin, filter]);

  const fetchTrades = async () => {
    try {
      console.log('Fetching trades...');
      let query = supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        if (filter === 'pending') {
          query = query.eq('status', 'pending');
        } else {
          query = query.in('status', ['win', 'lose']);
        }
      }

      const { data, error } = await query;
      console.log('Trades response:', { data, error });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTradeStatus = async (tradeId: string, newStatus: 'win' | 'lose') => {
    try {
      const { error } = await supabase
        .from('trades')
        .update({ 
          status: newStatus,
          completed_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (error) throw error;
      
      // Refresh trades
      await fetchTrades();
    } catch (error) {
      console.error('Error updating trade:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
        <p className="text-gray-600">Monitor and manage trading activities</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Trades
        </Button>
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trade History ({trades.length} trades)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Pair</th>
                  <th className="text-left p-2">Direction</th>
                  <th className="text-left p-2">Stake</th>
                  <th className="text-left p-2">Leverage</th>
                  <th className="text-left p-2">Entry Price</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">P&L</th>
                  <th className="text-left p-2">Created</th>
                  {isSuperAdmin && <th className="text-left p-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">
                      {trade.email || `User ${trade.user_id.slice(0, 8)}...`}
                    </td>
                    <td className="p-2 font-medium">{trade.trading_pair}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trade.direction === 'up' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2">${trade.stake_amount}</td>
                    <td className="p-2">{trade.leverage}x</td>
                    <td className="p-2">${trade.entry_price}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trade.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : trade.status === 'win'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className={`p-2 font-medium ${
                      trade.profit_loss_amount > 0 ? 'text-green-600' : 
                      trade.profit_loss_amount < 0 ? 'text-red-600' : ''
                    }`}>
                      {trade.profit_loss_amount ? `$${trade.profit_loss_amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {new Date(trade.created_at).toLocaleDateString()}
                    </td>
                    {isSuperAdmin && (
                      <td className="p-2">
                        {trade.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => updateTradeStatus(trade.id, 'win')}
                            >
                              Win
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => updateTradeStatus(trade.id, 'lose')}
                            >
                              Lose
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {trades.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No trades found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};