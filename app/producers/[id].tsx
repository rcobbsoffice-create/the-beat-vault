import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/stores/player';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  MapPin, 
  Globe, 
  Mail, 
  Check, 
  Star, 
  Play, 
  Pause,
  Share2, 
  AlertCircle 
} from 'lucide-react-native';

export default function ProducerProfile() {
  const { id: slug } = useLocalSearchParams();
  const player = usePlayer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producer, setProducer] = useState<any>(null);
  const [beats, setBeats] = useState<any[]>([]);

  const { setCurrentBeat, currentBeat, isPlaying, togglePlayPause } = player;

  useEffect(() => {
    async function fetchProducerData() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Try to find profile by ID first
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug as string);
        
        let profileData = null;

        if (isUUID) {
          const { data, error: idError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', slug)
            .single();
          
          if (!idError && data) {
            profileData = data;
          }
        }

        // 2. If no profile found by ID, try matching display_name
        if (!profileData) {
          const displayName = (slug as string).split('-').join(' ');
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'producer')
            .ilike('display_name', displayName)
            .limit(1);

          if (!profileError && profiles && profiles.length > 0) {
            profileData = profiles[0];
          }
        }

        if (!profileData) {
          setError('Producer not found');
          return;
        }

        setProducer(profileData);

        const profileId = profileData.id;
        if (!profileId) return;

        // 2. Fetch Beats for this producer
        const { data: beatsData, error: beatsError } = await supabase
          .from('beats')
          .select(`
            *,
            licenses(*)
          `)
          .eq('producer_id', profileId)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (beatsError) throw beatsError;
        setBeats(beatsData || []);
        
      } catch (err: any) {
        console.error('Error fetching producer profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducerData();
  }, [slug]);
  
  const handlePlayBeat = (beat: any) => {
    if (currentBeat?.id === beat.id) {
      togglePlayPause();
    } else {
      setCurrentBeat(beat);
    }
  };

  const handleHireMe = () => {
    Alert.alert('Hire Producer', 'This feature is coming soon! You will be able to message and hire producers directly.');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator color="#D4AF37" />
        <Text className="text-gray-400 mt-4">Loading Producer Profile...</Text>
      </View>
    );
  }

  if (error || !producer) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center p-4">
        <AlertCircle size={64} color="#EF4444" />
        <Text className="text-white text-2xl font-bold mt-6 mb-2">Producer Not Found</Text>
        <Text className="text-gray-400 text-center mb-8">The profile you are looking for doesn't exist or has been moved.</Text>
        <Button variant="outline" onPress={() => {}}>Browse All Producers</Button>
      </View>
    );
  }

  const totalPlays = beats.reduce((sum, beat) => sum + (beat.play_count || 0), 0);
  const featuredBeat = beats.length > 0 ? beats[0] : null;

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Hero Section */}
      <View className="relative h-96 w-full">
        {/* Banner/Cover Image */}
        <View className="absolute inset-0 bg-dark-900">
           <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop' }}
              style={{ width: '100%', height: '100%', opacity: 0.3 }}
           />
           <View className="absolute inset-0 bg-dark-950/60" />
        </View>

        <View className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <View className="max-w-7xl mx-auto w-full">
            <View className="flex-col md:flex-row items-end gap-6">
              {/* Avatar */}
              <View className="w-32 h-32 rounded-full border-4 border-dark-950 bg-dark-800 shrink-0 -mb-2 overflow-hidden shadow-2xl">
                {producer.avatar_url ? (
                  <Image source={{ uri: producer.avatar_url }} className="w-full h-full" />
                ) : (
                  <View className="flex-1 bg-primary items-center justify-center">
                    <Music size={40} color="#000" />
                  </View>
                )}
              </View>

              {/* Info */}
              <View className="flex-1 mb-4">
                <View className="flex-row items-center gap-3 mb-1">
                  <Text className="text-3xl font-bold text-white">{producer.display_name}</Text>
                  <Badge variant="primary">Verified</Badge>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="#D4AF37" />
                  <Text className="text-gray-400 text-sm">
                    {producer.location || 'Professional Producer'} | <Text className="text-white font-medium capitalize">{producer.role}</Text>
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <Button variant="outline" size="sm" className="px-6 flex-row gap-2">
                  <Share2 size={16} color="#fff" />
                  <Text className="text-white">Share</Text>
                </Button>
                <Button variant="primary" size="sm" className="px-8" onPress={handleHireMe}>
                  Hire Me
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="max-w-7xl mx-auto w-full px-4 py-8">
        <View className="flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <View className="flex-1">
            {/* Featured Beat */}
            {featuredBeat && (
              <View className="mb-12">
                <View className="flex-row items-center gap-2 mb-6">
                  <Star size={20} color="#D4AF37" fill="#D4AF37" />
                  <Text className="text-xl font-bold text-white">Featured Track</Text>
                </View>
                
                <View className="bg-dark-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                  <View className="flex-row gap-6 items-center">
                    <TouchableOpacity 
                      onPress={() => handlePlayBeat(featuredBeat)}
                      className="w-24 h-24 rounded-xl bg-dark-800 shrink-0 overflow-hidden items-center justify-center shadow-xl"
                    >
                      {featuredBeat.artwork_url ? (
                        <Image source={{ uri: featuredBeat.artwork_url }} className="w-full h-full" />
                      ) : (
                        <Music size={32} color="#4B5563" />
                      )}
                      <View className="absolute inset-0 bg-black/40 items-center justify-center">
                         {currentBeat?.id === featuredBeat.id && isPlaying ? (
                           <Pause size={24} color="#D4AF37" fill="#D4AF37" />
                         ) : (
                           <Play size={24} color="#D4AF37" fill="#D4AF37" />
                         )}
                      </View>
                    </TouchableOpacity>

                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-white mb-1" numberOfLines={1}>{featuredBeat.title}</Text>
                      <Text className="text-primary font-medium text-sm mb-4">{featuredBeat.genre} • {featuredBeat.bpm} BPM</Text>
                      
                      <View className="flex-row gap-3">
                        <Button variant="primary" className="flex-1" size="sm">Add to Cart</Button>
                        <Button 
                        variant="outline" 
                        size="sm" 
                        onPress={() => router.push(`/beats/${featuredBeat.id}`)}
                      >
                        Details
                      </Button>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Latest Releases */}
            <View>
              <Text className="text-xl font-bold text-white mb-6">Latest Releases</Text>
              <View className="gap-4">
                {beats.length === 0 ? (
                  <View className="py-12 bg-dark-900 rounded-2xl border border-dashed border-white/10 items-center">
                    <Music size={40} color="#374151" />
                    <Text className="text-gray-500 mt-4">No tracks published yet.</Text>
                  </View>
                ) : beats.map((beat, i) => (
                  <View key={beat.id} className="flex-row items-center gap-4 p-3 rounded-xl bg-dark-900 border border-white/5">
                    <Text className="text-gray-500 w-6 text-center font-bold text-sm">{i + 1}</Text>
                    
                    <TouchableOpacity 
                      onPress={() => handlePlayBeat(beat)}
                      className="w-12 h-12 rounded-lg bg-dark-800 shrink-0 items-center justify-center relative overflow-hidden"
                    >
                      {beat.artwork_url ? (
                        <Image source={{ uri: beat.artwork_url }} className="w-full h-full" />
                      ) : (
                        <Music size={20} color="#374151" />
                      )}
                      <View className="absolute inset-0 bg-black/30 items-center justify-center">
                         {currentBeat?.id === beat.id && isPlaying ? (
                           <Pause size={16} color="#fff" />
                         ) : (
                           <Play size={16} color="#fff" />
                         )}
                      </View>
                    </TouchableOpacity>

                    <View className="flex-1">
                      <Text className="font-bold text-white text-sm" numberOfLines={1}>{beat.title}</Text>
                      <Text className="text-xs text-gray-400">
                        {beat.bpm} BPM • {beat.key} • <Text className="text-primary">{beat.genre}</Text>
                      </Text>
                    </View>

                    <Button variant="outline" size="sm" className="rounded-full px-4 h-8">
                      <Text className="text-xs text-white">Buy</Text>
                    </Button>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Sidebar */}
          <View className="w-full lg:w-80">
            <View className="bg-dark-900 border border-white/5 rounded-2xl p-6 mb-8">
              <Text className="font-bold text-white mb-4">About</Text>
              <Text className="text-gray-400 text-sm leading-relaxed mb-6">
                {producer.bio || 'Professional music producer creating high-quality tracks for artists worldwide.'}
              </Text>
              
              <Text className="font-bold text-white text-sm mb-3">Service Includes</Text>
              <View className="gap-2 mb-6">
                <View className="flex-row items-center gap-2">
                  <Check size={14} color="#D4AF37" />
                  <Text className="text-xs text-gray-400">High Quality WAVs</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Check size={14} color="#D4AF37" />
                  <Text className="text-xs text-gray-400">Trackout Stems</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Check size={14} color="#D4AF37" />
                  <Text className="text-xs text-gray-400">Unlimited License Rights</Text>
                </View>
              </View>

              <Button variant="ghost" className="bg-white/5" onPress={() => {}}>
                Contact Producer
              </Button>
            </View>
          </View>
        </View>
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}
