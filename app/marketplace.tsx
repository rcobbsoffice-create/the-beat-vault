import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Activity } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/stores/player';
import { trackEvent } from '@/lib/analytics';

export default function Marketplace() {
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentBeat } = usePlayer();

  useEffect(() => {
    async function fetchBeats() {
      const { data, error } = await supabase
        .from('beats')
        .select(`
          *,
          producer:profiles(*),
          licenses(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBeats(data);
      }
      setLoading(false);
    }
    fetchBeats();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <Text className="text-white">Loading Beats...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Marketplace</Text>
        <Text className="text-gray-400">Discover top beats from verified producers</Text>
      </View>

      <View className="gap-4">
        {beats.map((beat) => (
          <Card key={beat.id} className="bg-dark-900 border-white/5">
             <View className="flex-row p-4 items-center">
                <TouchableOpacity 
                   onPress={() => {
                     setCurrentBeat(beat);
                     trackEvent('play', beat.id);
                   }}
                   className="w-16 h-16 bg-dark-800 rounded-lg items-center justify-center mr-4 overflow-hidden"
                >
                   {beat.artwork_url ? (
                     <Image 
                        source={{ uri: beat.artwork_url }}
                        style={{ width: '100%', height: '100%' }}
                     />
                   ) : (
                     <Play size={24} color="#D4AF37" />
                   )}
                </TouchableOpacity>
                
                <View className="flex-1">
                   <Link href={`/beats/${beat.id}`} asChild>
                      <TouchableOpacity>
                         <Text className="text-white font-bold text-lg">{beat.title}</Text>
                      </TouchableOpacity>
                   </Link>
                   <Text className="text-gray-400">{beat.producer?.display_name || 'Unknown Producer'}</Text>
                   <View className="flex-row gap-2 mt-2">
                       {beat.genre && <Badge variant="secondary">{beat.genre}</Badge>}
                       {beat.bpm && <Badge variant="outline">{beat.bpm} BPM</Badge>}
                   </View>
                </View>

                <View className="items-end">
                   <Text className="text-primary font-bold text-lg">
                      ${((beat.licenses?.reduce((min: number, l: any) => l.price < min ? l.price : min, beat.licenses[0]?.price || 2999)) / 100).toFixed(2)}
                   </Text>
                   <Link href={`/beats/${beat.id}`} asChild>
                      <TouchableOpacity className="bg-white/10 p-2 px-4 rounded-full mt-2">
                         <Text className="text-white text-xs font-bold">Details</Text>
                      </TouchableOpacity>
                   </Link>
                </View>
             </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
