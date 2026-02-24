import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Switch } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Radio,
  TrendingUp,
  Eye,
  Music,
  Youtube,
  ExternalLink,
  ChevronRight,
  Activity,
  BarChart3
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface TrackDetection {
  id: string;
  beat_id: string;
  beat_title: string;
  beat_artwork_url?: string;
  platform: string;
  platform_url?: string;
  platform_title?: string;
  platform_creator?: string;
  detected_at: string;
  confidence_score: number;
}

interface BeatSummary {
  beat_id: string;
  title: string;
  artwork_url?: string;
  monitoring_enabled: boolean;
  monitored_platforms: string[];
  total_detections: number;
  platforms_detected_on: number;
  unique_videos: number;
  total_play_seconds: number;
  last_detected_at?: string;
}

export default function TrackMonitoringPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [beatSummaries, setBeatSummaries] = useState<BeatSummary[]>([]);
  const [recentDetections, setRecentDetections] = useState<TrackDetection[]>([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    activeMonitors: 0,
    platformsTracked: 0,
  });

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);

      // Fetch beat tracking summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('beat_tracking_summary')
        .select('*')
        .eq('producer_id', profile?.id)
        .order('total_detections', { ascending: false });

      if (summaryError) throw summaryError;

      setBeatSummaries(summaryData || []);

      // Calculate stats
      const totalDetections = (summaryData || []).reduce((sum, b) => sum + (b.total_detections || 0), 0);
      const activeMonitors = (summaryData || []).filter(b => b.monitoring_enabled).length;
      const platformsSet = new Set<string>();
      (summaryData || []).forEach(b => {
        (b.monitored_platforms || []).forEach((p: string) => platformsSet.add(p));
      });

      setStats({
        totalDetections,
        activeMonitors,
        platformsTracked: platformsSet.size,
      });

      // Fetch recent detections
      const { data: detectionsData, error: detectionsError } = await supabase
        .from('track_detections')
        .select(`
          id,
          beat_id,
          platform,
          platform_url,
          platform_title,
          platform_creator,
          detected_at,
          confidence_score,
          beats!inner(
            title,
            artwork_url,
            producer_id
          )
        `)
        .eq('beats.producer_id', profile?.id)
        .order('detected_at', { ascending: false })
        .limit(10);

      if (!detectionsError && detectionsData) {
        const formatted = detectionsData.map((d: any) => ({
          id: d.id,
          beat_id: d.beat_id,
          beat_title: d.beats.title,
          beat_artwork_url: d.beats.artwork_url,
          platform: d.platform,
          platform_url: d.platform_url,
          platform_title: d.platform_title,
          platform_creator: d.platform_creator,
          detected_at: d.detected_at,
          confidence_score: d.confidence_score,
        }));
        setRecentDetections(formatted);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonitoring = async (beatId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('audio_fingerprints')
        .update({ monitoring_enabled: !currentStatus })
        .eq('beat_id', beatId);

      if (error) throw error;

      // Refresh data
      fetchTrackingData();
    } catch (error) {
      console.error('Error toggling monitoring:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Youtube size={16} color="#FF0000" />;
      case 'spotify':
        return <Music size={16} color="#1DB954" />;
      default:
        return <Radio size={16} color="#9CA3AF" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <Activity size={32} color="#005CB9" className="animate-spin" />
        <Text className="text-gray-400 mt-4">Loading tracking data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 px-4 py-8">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">
          Track <Text className="text-primary">Monitoring</Text>
        </Text>
        <Text className="text-gray-400 font-medium">
          Monitor how your beats are being used across streaming platforms
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-col md:flex-row gap-4 mb-8">
        <Card className="flex-1 p-6 bg-dark-900/80 border-primary/20">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs uppercase font-bold tracking-widest">Total Detections</Text>
            <TrendingUp size={20} color="#005CB9" />
          </View>
          <Text className="text-3xl font-black text-white">{stats.totalDetections}</Text>
          <Text className="text-xs text-gray-500 mt-1">Across all platforms</Text>
        </Card>

        <Card className="flex-1 p-6 bg-dark-900/80 border-white/5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs uppercase font-bold tracking-widest">Active Monitors</Text>
            <Radio size={20} color="#005CB9" />
          </View>
          <Text className="text-3xl font-black text-white">{stats.activeMonitors}</Text>
          <Text className="text-xs text-gray-500 mt-1">Beats being tracked</Text>
        </Card>

        <Card className="flex-1 p-6 bg-dark-900/80 border-white/5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs uppercase font-bold tracking-widest">Platforms</Text>
            <BarChart3 size={20} color="#005CB9" />
          </View>
          <Text className="text-3xl font-black text-white">{stats.platformsTracked}</Text>
          <Text className="text-xs text-gray-500 mt-1">Being monitored</Text>
        </Card>
      </View>

      {/* Recent Detections */}
      {recentDetections.length > 0 && (
        <View className="mb-8">
          <Text className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">
            Recent Detections
          </Text>
          <Card className="p-4 bg-dark-900/80 border-white/5">
            {recentDetections.map((detection, index) => (
              <View key={detection.id}>
                <View className="flex-row items-center gap-4 py-3">
                  {/* Beat Artwork */}
                  <View className="w-12 h-12 rounded-lg bg-dark-800 overflow-hidden items-center justify-center">
                    {detection.beat_artwork_url ? (
                      <Image 
                        source={{ uri: detection.beat_artwork_url }} 
                        style={{ width: '100%', height: '100%' }} 
                        className="object-cover"
                      />
                    ) : (
                      <Music size={16} color="#374151" />
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1 min-w-0">
                    <Text className="text-white font-bold text-sm truncate">{detection.beat_title}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      {getPlatformIcon(detection.platform)}
                      <Text className="text-gray-400 text-xs truncate flex-1">
                        {detection.platform_title || detection.platform_creator || detection.platform}
                      </Text>
                    </View>
                  </View>

                  {/* Time & Link */}
                  <View className="items-end gap-2">
                    <Text className="text-gray-500 text-xs">{formatTimeAgo(detection.detected_at)}</Text>
                    {detection.platform_url && (
                      <TouchableOpacity onPress={() => {/* Open URL */}}>
                        <ExternalLink size={14} color="#005CB9" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {index < recentDetections.length - 1 && (
                  <View className="h-px bg-white/5" />
                )}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Beat Monitoring Controls */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-black text-white uppercase tracking-tighter">
            Your Beats
          </Text>
          <Link href="/dashboard/producer/upload" asChild>
            <TouchableOpacity className="flex-row items-center gap-2">
              <Text className="text-primary font-bold text-sm">Upload New</Text>
              <ChevronRight size={16} color="#005CB9" />
            </TouchableOpacity>
          </Link>
        </View>

        {beatSummaries.length === 0 ? (
          <Card className="p-8 bg-dark-900/80 border-white/5 items-center">
            <Music size={48} color="#374151" className="mb-4" />
            <Text className="text-white font-bold mb-2">No beats yet</Text>
            <Text className="text-gray-400 text-center mb-4">
              Upload your first beat to start tracking its usage across platforms
            </Text>
            <Link href="/dashboard/producer/upload" asChild>
              <Button className="bg-primary">
                <Text className="text-black font-bold">Upload Beat</Text>
              </Button>
            </Link>
          </Card>
        ) : (
          <View className="gap-3">
            {beatSummaries.map((beat) => (
              <Card key={beat.beat_id} className="p-4 bg-dark-900/80 border-white/5">
                <View className="flex-row items-center gap-4">
                  {/* Beat Artwork */}
                  <View className="w-16 h-16 rounded-xl bg-dark-800 overflow-hidden items-center justify-center">
                    {beat.artwork_url ? (
                      <Image 
                        source={{ uri: beat.artwork_url }} 
                        style={{ width: '100%', height: '100%' }} 
                        className="object-cover"
                      />
                    ) : (
                      <Music size={20} color="#374151" />
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-white font-bold flex-1">{beat.title}</Text>
                      {beat.monitoring_enabled && (
                        <Badge variant="secondary">
                          <View className="flex-row items-center gap-1">
                            <Radio size={10} color="#10B981" />
                            <Text className="text-[10px] uppercase text-emerald-500">Live</Text>
                          </View>
                        </Badge>
                      )}
                    </View>
                    {beat.total_detections > 0 ? (
                      <Text className="text-gray-400 text-xs">
                        {beat.total_detections} detection{beat.total_detections !== 1 ? 's' : ''} • 
                        {beat.unique_videos} video{beat.unique_videos !== 1 ? 's' : ''}
                      </Text>
                    ) : (
                      <Text className="text-gray-500 text-xs italic">No detections yet</Text>
                    )}
                  </View>

                  {/* Toggle */}
                  <View className="items-end">
                    <Text className="text-gray-500 text-[10px] uppercase font-bold mb-2 tracking-widest">
                      Monitor
                    </Text>
                    <Switch
                      value={beat.monitoring_enabled}
                      onValueChange={() => toggleMonitoring(beat.beat_id, beat.monitoring_enabled)}
                      trackColor={{ false: '#374151', true: '#005CB9' }}
                      thumbColor={beat.monitoring_enabled ? '#fff' : '#9CA3AF'}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
