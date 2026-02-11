import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  DollarSign, 
  RefreshCw, 
  ArrowUpRight, 
  Activity,
  Zap,
  Target
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export default function AdvancedAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totalStreams, setTotalStreams] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mocking high-frequency data for the "Advanced" feel
      // In a real app, this would query a 'distribution_data' table
      const mockData = [
        { dsp: 'Spotify', stream_count: 1250000, revenue_usd: 5000 },
        { dsp: 'AppleMusic', stream_count: 850000, revenue_usd: 6800 },
        { dsp: 'Tidal', stream_count: 120000, revenue_usd: 1440 },
        { dsp: 'Youtube', stream_count: 5000000, revenue_usd: 5000 },
      ];

      setData(mockData);
      setTotalStreams(mockData.reduce((acc, curr) => acc + curr.stream_count, 0));
      setTotalRevenue(mockData.reduce((acc, curr) => acc + curr.revenue_usd, 0));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="flex-col gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Intelligence / Analytics</Text>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Real-time distribution and financial synthesis</Text>
        </View>

        <View className="flex-row gap-4 self-start">
           <Button 
             variant="outline" 
             className="flex-row gap-2"
             onPress={fetchAnalytics}
           >
             <RefreshCw size={16} color="#fff" />
             <Text className="text-white font-bold text-xs">Re-Sync</Text>
           </Button>
           <Button className="bg-primary">
             <Text className="text-black font-bold text-xs">Export Dossier</Text>
           </Button>
        </View>
      </View>

      {/* Hero Stats */}
      <View className="flex-row flex-wrap gap-4 mb-8">
         {[
           { label: 'Global Streams', value: totalStreams.toLocaleString(), sub: '+12% vs last month', Icon: Activity, color: '#D4AF37' },
           { label: 'Platform Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: 'Estimated Real-time', Icon: DollarSign, color: '#10B981' },
           { label: 'Active DSPs', value: '18', sub: 'Worldwide Distribution', Icon: Globe, color: '#60A5FA' },
           { label: 'Conversion Rate', value: '3.4%', sub: 'Streams to Purchases', Icon: Target, color: '#A78BFA' },
         ].map((stat, i) => (
           <Card key={i} className="p-6 bg-dark-900 border-white/5 flex-1 min-w-[160px]">
              <View className="flex-row items-center justify-between mb-4">
                 <View className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <stat.Icon size={24} color={stat.color} />
                 </View>
                 <ArrowUpRight size={16} color="#10B981" />
              </View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</Text>
              <Text className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</Text>
              <Text className="text-[10px] font-bold mt-2" style={{ color: stat.color }}>{stat.sub}</Text>
           </Card>
         ))}
      </View>

      <View className="gap-8">
        {/* DSP Breakdown */}
        <Card className="p-6 bg-dark-900 border-white/5">
           <View className="flex-row items-center justify-between mb-8">
              <Text className="text-xl font-black uppercase italic tracking-tighter text-white">DSP Performance Flow</Text>
           </View>

           <View className="gap-6">
              {data.map((dsp, i) => (
                <View key={i} className="gap-2">
                   <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                         <Text className="text-sm font-black italic uppercase tracking-widest text-white">{dsp.dsp}</Text>
                         <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{dsp.stream_count.toLocaleString()} Streams</Text>
                      </View>
                      <Text className="text-sm font-black italic text-green-500">+${dsp.revenue_usd}</Text>
                   </View>
                   <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-primary"
                        style={{ width: `${(dsp.stream_count / (totalStreams / 2)) * 100}%` }}
                      />
                   </View>
                </View>
              ))}
           </View>
        </Card>

        {/* Insights */}
        <View className="flex-col md:flex-row gap-4">
           <Card className="p-6 border-primary/20 bg-primary/5 flex-1">
              <Text className="text-sm font-black uppercase italic tracking-widest text-primary mb-2 flex-row items-center gap-2">
                <Zap size={16} color="#D4AF37" /> Optimization Insight
              </Text>
              <Text className="text-xs text-gray-400 font-medium leading-relaxed">
                Your tracks are trending in <Text className="text-white font-bold">Brazil</Text> and <Text className="text-white font-bold">Nigeria</Text>. Consider increasing marketing spend in these regions.
              </Text>
           </Card>
           <Card className="p-6 border-green-500/20 bg-green-500/5 flex-1">
              <Text className="text-sm font-black uppercase italic tracking-widest text-green-500 mb-2 flex-row items-center gap-2">
                <TrendingUp size={16} color="#10B981" /> Growth Path
              </Text>
              <Text className="text-xs text-gray-400 font-medium leading-relaxed">
                Average payout per stream has increased by <Text className="text-white font-bold">0.0002%</Text> this week due to a shift towards premium listeners.
              </Text>
           </Card>
        </View>
      </View>
    </ScrollView>
  );
}
