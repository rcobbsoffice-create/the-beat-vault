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
  ArrowRight,
  AlertCircle 
} from 'lucide-react-native';

export default function ProducerProfile() {
  const { id: slug } = useLocalSearchParams();
  const player = usePlayer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producer, setProducer] = useState<any>(null);
  const [beats, setBeats] = useState<any[]>([]);
  const [soundKits, setSoundKits] = useState<any[]>([]);
  const [merch, setMerch] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

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

        // 3. Fetch Merch (Sound Kits & Apparel)
        const { data: merchData, error: merchError } = await supabase
          .from('merch_products')
          .select('*')
          .eq('producer_id', profileId)
          .eq('status', 'published');

        if (!merchError && merchData) {
          setSoundKits(merchData.filter(m => m.category === 'Sound Pack'));
          setMerch(merchData.filter(m => m.category === 'Apparel'));
        }

        // 4. Fetch News/Articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .eq('author_id', profileId)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (!articlesError && articlesData) {
          setArticles(articlesData);
        }
        
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
        <ActivityIndicator color="#005CB9" />
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
    <ScrollView className="flex-1 bg-black">
      {/* Hero Section - Upgraded with Cinematic Styling */}
      <View className="relative h-[50vh] md:h-[60vh] w-full justify-center overflow-hidden">
        {/* Banner/Cover Image with Dynamic Overlays */}
        <View className="absolute inset-0">
           <Image 
              source={{ uri: producer.cover_image_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop' }}
              className="w-full h-full object-cover"
           />
           <View className="absolute inset-0 bg-black/60" />
           <View className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
           <View className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        </View>

        {/* Floating Glow Orbs */}
        <View className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
        <View className="absolute -bottom-1/4 -left-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]" />

        <View className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-20 z-10">
          <View className="max-w-7xl mx-auto w-full">
            <View className="flex-col md:flex-row items-end gap-8">
              {/* Avatar with Shadow & Border */}
              <View className="w-40 h-40 rounded-3xl border-4 border-white/5 bg-dark-900 shrink-0 overflow-hidden shadow-2xl">
                {producer.avatar_url ? (
                  <Image source={{ uri: producer.avatar_url }} className="w-full h-full" />
                ) : (
                  <View className="flex-1 bg-primary items-center justify-center">
                    <Music size={50} color="#000" />
                  </View>
                )}
              </View>

              {/* Producer Name and Stats */}
              <View className="flex-1 mb-2">
                <View className="flex-row items-center gap-4 mb-2">
                  <Text className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">{producer.display_name}</Text>
                  <Badge variant="primary" className="h-8 px-4 rounded-full">
                    <Text className="text-xs font-black uppercase tracking-widest text-black">Verified</Text>
                  </Badge>
                </View>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-2">
                    <MapPin size={16} color="#0066cc" />
                    <Text className="text-gray-400 font-medium">
                      {producer.location || 'Professional Producer'}
                    </Text>
                  </View>
                  <View className="w-1 h-1 bg-gray-600 rounded-full" />
                  <Text className="text-primary font-black uppercase tracking-widest text-xs">
                    {totalPlays > 0 ? `${totalPlays.toLocaleString()} Plays` : 'Sonic Architect'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-4 mb-4">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 backdrop-blur-md">
                  <View className="flex-row items-center gap-2">
                    <Share2 size={18} color="#fff" />
                    <Text className="text-white font-black uppercase tracking-widest">Share</Text>
                  </View>
                </Button>
                <Button variant="primary" className="h-14 px-10 rounded-2xl bg-primary shadow-lg shadow-primary/20" onPress={handleHireMe}>
                  <Text className="text-black font-black uppercase tracking-widest">Hire Me</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content Layout */}
      <View className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20 py-16">
        <View className="flex-col lg:flex-row gap-20">
          
          <View className="flex-1">
            {/* AD SPACE / SPOTLIGHT BANNER */}
            <TouchableOpacity className="mb-20 group">
              <View className="relative h-48 md:h-64 rounded-[40px] overflow-hidden bg-primary/10 border border-primary/20 p-8 md:p-12 justify-center shadow-2xl">
                <View className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3?q=80&w=2000' }}
                    className="w-full h-full object-cover"
                  />
                </View>
                <View className="z-10">
                  <Text className="text-primary text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-4">Exclusive Spotlight</Text>
                  <Text className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">The Ultimate{'\n'}Production Bible</Text>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white font-black uppercase tracking-widest text-sm">Unlock Access</Text>
                    <ArrowRight size={18} color="white" />
                  </View>
                </View>
                <View className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              </View>
            </TouchableOpacity>

            {/* Featured Track */}
            {featuredBeat && (
              <View className="mb-20">
                <View className="flex-row items-center gap-3 mb-10">
                  <Star size={24} color="#0066cc" fill="#0066cc" />
                  <Text className="text-2xl font-black text-white uppercase italic tracking-tighter">Featured Production</Text>
                </View>
                
                <View className="bg-dark-900 border border-white/5 rounded-[40px] p-10 flex-col md:flex-row gap-10 items-center shadow-2xl">
                  <TouchableOpacity 
                    onPress={() => handlePlayBeat(featuredBeat)}
                    className="w-48 h-48 rounded-3xl bg-dark-800 shrink-0 overflow-hidden items-center justify-center shadow-2xl"
                  >
                    {featuredBeat.artwork_url ? (
                      <Image source={{ uri: featuredBeat.artwork_url }} className="w-full h-full" />
                    ) : (
                      <Music size={60} color="#4B5563" />
                    )}
                    <View className="absolute inset-0 bg-black/40 items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                       {currentBeat?.id === featuredBeat.id && isPlaying ? (
                         <Pause size={40} color="#0066cc" fill="#0066cc" />
                       ) : (
                         <Play size={40} color="#0066cc" fill="#0066cc" />
                       )}
                    </View>
                  </TouchableOpacity>

                  <View className="flex-1">
                    <Text className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-2" numberOfLines={1}>{featuredBeat.title}</Text>
                    <Text className="text-primary font-black uppercase tracking-widest text-sm mb-8">{featuredBeat.genre} • {featuredBeat.bpm} BPM • {featuredBeat.key}</Text>
                    
                    <View className="flex-row gap-4">
                      <Button className="h-16 px-10 rounded-2xl bg-primary flex-1">
                        <Text className="text-black font-black uppercase tracking-widest text-lg">Add to Cart</Text>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 px-10 rounded-2xl border-white/10"
                        onPress={() => router.push(`/beats/${featuredBeat.id}`)}
                      >
                        <Text className="text-white font-black uppercase tracking-widest">Details</Text>
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* SOUND KITS SECTION */}
            {soundKits.length > 0 && (
              <View className="mb-20">
                <View className="flex-row items-center justify-between mb-10">
                  <View className="flex-row items-center gap-3">
                    <Badge variant="outline" className="h-6 w-6 rounded-md items-center justify-center border-primary/20">
                      <Music size={12} color="#0066cc" />
                    </Badge>
                    <Text className="text-2xl font-black text-white uppercase italic tracking-tighter">Sound Kits</Text>
                  </View>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Text className="text-gray-500 font-black uppercase tracking-widest text-xs">View Catalog</Text>
                    <ArrowRight size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-8">
                  {soundKits.map((kit) => (
                    <TouchableOpacity key={kit.id} className="w-64 group">
                      <View className="aspect-square rounded-[32px] bg-dark-900 border border-white/5 overflow-hidden mb-6 shadow-xl group-hover:border-primary/50 transition-all">
                        {kit.image_url ? (
                          <Image source={{ uri: kit.image_url }} className="w-full h-full" />
                        ) : (
                          <View className="flex-1 items-center justify-center">
                            <Music size={40} color="#374151" />
                          </View>
                        )}
                        <View className="absolute bottom-4 right-4 bg-primary px-4 py-2 rounded-xl">
                          <Text className="text-black font-black text-xs">${kit.price}</Text>
                        </View>
                      </View>
                      <Text className="text-xl font-black text-white uppercase italic tracking-tighter mb-1" numberOfLines={1}>{kit.name}</Text>
                      <Text className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Professional Sound Pack</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* MUSIC CATALOG (LATEST RELEASES) */}
            <View className="mb-20">
              <View className="flex-row items-center justify-between mb-10">
                <Text className="text-2xl font-black text-white uppercase italic tracking-tighter">Production Library</Text>
                <Badge className="bg-white/5 border-white/10">
                  <Text className="text-white font-black text-[10px] uppercase tracking-widest">{beats.length} Assets</Text>
                </Badge>
              </View>
              
              <View className="gap-4">
                {beats.length === 0 ? (
                  <View className="py-20 bg-dark-950 rounded-[40px] border border-dashed border-white/10 items-center justify-center">
                    <Music size={48} color="#1F2937" />
                    <Text className="text-gray-500 font-black uppercase tracking-[0.2em] mt-6">Vault Currently Locked</Text>
                  </View>
                ) : beats.map((beat, i) => (
                  <View key={beat.id} className="flex-row items-center gap-6 p-4 rounded-3xl bg-dark-900 border border-white/5 group hover:border-primary/30 transition-all shadow-xl">
                    <Text className="text-gray-700 w-6 text-center font-black italic tracking-tighter text-lg">{i + 1}</Text>
                    
                    <TouchableOpacity 
                      onPress={() => handlePlayBeat(beat)}
                      className="w-16 h-16 rounded-2xl bg-dark-800 shrink-0 items-center justify-center relative overflow-hidden shadow-lg"
                    >
                      {beat.artwork_url ? (
                        <Image source={{ uri: beat.artwork_url }} className="w-full h-full" />
                      ) : (
                        <Music size={24} color="#374151" />
                      )}
                      <View className="absolute inset-0 bg-black/30 items-center justify-center opacity-80 group-hover:opacity-100">
                         {currentBeat?.id === beat.id && isPlaying ? (
                           <Pause size={20} color="#fff" />
                         ) : (
                           <Play size={20} color="#fff" />
                         )}
                      </View>
                    </TouchableOpacity>

                    <View className="flex-1">
                      <Text className="font-black text-white uppercase italic tracking-tighter text-lg" numberOfLines={1}>{beat.title}</Text>
                      <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">
                        {beat.bpm} BPM • {beat.key} • {(beat.genres && beat.genres.length > 0 ? beat.genres : [beat.genre]).map((g, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <Text className="text-gray-600"> / </Text>}
                            <Text className="text-primary">{g}</Text>
                          </React.Fragment>
                        ))}
                      </Text>
                    </View>

                    <TouchableOpacity className="h-10 px-6 rounded-full bg-white/5 border border-white/10 items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <Text className="text-xs font-black uppercase tracking-widest text-white group-hover:text-black">Buy</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* MERCH SECTION */}
            {merch.length > 0 && (
              <View className="mb-20">
                <View className="flex-row items-center justify-between mb-10">
                  <Text className="text-2xl font-black text-white uppercase italic tracking-tighter">Exclusive Merch</Text>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Text className="text-gray-500 font-black uppercase tracking-widest text-xs">Shop All</Text>
                    <ArrowRight size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-8">
                  {merch.map((item) => (
                    <TouchableOpacity key={item.id} className="w-72">
                      <View className="h-96 rounded-[40px] bg-dark-900 border border-white/5 overflow-hidden mb-6 shadow-2xl relative">
                        {item.image_url ? (
                          <Image source={{ uri: item.image_url }} className="w-full h-full object-cover" />
                        ) : (
                          <View className="flex-1 items-center justify-center bg-dark-800">
                            <Star size={48} color="#1F2937" />
                          </View>
                        )}
                        <View className="absolute top-6 right-6">
                          <View className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <Text className="text-white font-black text-xs tracking-widest">${item.price}</Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-xl font-black text-white uppercase italic tracking-tighter mb-1" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Limited Edition Apparel</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* NEWS & WRITE-UPS SECTION */}
            {articles.length > 0 && (
              <View className="mb-20">
                <View className="flex-row items-center justify-between mb-10">
                  <Text className="text-2xl font-black text-white uppercase italic tracking-tighter">Featured Press</Text>
                  <Link href="/news" asChild>
                    <TouchableOpacity className="flex-row items-center gap-2">
                       <Text className="text-gray-500 font-black uppercase tracking-widest text-xs">Read More</Text>
                       <ArrowRight size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </Link>
                </View>
                
                <View className="gap-8">
                  {articles.map((article) => (
                    <TouchableOpacity key={article.id} className="flex-col md:flex-row gap-8 items-center group">
                      <View className="w-full md:w-64 aspect-video rounded-3xl bg-dark-900 border border-white/5 overflow-hidden shadow-xl">
                        {article.image_url ? (
                          <Image source={{ uri: article.image_url }} className="w-full h-full object-cover" />
                        ) : (
                          <View className="flex-1 items-center justify-center bg-dark-800">
                            <Globe size={32} color="#1F2937" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Badge className="bg-primary/10 border-primary/20 mb-4 h-6 self-start">
                          <Text className="text-primary text-[10px] font-black uppercase tracking-widest">{article.category}</Text>
                        </Badge>
                        <Text className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:text-primary transition-colors">{article.title}</Text>
                        <Text className="text-gray-400 font-medium leading-relaxed" numberOfLines={3}>{article.excerpt}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Sidebar - Upgraded Aesthetics */}
          <View className="w-full lg:w-96">
            <View className="bg-dark-900 border border-white/5 rounded-[40px] p-10 mb-10 shadow-2xl relative overflow-hidden">
              <View className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-[40px]" />
              
              <Text className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">Bio Snapshot</Text>
              <Text className="text-gray-400 text-lg leading-relaxed font-medium mb-10">
                {producer.bio || 'Professional music producer creating high-quality tracks for artists worldwide. Specializing in high-energy sonic landscapes.'}
              </Text>
              
              <View className="bg-black/40 rounded-3xl p-6 mb-10 border border-white/5">
                <Text className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6">Service Suite</Text>
                <View className="gap-4">
                  <View className="flex-row items-center gap-4">
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                      <Check size={14} color="#0066cc" />
                    </View>
                    <Text className="text-sm text-gray-400 font-black uppercase tracking-widest">Mastered Audio</Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                      <Check size={14} color="#0066cc" />
                    </View>
                    <Text className="text-sm text-gray-400 font-black uppercase tracking-widest">Stems Included</Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                      <Check size={14} color="#0066cc" />
                    </View>
                    <Text className="text-sm text-gray-400 font-black uppercase tracking-widest">Global Rights</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-all">
                <Text className="text-white font-black uppercase italic tracking-widest">Contact Office</Text>
              </TouchableOpacity>
            </View>

            {/* Newsletter Integration / Socials (Mock) */}
            <View className="bg-primary border border-primary/20 rounded-[40px] p-10 shadow-2xl">
              <Text className="text-black font-black text-xl uppercase italic tracking-tighter mb-4">Join the Lab</Text>
              <Text className="text-black/60 font-medium mb-8">Get exclusive early access to new sound drops and production tips.</Text>
              <TouchableOpacity className="h-14 rounded-2xl bg-black items-center justify-center">
                <Text className="text-white font-black uppercase tracking-widest">Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View className="h-32" />
    </ScrollView>
  );
}
