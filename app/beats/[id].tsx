import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/stores/player';
import { LinearVisualizer } from '@/components/LinearVisualizer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Music, 
  Calendar,
  MessageSquare,
  ArrowLeft
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BeatDetails() {
  const { id } = useLocalSearchParams();
  const { currentBeat, isPlaying, analyser, setCurrentBeat, togglePlayPause } = usePlayer();
  const [beat, setBeat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  const isCurrentBeat = currentBeat?.id === beat?.id;

  useEffect(() => {
    async function fetchBeat() {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('beats')
          .select(`
            *,
            producer:profiles(*),
            licenses(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setBeat(data);
        
        // Track view
        const { error: rpcError } = await supabase
          .rpc('increment_view_count', { beat_id: id });
        
        if (rpcError) {
          console.error('Failed to track view:', rpcError);
        }
           
      } catch (err) {
        console.error('Error fetching beat:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBeat();
  }, [id]);

  const handlePlay = () => {
    if (!beat) return;
    if (isCurrentBeat) {
      togglePlayPause();
    } else {
      setCurrentBeat(beat);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  if (!beat) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center gap-4">
        <Text className="text-white text-xl font-bold">Beat not found</Text>
        <Link href="/marketplace" asChild>
          <Button variant="primary">Back to Marketplace</Button>
        </Link>
      </View>
    );
  }

const handleCheckout = async (license: any) => {
    setLoading(true);
    try {
      // 1. Simulate API call to create Checkout Session
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Checkout Simulation',
        `Redirecting to secure payment for ${license.type.toUpperCase()} license ($${(license.price / 100).toFixed(2)}).`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          { 
            text: 'Complete Payment', 
            onPress: async () => {
              // 2. Simulate Success callback
              const { error } = await supabase.from('purchases').insert({
                beat_id: id,
                license_id: license.id,
                amount_paid: license.price,
                buyer_id: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
                platform_fee: Math.round(license.price * 0.15),
                producer_payout: Math.round(license.price * 0.85),
                stripe_payment_intent_id: 'sim_' + Math.random().toString(36).substring(7)
              });
              
              if (error) throw error;
              Alert.alert('Success', 'Thank you for your purchase! Your files are now available in your library.');
              setLoading(false);
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Checkout error:', err);
      Alert.alert('Error', 'Failed to initialize checkout.');
      setLoading(false);
    }
  };

  const basicLicense = beat.licenses?.find((l: any) => l.type === 'basic') || { type: 'basic', price: 2999 };
  const exclusiveLicense = beat.licenses?.find((l: any) => l.type === 'exclusive') || { type: 'exclusive', price: 49999 };

  return (
    <ScrollView className="flex-1 bg-dark-950">
      <View className="relative">
        {/* Immersive Background */}
        {beat.artwork_url && (
          <View className="absolute inset-0 h-[500px] overflow-hidden">
             <Image 
                source={{ uri: beat.artwork_url }}
                style={{ width: '100%', height: '100%', opacity: 0.15 }}
                blurRadius={Platform.OS === 'web' ? 100 : 20}
             />
             <View 
                className="absolute inset-0"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.6)',
                }}
             />
             
             {/* Background Linear Visualizer */}
             <View className="absolute bottom-0 left-0 right-0 h-48 opacity-20 items-center justify-end">
                <LinearVisualizer 
                  analyser={isCurrentBeat ? analyser : null} 
                  isPlaying={isCurrentBeat && isPlaying}
                  height={150}
                  barColor="#005CB9"
                />
             </View>
          </View>
        )}

        <View className="px-4 py-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <Link href="/marketplace" asChild>
            <TouchableOpacity className="flex-row items-center mb-8">
              <ArrowLeft size={16} color="#9CA3AF" />
              <Text className="text-gray-400 ml-2 text-sm">Back to Marketplace</Text>
            </TouchableOpacity>
          </Link>

          <View className="flex-col lg:flex-row gap-12">
            
            {/* Left: Artwork & Main Actions */}
            <View className="w-full lg:w-[45%] space-y-6">
              <View className="aspect-square rounded-3xl bg-dark-900 border border-white/5 overflow-hidden shadow-2xl relative">
                {beat.artwork_url ? (
                  <Image 
                    source={{ uri: beat.artwork_url }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Music size={120} color="#374151" />
                  </View>
                )}
                
                <TouchableOpacity 
                   onPress={handlePlay}
                   className="absolute inset-0 items-center justify-center bg-black/10"
                >
                   <View className="w-24 h-24 rounded-full bg-primary items-center justify-center shadow-xl">
                      {isCurrentBeat && isPlaying ? (
                        <Pause size={40} color="#000" fill="#000" />
                      ) : (
                        <Play size={40} color="#000" fill="#000" className="ml-1" />
                      )}
                   </View>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-4">
                 <Button fullWidth onPress={handlePlay} size="lg" className="flex-1 h-16">
                    {isCurrentBeat && isPlaying ? 'Pause' : 'Play'}
                 </Button>
                 <Button variant="outline" size="sm" className="w-16 h-16">
                    <Heart size={24} color="#005CB9" />
                 </Button>
                 <Button variant="outline" size="sm" className="w-16 h-16">
                    <Share2 size={24} color="#fff" />
                 </Button>
              </View>

              <View className="flex-row justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                 <View className="items-center">
                    <Text className="text-white font-bold text-xl">{beat.play_count || 0}</Text>
                    <Text className="text-gray-500 text-[10px] uppercase">Plays</Text>
                 </View>
                 <View className="items-center border-x border-white/10 px-8">
                    <Text className="text-white font-bold text-xl">{beat.view_count || 0}</Text>
                    <Text className="text-gray-500 text-[10px] uppercase">Views</Text>
                 </View>
                 <View className="items-center">
                    <Text className="text-white font-bold text-xl">{beat.favorite_count || 0}</Text>
                    <Text className="text-gray-500 text-[10px] uppercase">Favs</Text>
                 </View>
              </View>
            </View>

            {/* Right: Info & Purchase */}
            <View className="flex-1 space-y-8">
                <View>
                  <Text className="text-sm text-gray-500 mb-2">{new Date(beat.created_at).toLocaleDateString()}</Text>
                  <Text className="text-4xl lg:text-6xl font-black text-white mb-2 tracking-tighter">{beat.title}</Text>
                  <Text className="text-xl text-primary font-bold">by {beat.producer?.display_name || 'Unknown Producer'}</Text>
                </View>

               <View className="flex-row flex-wrap gap-4">
                  <View className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                     <Text className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">BPM</Text>
                     <Text className="text-xl font-bold text-white">{beat.bpm || '--'}</Text>
                  </View>
                  <View className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                     <Text className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Key</Text>
                     <Text className="text-xl font-bold text-white">{beat.key || '--'}</Text>
                  </View>
                  <View className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                     <Text className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Genre</Text>
                     <Text className="text-xl font-bold text-primary">{beat.genre || '--'}</Text>
                  </View>
               </View>

               <View className="gap-6">
                  <Card className="p-6 bg-dark-900 border-white/10">
                     <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white font-bold text-xl">Basic License</Text>
                        <Text className="text-primary font-black text-2xl">
                          ${(basicLicense.price / 100).toFixed(2)}
                        </Text>
                     </View>
                     <Text className="text-gray-400 text-sm mb-6">MP3 + Streaming Rights (Limited to 10k streams)</Text>
                     <Button 
                      fullWidth 
                      variant="outline"
                      onPress={() => handleCheckout(basicLicense)}
                      disabled={loading}
                     >
                       {loading ? <ActivityIndicator size="small" color="#005CB9" /> : 'Add to Cart'}
                     </Button>
                  </Card>

                  <Card className="p-6 bg-primary border-primary">
                     <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-black font-black text-xl">Full Rights</Text>
                        <Text className="text-black font-black text-2xl">
                          ${(exclusiveLicense.price / 100).toFixed(2)}
                        </Text>
                     </View>
                     <Text className="text-black/80 font-medium text-sm mb-6">WAV + Stems + Full Ownership + Unlimited Rights</Text>
                     <Button 
                      fullWidth 
                      className="bg-black"
                      onPress={() => handleCheckout(exclusiveLicense)}
                      disabled={loading}
                     >
                        <Text className="text-white font-bold">Purchase Exclusive</Text>
                     </Button>
                  </Card>
               </View>

               {beat.description && (
                 <View className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <Text className="text-white font-bold mb-2">Description</Text>
                    <Text className="text-gray-400 leading-6">{beat.description}</Text>
                 </View>
               )}
            </View>

          </View>
        </View>
      </View>
      <View className="h-24" />
    </ScrollView>
  );
}
