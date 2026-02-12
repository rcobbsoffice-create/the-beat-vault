import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Plus, 
  Play, 
  Pause,
  Edit2,
  Trash2,
  Activity
} from 'lucide-react-native';
import { usePlayer } from '@/stores/player';
import { useCatalogStore } from '@/stores/catalog';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export default function ProducerBeatsPage() {
  const router = useRouter();
  const { setCurrentBeat, togglePlayPause, currentBeat, isPlaying } = usePlayer();
  const { beats, fetchBeats, isLoading, error } = useCatalogStore();

  useEffect(() => {
    fetchBeats();
  }, []);

  if (isLoading && beats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center min-h-[400px]">
        <Activity size={32} color="#005CB9" className="animate-spin" />
        <Text className="text-gray-400 mt-4">Loading your catalog...</Text>
      </View>
    );
  }

  const handlePlayBeat = (beat: any) => {
    if (currentBeat?.id === beat.id) {
      togglePlayPause();
    } else {
      // Use stream endpoint for preview but might need adaptation for Expo/Native
      setCurrentBeat(beat);
      trackEvent('play', beat.id);
    }
  };

  const handleEdit = (beat: any) => {
    router.push(`/dashboard/producer/beats/${beat.id}/edit`);
  };

  const handleDelete = async (beat: any) => {
    const performDelete = async () => {
        try {
            const { error: deleteError } = await supabase
                .from('beats')
                .delete()
                .eq('id', beat.id);
            
            if (deleteError) throw deleteError;
            
            fetchBeats(); // Refresh catalog
        } catch (err: any) {
            console.error('Delete error:', err);
            if (Platform.OS !== 'web') {
                Alert.alert('Error', `Delete failed: ${err.message}`);
            } else {
                alert(`Delete failed: ${err.message}`);
            }
        }
    };

    if (Platform.OS !== 'web') {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this track? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: performDelete }
            ]
        );
    } else {
        if (confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
            performDelete();
        }
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 px-4 py-8">
      {/* Header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">My Catalog</Text>
          <Text className="text-gray-400">Manage your tracks, track performance, and edit listings</Text>
        </View>
        <Link href="/dashboard/producer/upload" asChild>
          <Button className="bg-primary px-6">
            <View className="flex-row items-center gap-2">
                <Plus size={16} color="#000" />
                <Text className="text-black font-bold">Upload New Beat</Text>
            </View>
          </Button>
        </Link>
      </View>

      {/* Catalog List */}
      <View className="gap-4">
        {beats.map((beat) => (
          <Card key={beat.id} className="p-4 bg-dark-900 border-white/5">
            <View className="flex-col md:flex-row items-center gap-6">
              {/* Cover Art Preview */}
              <View className="w-20 h-20 rounded-xl bg-dark-800 shrink-0 relative overflow-hidden items-center justify-center">
                {beat.artwork_url ? (
                  <Image 
                    source={{ uri: beat.artwork_url }} 
                    style={{ width: '100%', height: '100%' }} 
                    className="object-cover"
                  />
                ) : (
                  <Music size={24} color="#374151" />
                )}
                <TouchableOpacity 
                   onPress={() => handlePlayBeat(beat)}
                   className={`absolute inset-0 bg-primary/20 items-center justify-center ${
                     currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0'
                   }`}
                >
                   {currentBeat?.id === beat.id && isPlaying ? (
                     <Pause size={16} color="#000" fill="#000" />
                   ) : (
                     <Play size={16} color="#000" fill="#000" />
                   )}
                </TouchableOpacity>
              </View>

              {/* Title & Info */}
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center gap-3 mb-1">
                  <Text className="text-lg font-bold text-white truncate" numberOfLines={1}>{beat.title}</Text>
                  <Badge variant={beat.status === 'published' ? 'secondary' : 'outline'}>
                    <Text className="text-[10px] uppercase">{beat.status}</Text>
                  </Badge>
                </View>
                <Text className="text-sm text-gray-400">
                  {beat.genre} • {beat.bpm} BPM • 44.1kHz WAV
                </Text>
              </View>

              {/* Stats */}
              <View className="flex-row items-center gap-8 px-6 border-x border-white/5 hidden md:flex">
                <View className="items-center">
                  <Text className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 text-center">Plays</Text>
                  <Text className="text-white font-bold">{beat.plays}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 text-center">Sales</Text>
                  <Text className="text-white font-bold">{beat.sales}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[10px] uppercase font-bold tracking-widest mb-1 text-center text-primary">Earned</Text>
                  <Text className="font-bold text-primary">{beat.earnings}</Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onPress={() => handleEdit(beat)}
                >
                   <View className="flex-row items-center gap-2">
                      <Edit2 size={14} color="#005CB9" />
                      <Text className="text-primary text-xs font-bold">Edit</Text>
                   </View>
                </Button>
                <TouchableOpacity 
                  onPress={() => handleDelete(beat)}
                  className="p-2 rounded-lg bg-red-500/10"
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {beats.length > 0 && (
        <View className="items-center py-6">
            <TouchableOpacity>
                <Text className="text-gray-500 font-bold">Load more tracks</Text>
            </TouchableOpacity>
        </View>
      )}
      
      <View className="h-20" />
    </ScrollView>
  );
}
