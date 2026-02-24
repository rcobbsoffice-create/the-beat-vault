import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/ui/Section';
import { MarketplaceSidebar } from '@/components/MarketplaceSidebar';
import { Play, Activity, Search, SlidersHorizontal, ChevronRight, Music, Users, Box, BookOpen, ShoppingBag, Youtube } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/stores/player';
import { trackEvent } from '@/lib/analytics';

export default function Marketplace() {
  const [beats, setBeats] = useState<any[]>([]);
  const [producers, setProducers] = useState<any[]>([]);
  const [soundPacks, setSoundPacks] = useState<any[]>([]);
  const [clothing, setClothing] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const { setCurrentBeat } = usePlayer();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [beatsRes, producersRes, packsRes, clothingRes, tutorialsRes] = await Promise.all([
          supabase.from('beats').select('*, producer:profiles(*), licenses(*)').limit(10),
          supabase.from('profiles').select('*').eq('role', 'producer').limit(10),
          supabase.from('merch_products').select('*').eq('category', 'Sound Pack').limit(10),
          supabase.from('merch_products').select('*').eq('category', 'Apparel').limit(10),
          supabase.from('articles').select('*').eq('category', 'Tutorial').limit(10)
        ]);

        if (beatsRes.data) setBeats(beatsRes.data);
        if (producersRes.data) setProducers(producersRes.data);
        if (packsRes.data) setSoundPacks(packsRes.data);
        if (clothingRes.data) setClothing(clothingRes.data);
        if (tutorialsRes.data) setTutorials(tutorialsRes.data);
      } catch (err) {
        console.error('Error fetching marketplace data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-dark-700 items-center justify-center">
        <ActivityIndicator color="#005CB9" size="large" />
        <Text className="text-gray-400 mt-4 font-medium">Curating your experience...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row bg-dark-700">
      {/* Sidebar - Desktop Only */}
      <MarketplaceSidebar />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Search Header */}
        <View className="px-4 py-8 md:px-8 border-b border-white/5">
          <Text className="text-4xl font-black text-white mb-6 tracking-tighter">Browse</Text>
          
          <View className="flex-row gap-2 mb-8 max-w-2xl">
            <View className="flex-1">
              <Input
                placeholder="Search producers, beats, or sounds..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                icon={<Search size={20} color="#9BA3AF" />}
                className="mb-0 bg-dark-900 border-none h-14"
              />
            </View>
            <Button variant="outline" className="h-14 w-14 items-center justify-center p-0 border-dark-700 bg-dark-900">
               <SlidersHorizontal size={20} color="#9BA3AF" />
            </Button>
          </View>

          {/* Categories Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            {['Instruments', 'Genres', 'Cinematic FX', 'Presets', 'Vocals', 'Loops'].map((cat) => (
              <TouchableOpacity 
                key={cat}
                className="px-6 py-3 bg-dark-900 rounded-xl border border-white/5 flex-row items-center gap-2"
              >
                <Text className="text-white font-bold text-sm">{cat}</Text>
                <ChevronRight size={14} color="#4B5563" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-4 md:px-8 pt-8">
          {/* Row 1: Producers (Square Cards) */}
          <Section 
            title="Verified Producers" 
            subtitle="Top creators in the industry"
            onSeeAll={() => {}}
          >
            {producers.map((producer) => (
              <Card key={producer.id} className="mr-4 w-40 bg-dark-900 border-white/5 overflow-hidden">
                <View className="w-full aspect-square bg-dark-800">
                  {producer.avatar_url ? (
                    <Image source={{ uri: producer.avatar_url }} className="w-full h-full" />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Users size={32} color="#374151" />
                    </View>
                  )}
                </View>
                <View className="p-3">
                  <Text className="text-white font-bold text-sm truncate mb-0.5" numberOfLines={1}>
                    {producer.display_name}
                  </Text>
                  <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">Verified</Text>
                </View>
              </Card>
            ))}
          </Section>

          {/* Row 2: Instrumentals */}
          <Section 
            title="Trending Instrumentals" 
            subtitle="The hottest beats this week"
            onSeeAll={() => {}}
          >
            {beats.map((beat) => (
              <Card key={beat.id} className="mr-4 w-48 bg-dark-900 border-white/5 p-3">
                <TouchableOpacity 
                  onPress={() => {
                    setCurrentBeat(beat);
                    trackEvent('play', beat.id);
                  }}
                  className="w-full aspect-square bg-dark-800 rounded-lg overflow-hidden mb-3"
                >
                  {beat.artwork_url ? (
                    <Image source={{ uri: beat.artwork_url }} className="w-full h-full" />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Music size={32} color="#374151" />
                    </View>
                  )}
                  <View className="absolute inset-0 bg-black/40 items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={40} color="white" fill="white" />
                  </View>
                </TouchableOpacity>
                <Link href={`/beats/${beat.id}`} asChild>
                  <TouchableOpacity>
                    <Text className="text-white font-bold text-sm truncate" numberOfLines={1}>{beat.title}</Text>
                  </TouchableOpacity>
                </Link>
                <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>{beat.producer?.display_name || 'Anonymous'}</Text>
                <View className="flex-row items-center justify-between mt-auto">
                  <View className="flex-row flex-wrap gap-1 flex-1">
                    {(beat.genres && beat.genres.length > 0 ? beat.genres : [beat.genre]).slice(0, 2).map((g, idx) => (
                      <Badge key={idx} variant="secondary" className="px-1.5 py-0.5"><Text className="text-[9px]">{g}</Text></Badge>
                    ))}
                  </View>
                  <Text className="text-primary font-bold text-xs ml-2">
                    ${((beat.licenses?.[0]?.price || 2999) / 100).toFixed(2)}
                  </Text>
                </View>
              </Card>
            ))}
          </Section>

          {/* Row 3: Clothing Merch */}
          <Section 
            title="Exclusive Merch" 
            subtitle="Official apparel and accessories"
            onSeeAll={() => {}}
          >
            {clothing.length > 0 ? clothing.map((item) => (
              <Card key={item.id} className="mr-4 w-48 bg-dark-900 border-white/5 p-3">
                 <View className="w-full aspect-square bg-dark-800 rounded-lg overflow-hidden mb-3">
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} className="w-full h-full" />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <ShoppingBag size={32} color="#374151" />
                      </View>
                    )}
                 </View>
                 <Text className="text-white font-bold text-sm truncate" numberOfLines={1}>{item.name}</Text>
                 <Text className="text-gray-500 text-xs mb-2">{item.category}</Text>
                 <View className="flex-row items-center justify-between mt-auto">
                   <Badge variant="outline"><Text className="text-[10px]">Apparel</Text></Badge>
                   <Text className="text-primary font-bold text-sm">${(item.price / 100).toFixed(2)}</Text>
                 </View>
              </Card>
            )) : (
              <View className="w-48 h-64 border border-dashed border-white/10 rounded-xl items-center justify-center mr-4">
                 <ShoppingBag size={24} color="#374151" />
                 <Text className="text-gray-600 text-[10px] font-bold mt-2 uppercase">More coming soon</Text>
              </View>
            )}
          </Section>

          {/* Row 4: Sound Packs */}
          <Section 
            title="Sound Packs" 
            subtitle="High-quality samples and presets"
            onSeeAll={() => {}}
          >
            {soundPacks.length > 0 ? soundPacks.map((pack) => (
              <Card key={pack.id} className="mr-4 w-48 bg-dark-900 border-white/5 p-3">
                 <View className="w-full aspect-square bg-dark-800 rounded-lg overflow-hidden mb-3">
                    {pack.image_url ? (
                      <Image source={{ uri: pack.image_url }} className="w-full h-full" />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Box size={32} color="#374151" />
                      </View>
                    )}
                 </View>
                 <Text className="text-white font-bold text-sm truncate" numberOfLines={1}>{pack.name}</Text>
                 <Text className="text-gray-500 text-xs mb-2">Sample Pack</Text>
                 <View className="flex-row items-center justify-between mt-auto">
                   <Badge variant="outline"><Text className="text-[10px]">Sounds</Text></Badge>
                   <Text className="text-primary font-bold text-sm">${(pack.price / 100).toFixed(2)}</Text>
                 </View>
              </Card>
            )) : (
              <View className="w-48 h-64 border border-dashed border-white/10 rounded-xl items-center justify-center mr-4">
                 <Box size={24} color="#374151" />
                 <Text className="text-gray-600 text-[10px] font-bold mt-2 uppercase">Coming Soon</Text>
              </View>
            )}
          </Section>

          {/* Row 5: Video Tutorials */}
          <Section 
            title="Video Tutorials" 
            subtitle="Master your production with expert guides"
            onSeeAll={() => {}}
          >
            {tutorials.length > 0 ? tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="mr-4 w-72 bg-dark-900 border-white/5 overflow-hidden">
                 <View className="w-full h-40 bg-dark-800 relative">
                    {tutorial.image_url ? (
                      <Image source={{ uri: tutorial.image_url }} className="w-full h-full" />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Youtube size={32} color="#374151" />
                      </View>
                    )}
                    <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
                      <Text className="text-white text-[10px] font-bold">12:45</Text>
                    </View>
                 </View>
                 <View className="p-4">
                    <Text className="text-primary font-bold text-[10px] uppercase tracking-widest mb-1">Tutorial</Text>
                    <Text className="text-white font-bold text-sm mb-2" numberOfLines={2}>{tutorial.title}</Text>
                    <TouchableOpacity className="flex-row items-center mt-2">
                      <Youtube size={14} color="#EF4444" />
                      <Text className="text-gray-400 text-xs font-medium ml-2">Watch on Beat Vault TV</Text>
                    </TouchableOpacity>
                 </View>
              </Card>
            )) : (
               <View className="w-72 h-40 border border-dashed border-white/10 rounded-xl items-center justify-center mr-4">
                 <Youtube size={24} color="#374151" />
                 <Text className="text-gray-600 text-[10px] font-bold mt-2 uppercase">No tutorials yet</Text>
               </View>
            )}
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
