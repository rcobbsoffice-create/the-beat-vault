import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SplitTree } from '@/components/SplitTree';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  CreditCard,
  ShoppingBag,
  Zap,
  Download
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface Transaction {
  id: string;
  beat_title: string;
  buyer_email: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function ProducerSalesPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    pendingPayout: 0,
    avgSaleValue: 0
  });

  React.useEffect(() => {
    fetchSalesData();
  }, [profile]);

  const fetchSalesData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // Fetch purchases where the beat belongs to this producer
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          amount_paid,
          created_at,
          status,
          beats!inner (
            title,
            producer_id
          ),
          profiles:buyer_id (
            email
          )
        `)
        .eq('beats.producer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTransactions: Transaction[] = (data || []).map((p: any) => ({
        id: p.id,
        beat_title: p.beats.title,
        buyer_email: p.profiles?.email || 'Unknown',
        amount: p.amount_paid,
        status: p.status,
        created_at: p.created_at
      }));

      const totalRevenue = mappedTransactions.reduce((acc, t) => acc + t.amount, 0);
      const totalSales = mappedTransactions.length;
      
      setTransactions(mappedTransactions);
      setStats({
        totalRevenue,
        totalSales,
        pendingPayout: totalRevenue * 0.8, // Example: 80% to producer
        avgSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0
      });
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const demoParties = [
    { name: 'Metro Vibes', role: 'Main Producer', percentage: 70, amount: '20.99', status: 'settled' as const },
    { name: 'Lyricist A', role: 'Songwriter', percentage: 15, amount: '4.50', status: 'pending' as const },
    { name: 'Drum Designer X', role: 'Sound Design', percentage: 10, amount: '3.00', status: 'pending' as const },
    { name: 'AudioGenes', role: 'Platform Fee', percentage: 5, amount: '1.50', status: 'settled' as const },
  ];

  return (
    <ScrollView className="flex-1 bg-dark-950 px-4 py-8">
      {/* Header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Sales & Revenue</Text>
          <Text className="text-gray-400">Track your earnings and manage payout settings</Text>
        </View>
        <View className="flex-row gap-3">
          <Button variant="outline" onPress={handleFilter}>
            <View className="flex-row items-center gap-2">
                <Calendar size={16} color="#005CB9" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest">Last 30 Days</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Summary Cards */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        <Card className="flex-1 min-w-[200px] p-6 border-white/5 bg-dark-900/50">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 rounded-lg bg-green-500/10 items-center justify-center">
              <DollarSign size={20} color="#22C55E" />
            </View>
            <Text className="text-sm text-gray-400 font-medium">Total Revenue</Text>
          </View>
          <Text className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</Text>
          <View className="flex-row items-center gap-1 mt-1">
             <TrendingUp size={12} color="#22C55E" />
             <Text className="text-xs text-green-500 font-bold">+12% from last month</Text>
          </View>
        </Card>

        <Card className="flex-1 min-w-[200px] p-6 border-white/5 bg-dark-900/50">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 rounded-lg bg-primary/10 items-center justify-center">
              <ShoppingBag size={20} color="#005CB9" />
            </View>
            <Text className="text-sm text-gray-400 font-medium">Total Sales</Text>
          </View>
          <Text className="text-2xl font-bold text-white">{stats.totalSales}</Text>
          <Text className="text-xs text-primary font-bold mt-1">+8 new today</Text>
        </Card>

        <Card className="flex-1 min-w-[200px] p-6 border-white/5 bg-dark-900/50">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 rounded-lg bg-secondary/10 items-center justify-center">
              <CreditCard size={20} color="#8A2BE2" />
            </View>
            <Text className="text-sm text-gray-400 font-medium">Pending Payout</Text>
          </View>
          <Text className="text-2xl font-bold text-white">${stats.pendingPayout.toFixed(2)}</Text>
          <Text className="text-xs text-gray-500 font-bold mt-1">Expected: Feb 1st</Text>
        </Card>

        <Card className="flex-1 min-w-[200px] p-6 border-white/5 bg-dark-900/50">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 rounded-lg bg-white/5 items-center justify-center">
              <ArrowUpRight size={20} color="#9CA3AF" />
            </View>
            <Text className="text-sm text-gray-400 font-medium">Avg Sale Value</Text>
          </View>
          <Text className="text-2xl font-bold text-white">${stats.avgSaleValue.toFixed(2)}</Text>
          <Text className="text-xs text-gray-500 font-bold mt-1">Steady performance</Text>
        </Card>
      </View>

      {/* Split Transparency Section */}
      <View className="space-y-4 mb-8">
        <View className="flex-row items-center gap-2">
           <Zap size={20} color="#005CB9" />
           <Text className="text-xl font-bold text-white">Revenue Split Transparency</Text>
        </View>
        <Card className="p-8 bg-dark-900/30 border-white/5">
           <SplitTree totalAmount="29.99" parties={demoParties} />
        </Card>
      </View>

      {/* Main Content Grid */}
      <View className="flex-col lg:flex-row gap-8">
        
        {/* Recent Sales History */}
        <View className="flex-1 space-y-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Recent Transactions</Text>
            <TouchableOpacity onPress={handleExport}>
                <Text className="text-primary font-bold text-xs uppercase tracking-widest">Export Records</Text>
            </TouchableOpacity>
          </View>
          
          <Card className="overflow-hidden border-white/5 bg-dark-900/30">
             <View className="divide-y divide-white/5">
               {transactions.length === 0 ? (
                 <View className="p-8 items-center">
                   <Text className="text-gray-500 italic">No transactions found</Text>
                 </View>
               ) : (
                 transactions.map((t) => (
                   <View key={t.id} className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 rounded bg-dark-800 items-center justify-center">
                           <Text className="text-[10px] font-bold text-gray-500 uppercase">Track</Text>
                        </View>
                        <View>
                          <Text className="font-bold text-white text-sm">{t.beat_title}</Text>
                          <Text className="text-xs text-gray-500 italic">Purchased by {t.buyer_email}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-white">${t.amount.toFixed(2)}</Text>
                        <Text className="text-[10px] text-green-500 font-bold uppercase">{t.status}</Text>
                      </View>
                   </View>
                 ))
               )}
             </View>
          </Card>
        </View>

        {/* Stripe Connectivity */}
        <View className="w-full lg:w-80">
          <Text className="text-xl font-bold text-white mb-4">Stripe Connectivity</Text>
          <Card className="p-6 border-primary/20 bg-primary/5">
             <View className="flex-row items-center gap-3 mb-6">
                <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center">
                   <CreditCard size={24} color="#000" />
                </View>
                <View>
                   <Text className="font-bold text-white">Verified Account</Text>
                   <Text className="text-[10px] text-primary font-bold uppercase tracking-widest">Active</Text>
                </View>
             </View>
             
             <Text className="text-xs text-gray-400 mb-6 leading-relaxed">
               Your account is fully verified and connected to Stripe. Earnings are automatically processed every 7 days.
             </Text>
             
             <Button 
                fullWidth 
                className="bg-primary"
                onPress={handleDashboard}
             >
                <Text className="text-black font-bold text-xs uppercase tracking-widest">View Stripe Dashboard</Text>
             </Button>
          </Card>
        </View>

      </View>
      
      <View className="h-20" />
    </ScrollView>
  );
}
