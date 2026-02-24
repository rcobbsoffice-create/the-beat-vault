import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Music,
  TrendingUp,
  DollarSign,
  Users,
  Play,
  ArrowRight,
  Upload,
  Store,
  BarChart3,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id || profile.role !== 'producer') {
        setIsStatsLoading(false);
        return;
      }

      try {
        // 1. Total Beats
        const { count: beatsCount } = await supabase
          .from('beats')
          .select('*', { count: 'exact', head: true })
          .eq('producer_id', profile.id);

        // 2. Total Sales
        const { data: producerBeats } = await supabase
          .from('beats')
          .select('id')
          .eq('producer_id', profile.id);
        
        const beatIds = producerBeats?.map((b: any) => b.id) || [];
        
        const { data: salesData } = await supabase
          .from('purchases')
          .select('amount_paid')
          .in('beat_id', beatIds);
        
        const totalSalesCents = salesData?.reduce((sum: number, item: any) => sum + item.amount_paid, 0) || 0;
        const totalSalesFormatted = `$${(totalSalesCents / 100).toFixed(2)}`;

        // 3. Total Plays
        // Note: Using a fallback if analytics_events doesn't exist or is restricted
        let playsCount = 0;
        try {
            const { count } = await supabase
              .from('analytics_events' as any)
              .select('*', { count: 'exact', head: true })
              .eq('event_type', 'play')
              .in('beat_id', beatIds);
            playsCount = count || 0;
        } catch (e) {
            // Fallback to sum of play_count from beats
            const { data: beatsWithPlays } = await supabase
                .from('beats')
                .select('play_count')
                .eq('producer_id', profile.id);
            playsCount = beatsWithPlays?.reduce((sum, b) => sum + (b.play_count || 0), 0) || 0;
        }

        setStats([
          { label: 'Total Beats', value: beatsCount?.toString() || '0', icon: Music },
          { label: 'Total Sales', value: totalSalesFormatted, icon: DollarSign },
          { label: 'Total Plays', value: playsCount?.toString() || '0', icon: Play },
          { label: 'Followers', value: '0', icon: Users },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsStatsLoading(false);
      }
    }

    if (profile) fetchStats();
  }, [profile]);

  const dashboardLinks = {
    artist: [
      { name: 'My Library', href: '/dashboard/artist/library', icon: Music, description: 'View purchased beats' },
      { name: 'Favorites', href: '/dashboard/artist/favorites', icon: TrendingUp, description: 'Your saved beats' },
    ],
    producer: [
      { name: 'My Beats', href: '/dashboard/producer/beats', icon: Music, description: 'Manage your catalog' },
      { name: 'Upload', href: '/dashboard/producer/upload', icon: Upload, description: 'Add new beats' },
      { name: 'Sales', href: '/dashboard/producer/sales', icon: DollarSign, description: 'View revenue' },
      { name: 'Analytics', href: '/dashboard/producer/analytics', icon: BarChart3, description: 'Track performance' },
    ],
    admin: [
      { name: 'Users', href: '/dashboard/admin/users', icon: Users, description: 'Manage users' },
      { name: 'All Beats', href: '/dashboard/admin/beats', icon: Music, description: 'Moderate content' },
    ],
  };

  const links = dashboardLinks[profile?.role as keyof typeof dashboardLinks] || dashboardLinks.artist;

  if (authLoading || (profile?.role === 'producer' && isStatsLoading)) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator color="#005CB9" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="mb-10 relative">
        <View className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <Text className="text-4xl font-bold text-white mb-2">
          Welcome back, <Text className="text-primary italic">{profile?.display_name || 'Maestro'}</Text>!
        </Text>
        <Text className="text-gray-400 font-medium">
          {profile?.role === 'producer' 
            ? 'Your sonic empire is growing. Track your legacy below.'
            : 'Your library of elite sounds is ready for your next masterpiece.'
          }
        </Text>
      </View>

      {/* Stats (Producers only) */}
      {profile?.role === 'producer' && (
        <View className="flex-row flex-wrap gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-5 w-[47%] lg:w-[23%] bg-dark-900 border-white/5">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{stat.label}</Text>
                  <Text className="text-xl font-bold text-white">{stat.value}</Text>
                </View>
                <View className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon size={16} color="#005CB9" />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <Text className="text-xl font-bold text-white mb-6">Quick Actions</Text>
      <View className="gap-4 mb-12">
        {links.map((link, index) => (
          <Link key={index} href={link.href as any} asChild>
            <TouchableOpacity>
              <Card className="p-5 flex-row items-center gap-4 bg-dark-900 border-white/5">
                <View className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <link.icon size={24} color="#005CB9" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-white text-lg">{link.name}</Text>
                  <Text className="text-sm text-gray-400">{link.description}</Text>
                </View>
                <ArrowRight size={20} color="#374151" />
              </Card>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Recent Activity Placeholder */}
      <View className="mb-20">
        <Text className="text-xl font-bold text-white mb-6">Recent Activity</Text>
        <Card className="p-10 items-center justify-center bg-dark-900 border-white/5 border-dashed">
          <Play size={48} color="#1F2937" />
          <Text className="text-gray-500 mt-4 text-center">No recent activity yet</Text>
          <Text className="text-sm text-gray-600 mt-1 text-center">
            {profile?.role === 'producer' 
              ? 'Upload your first beat to get started'
              : 'Browse the marketplace to find beats'
            }
          </Text>
          <Link href={profile?.role === 'producer' ? '/dashboard/producer/upload' : '/marketplace'} asChild>
            <Button variant="outline" className="mt-6">
              {profile?.role === 'producer' ? 'Upload Beat' : 'Browse Beats'}
            </Button>
          </Link>
        </Card>
      </View>
    </ScrollView>
  );
}
