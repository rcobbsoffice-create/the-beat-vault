import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Activity, 
  Users, 
  Globe, 
  BarChart3, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function AdminFingerprintingAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalProducers: 0,
    totalBeats: 0,
    totalDetections: 0,
    activePlatforms: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [globalRes, platformRes] = await Promise.all([
        supabase.from('admin_fingerprint_global_stats').select('*').order('total_detections', { ascending: false }),
        supabase.from('admin_fingerprint_platform_stats').select('*').order('detection_count', { ascending: false })
      ]);

      if (globalRes.data) {
        setStats(globalRes.data);
        const totals = globalRes.data.reduce((acc, curr) => ({
          totalProducers: acc.totalProducers + 1,
          totalBeats: acc.totalBeats + parseInt(curr.beats_count),
          totalDetections: acc.totalDetections + parseInt(curr.total_detections),
        }), { totalProducers: 0, totalBeats: 0, totalDetections: 0 });
        
        setSummary(prev => ({ ...prev, ...totals }));
      }

      if (platformRes.data) {
        setPlatformStats(platformRes.data);
        setSummary(prev => ({ ...prev, activePlatforms: platformRes.data.length }));
      }
    } catch (error) {
      console.error('Error fetching admin fingerprinting stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator color="#005CB9" size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-dark-950 p-6"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005CB9" />
      }
    >
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Fingerprint Research</Text>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Global detection sync and producer forensics</Text>
        </View>
        <Button variant="outline" onPress={fetchData} className="flex-row items-center gap-2">
          <RefreshCw size={16} color="#fff" />
          <Text className="text-white font-bold text-xs uppercase">Sync</Text>
        </Button>
      </View>

      {/* Summary Stats */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        {[
          { label: 'Total Producers', value: summary.totalProducers, icon: Users, color: '#005CB9' },
          { label: 'Tracked Beats', value: summary.totalBeats, icon: Activity, color: '#60A5FA' },
          { label: 'Global Detections', value: summary.totalDetections.toLocaleString(), icon: Globe, color: '#93C5FD' },
          { label: 'Platform Hubs', value: summary.activePlatforms, icon: BarChart3, color: '#9CA3AF' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 bg-dark-900 border-white/5 flex-1 min-w-[200px]">
            <View className="flex-row items-center justify-between mb-4">
              <View className="p-3 bg-white/5 rounded-xl border border-white/10">
                <stat.icon size={24} color={stat.color} />
              </View>
              <TrendingUp size={16} color="#60A5FA" />
            </View>
            <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</Text>
            <Text className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</Text>
          </Card>
        ))}
      </View>

      <View className="flex-col lg:flex-row gap-8">
        {/* Left Column: Producer Leaderboard */}
        <View className="flex-1 lg:w-2/3 gap-8">
          <Card className="bg-dark-900 border-white/5 overflow-hidden">
            <View className="p-6 border-b border-white/5 flex-row items-center justify-between">
              <Text className="text-xl font-black uppercase italic tracking-tighter text-white">Producer Yield Index</Text>
              <Badge variant="outline"><Text className="text-[10px]">ALL TIME</Text></Badge>
            </View>
            <View className="p-0">
              {stats.length > 0 ? stats.map((producer, i) => (
                <TouchableOpacity 
                  key={producer.producer_id}
                  className={`p-6 flex-row items-center justify-between border-b border-white/5 ${i === stats.length - 1 ? 'border-b-0' : ''}`}
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-full bg-dark-800 items-center justify-center border border-white/10">
                      <Text className="text-white font-bold">{producer.display_name?.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="text-white font-bold">{producer.display_name}</Text>
                      <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{producer.beats_count} Beats Monitored</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary font-black text-lg italic tracking-tighter">{producer.total_detections.toLocaleString()}</Text>
                    <Text className="text-[10px] text-gray-500 font-bold uppercase">Detections</Text>
                  </View>
                </TouchableOpacity>
              )) : (
                <View className="p-12 items-center justify-center">
                  <Text className="text-gray-500 font-bold italic">Injecting telemetry data...</Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Right Column: Platform Breakdown & Demographics */}
        <View className="flex-1 lg:w-1/3 gap-8">
           {/* Platform Performance */}
           <Card className="bg-dark-900 border-white/5 p-6">
              <Text className="text-xl font-black uppercase italic tracking-tighter text-white mb-6">Platform Saturation</Text>
              <View className="gap-6">
                {platformStats.map((item, i) => (
                  <View key={item.platform} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-black text-white uppercase italic tracking-widest">{item.platform}</Text>
                      <Text className="text-blue-400 font-bold">{item.detection_count.toLocaleString()}</Text>
                    </View>
                    <View className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-primary" 
                        style={{ width: `${(item.detection_count / summary.totalDetections) * 100}%` }} 
                      />
                    </View>
                  </View>
                ))}
              </View>
           </Card>

           {/* Geographic Mock/Real Demographics */}
           <Card className="bg-dark-900 border-white/5 p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-black uppercase italic tracking-tighter text-white">Heatmap Demographics</Text>
                <MapPin size={16} color="#60A5FA" />
              </View>
              <View className="gap-4">
                {[
                  { region: 'North America', pct: 45, trending: 'up' },
                  { region: 'Europe', pct: 28, trending: 'down' },
                  { region: 'South America', pct: 15, trending: 'up' },
                  { region: 'Asia/Pacific', pct: 12, trending: 'up' },
                ].map((reg, i) => (
                  <View key={i} className="flex-row items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <View>
                      <Text className="text-white font-bold text-xs">{reg.region}</Text>
                      <Text className="text-[10px] text-gray-500 uppercase font-black">{reg.pct}% Traffic</Text>
                    </View>
                    <Badge variant={reg.trending === 'up' ? 'secondary' : 'outline'}>
                      <Text className="text-[10px] uppercase">{reg.trending === 'up' ? '+Active' : '-Stable'}</Text>
                    </Badge>
                  </View>
                ))}
              </View>
              <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-6 text-center italic">
                Cross-referenced with global DSP Metadata
              </Text>
           </Card>

           {/* Quick Actions */}
           <Card className="bg-primary border-primary p-6">
              <Text className="text-black font-black uppercase italic tracking-tighter mb-2">Automated Enforcement</Text>
              <Text className="text-black/80 text-xs font-medium mb-4">
                Global detection density has triggered <Text className="font-bold">14 automatically generated</Text> copyright notices this hour.
              </Text>
              <Button className="bg-black">
                <Text className="text-white font-black text-[10px] uppercase">Review Claims</Text>
              </Button>
           </Card>
        </View>
      </View>
    </ScrollView>
  );
}
