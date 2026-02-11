import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Music, MapPin, Star, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function ProducersPage() {
  const [producers, setProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            beats:beats(count)
          `)
          .eq('role', 'producer')
          .eq('is_top_producer', true)
          .order('display_name', { ascending: true });

        if (error) throw error;
        setProducers(data || []);
      } catch (err) {
        console.error('Error fetching producers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducers();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator color="#D4AF37" />
        <Text className="text-gray-400 mt-4">Loading Producers...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950">
      <View className="py-12 px-4 relative">
        {/* Background ambience (simulated with a View) */}
        <View className="absolute top-0 left-0 right-0 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <View className="max-w-7xl mx-auto w-full relative z-10">
          <View className="mb-12 items-center">
            <Text className="text-4xl font-bold text-white mb-4 text-center">
              Top <Text className="text-primary">Producers</Text>
            </Text>
            <Text className="text-lg text-gray-400 max-w-2xl text-center leading-relaxed">
              Discover the elite talent behind the beats. Hand-selected producers delivering professional sound.
            </Text>
          </View>

          {producers.length === 0 ? (
            <View className="items-center py-20 bg-dark-900 border border-white/5 rounded-3xl">
               <Users size={64} color="#374151" />
               <Text className="text-gray-500 font-medium mt-4">No producers have been featured yet.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-center gap-6">
              {producers.map((producer) => (
                <Link 
                  key={producer.id} 
                  href={`/producers/${producer.id}`}
                  asChild
                >
                  <TouchableOpacity className="w-full sm:w-[45%] lg:w-[23%] bg-dark-900 border border-white/5 rounded-2xl overflow-hidden mb-6">
                    {/* Characterizing Next.js "group" with native styles */}
                    <View className="aspect-square w-full bg-dark-800 relative">
                        {producer.avatar_url ? (
                          <Image 
                            source={{ uri: producer.avatar_url }} 
                            className="w-full h-full"
                            style={{ resizeMode: 'cover' }}
                          />
                        ) : (
                          <View className="w-full h-full items-center justify-center">
                            <View className="w-24 h-24 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center">
                                <Music size={40} color="#6B7280" />
                            </View>
                          </View>
                        )}
                        <View className="absolute inset-0 bg-black/40" />
                    </View>

                    <View className="p-5">
                      <Text className="text-xl font-bold text-white mb-1">
                        {producer.display_name || 'Anonymous Producer'}
                      </Text>
                      <View className="flex-row items-center gap-2 mb-4">
                        <MapPin size={14} color="#D4AF37" />
                        <Text className="text-xs text-gray-500">Platform Artist</Text>
                      </View>
                      
                      <Text className="text-sm text-gray-400 mb-6 h-10" numberOfLines={2}>
                        {producer.bio || 'New producer on AudioGenes.'}
                      </Text>
                      
                      <View className="flex-row items-center justify-between pt-4 border-t border-white/5">
                        <View>
                          <Text className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Catalog</Text>
                          <Text className="text-white font-medium">{producer.beats?.[0]?.count || 0} Beats</Text>
                        </View>
                        <View className="items-end">
                           <Text className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rating</Text>
                           <View className="flex-row items-center gap-1">
                            <Star size={12} color="#D4AF37" fill="#D4AF37" />
                            <Text className="font-bold text-white">5.0</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
