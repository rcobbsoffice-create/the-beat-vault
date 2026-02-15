import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { BeatCard } from '@/components/BeatCard';
import { 
  Play, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Search,
  Sparkles,
  Cpu,
  BarChart3
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width: windowWidth } = Dimensions.get('window');

export default function Home() {
  const [trendingBeats, setTrendingBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*, producer:profiles(*), licenses(*)')
          .eq('status', 'published')
          .order('play_count', { ascending: false })
          .limit(4);

        if (!error && data) {
          setTrendingBeats(data);
        }
      } catch (error) {
        console.error('Error fetching trending beats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-black">
      {/* SECTION 1: CINEMATIC HERO */}
      <View className="relative h-[85vh] md:h-[90vh] justify-center overflow-hidden">
        {/* Background Elements */}
        <View className="absolute inset-0">
          <Image 
            source={require('../assets/hero-bg.png')}
            className="w-full h-full object-cover"
          />
          <View className="absolute inset-0 bg-black/60" />
          <View className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <View className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </View>

        {/* Floating Glow Orbs */}
        <View className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <View className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />

        <View className="px-6 md:px-12 lg:px-20 z-10 max-w-7xl w-full mx-auto">
          <View className="max-w-4xl">
            <View className="inline-flex self-start flex-row items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md">
              <Sparkles size={16} color="#0066cc" />
              <Text className="text-primary text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">The Future of Production</Text>
            </View>
            
            <Text className="text-5xl md:text-7xl lg:text-[110px] font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
              THE DNA OF {'\n'}
              <Text className="text-primary">MODERN MUSIC</Text>
            </Text>
            
            <Text className="text-lg md:text-xl lg:text-3xl text-gray-400 font-medium mb-12 max-w-2xl leading-relaxed">
              Empowering Producers with AI-driven analytics.{'\n'}Connecting Artists with the world's most intelligent sounds.
            </Text>

            <View className="flex-col sm:flex-row gap-6">
              <Link href="/marketplace" asChild>
                <Button className="h-16 md:h-20 px-10 md:px-12 rounded-2xl bg-primary">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-black font-black text-lg md:text-xl uppercase tracking-wider">Browse Marketplace</Text>
                    <ArrowRight size={24} color="black" />
                  </View>
                </Button>
              </Link>
              <Link href="/signup" asChild>
                <Button variant="outline" className="h-16 md:h-20 px-10 md:px-12 rounded-2xl border-white/20 backdrop-blur-md">
                  <Text className="text-white font-black text-lg md:text-xl uppercase tracking-wider">Join as Producer</Text>
                </Button>
              </Link>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION 2: ECOSYSTEM OVERVIEW */}
      <View className="py-24 md:py-32 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <View className="items-center mb-16 md:mb-24">
          <Text className="text-primary text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-6">The AudioGenes Ecosystem</Text>
          <Text className="text-4xl md:text-6xl lg:text-7xl font-black text-white italic tracking-tighter uppercase text-center max-w-5xl">Total Production Integration</Text>
        </View>

        <View className="flex-col md:flex-row gap-8">
          <View className="flex-1 p-8 lg:p-12 bg-dark-900 border border-white/5 rounded-[40px] shadow-2xl">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-8">
              <Search size={32} color="#0066cc" />
            </View>
            <Text className="text-2xl lg:text-3xl font-black text-white uppercase italic mb-6">Intelligent Search</Text>
            <Text className="text-gray-400 text-lg leading-relaxed font-medium">Find the perfect "Gene" for your track using AI-driven metadata that understands mood, energy, and musical intent.</Text>
          </View>

          <View className="flex-1 p-8 lg:p-12 bg-dark-900 border border-white/5 rounded-[40px] shadow-2xl">
            <View className="w-16 h-16 bg-secondary/10 rounded-2xl items-center justify-center mb-8">
              <ShieldCheck size={32} color="#2563eb" />
            </View>
            <Text className="text-2xl lg:text-3xl font-black text-white uppercase italic mb-6">Secure Licensing</Text>
            <Text className="text-gray-400 text-lg leading-relaxed font-medium">Automated contracts and instant file delivery via high-security R2 storage ensures your IP is always protected.</Text>
          </View>

          <View className="flex-1 p-8 lg:p-12 bg-dark-900 border border-white/5 rounded-[40px] shadow-2xl">
            <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mb-8">
              <BarChart3 size={32} color="white" />
            </View>
            <Text className="text-2xl lg:text-3xl font-black text-white uppercase italic mb-6">Live Analytics</Text>
            <Text className="text-gray-400 text-lg leading-relaxed font-medium">Producers get real-time tracking for every play, view, and favorite, turning data into actionable release strategies.</Text>
          </View>
        </View>
      </View>

      {/* SECTION 3: FEATURE SHOWCASE (AI DNA) */}
      <View className="py-24 md:py-32 bg-dark-950 border-y border-white/5 overflow-hidden">
        <View className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <View className="w-full lg:w-1/2 aspect-square relative">
            <View className="absolute inset-0 bg-primary/10 rounded-full blur-[80px]" />
            <Image 
              source={require('../assets/features-dna.png')}
              className="w-full h-full rounded-[40px] shadow-2xl opacity-90"
              resizeMode="cover"
            />
          </View>
          
          <View className="w-full lg:w-1/2 space-y-12">
            <View>
              <Text className="text-secondary text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-6">The Intelligent Core</Text>
              <Text className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-8 leading-none">AI-POWERED{'\n'}METADATA AGENT</Text>
              <Text className="text-xl text-gray-300 leading-relaxed font-medium">
                Our proprietary AI analysis engine automatically extracts the "Musical Fingerprint" of every upload. Detect BPM, Key, Genre, and Mood without lifting a finger. 
              </Text>
            </View>

            <View className="gap-8">
              <View className="flex-row items-start gap-6">
                <View className="w-10 h-10 rounded-full bg-secondary/10 items-center justify-center mt-1">
                  <Zap size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-black uppercase text-lg tracking-widest italic">Instant Extraction</Text>
                  <Text className="text-gray-400 text-base mt-2">Get precise BPM and Key measurements in seconds.</Text>
                </View>
              </View>
              <View className="flex-row items-start gap-6">
                <View className="w-10 h-10 rounded-full bg-secondary/10 items-center justify-center mt-1">
                  <Cpu size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-black uppercase text-lg tracking-widest italic">Genre Classification</Text>
                  <Text className="text-gray-400 text-base mt-2">Deep learning models categorize your beats into specific sub-genres automatically.</Text>
                </View>
              </View>
            </View>

            <Link href="/technology" asChild>
              <TouchableOpacity className="h-16 px-10 border border-secondary/20 rounded-2xl self-start flex-row items-center gap-3">
                <Text className="text-secondary font-black uppercase italic tracking-widest text-base">Learn About the Engine</Text>
                <ArrowRight size={18} color="#2563eb" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      {/* SECTION 4: MARKETPLACE TEASER */}
      <View className="py-24 md:py-32 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <View className="flex-row justify-between items-end mb-16">
          <View>
            <Text className="text-primary text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-6">Trending Genes</Text>
            <Text className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">EXPLORE THE VAULT</Text>
          </View>
          <Link href="/marketplace" asChild>
            <TouchableOpacity className="hidden md:flex flex-row items-center gap-3 px-10 h-16 border border-white/10 rounded-2xl bg-white/5">
              <Text className="text-white font-black uppercase italic tracking-widest text-lg">View All</Text>
              <Play size={14} color="white" fill="white" />
            </TouchableOpacity>
          </Link>
        </View>

        {loading ? (
          <ActivityIndicator color="#0066cc" size="large" />
        ) : (
          <View className="flex-row flex-wrap gap-8 justify-between">
            {trendingBeats.map((beat) => (
              <View key={beat.id} className="w-full md:w-[47%] lg:w-[23%]">
                <BeatCard beat={beat} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* NEW SECTION: ABOUT US / PHILOSOPHY */}
      <View className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-dark-900/30 border-y border-white/5">
        <View className="max-w-7xl mx-auto w-full">
          <View className="mb-20">
            <Text className="text-secondary text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-6">Behind the Genes</Text>
            <Text className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase max-w-4xl">
              CURATING THE FUTURE OF {'\n'}
              <Text className="text-secondary">SONIC ARCHITECTURE</Text>
            </Text>
          </View>

          <View className="flex-col md:flex-row gap-12 lg:gap-20">
            <View className="flex-1 space-y-6">
              <View className="w-12 h-12 rounded-2xl bg-secondary/10 items-center justify-center">
                <Sparkles size={24} color="#005CB9" />
              </View>
              <Text className="text-xl font-black text-white uppercase italic tracking-widest">Our Vision</Text>
              <Text className="text-gray-400 text-lg leading-relaxed">
                AudioGenes was born from a simple belief: that music is data, and every sound carries a unique genetic code. We've built the world's first platform that treats audio as a living, evolving ecosystem.
              </Text>
            </View>

            <View className="flex-1 space-y-6">
              <View className="w-12 h-12 rounded-2xl bg-secondary/10 items-center justify-center">
                <Cpu size={24} color="#005CB9" />
              </View>
              <Text className="text-xl font-black text-white uppercase italic tracking-widest">The Technology</Text>
              <Text className="text-gray-400 text-lg leading-relaxed">
                By integrating ACRCloud fingerprinting and proprietary AI analysis, we provide producers with a level of transparency and protection never before seen in the independent beat market.
              </Text>
            </View>

            <View className="flex-1 space-y-6">
              <View className="w-12 h-12 rounded-2xl bg-secondary/10 items-center justify-center">
                <ShieldCheck size={24} color="#005CB9" />
              </Text>
              <Text className="text-xl font-black text-white uppercase italic tracking-widest">The Community</Text>
              <Text className="text-gray-400 text-lg leading-relaxed">
                We are more than a marketplace—we are a vault. A secure, high-performance environment where the next generation of multi-platinum producers build their catalogs and protect their legacies.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* FINAL CTA */}
      <View className="py-32 md:py-48 bg-gradient-to-b from-black via-dark-900 to-black justify-center relative overflow-hidden">
        <View className="absolute inset-0 bg-primary/5 rounded-full blur-[180px] scale-150" />
        
        <View className="px-6 text-center max-w-5xl mx-auto z-10">
          <Text className="text-6xl md:text-8xl lg:text-[100px] font-black text-white italic tracking-tighter uppercase text-center mb-12 leading-none">Ready to{'\n'}evolve?</Text>
          <Text className="text-xl md:text-2xl text-gray-500 text-center mb-16 font-medium max-w-3xl mx-auto leading-relaxed">
            Join thousands of producers and artists who have already upgraded their workflow with AudioGenes.
          </Text>
          <View className="flex-col sm:flex-row gap-8 justify-center">
            <Link href="/signup" asChild>
              <Button className="h-20 md:h-24 px-12 md:px-16 rounded-[30px] bg-primary">
                <Text className="text-black font-black text-xl md:text-2xl uppercase tracking-widest">Create Account</Text>
              </Button>
            </Link>
            <Link href="/contact" asChild>
              <Button variant="outline" className="h-20 md:h-24 px-12 md:px-16 rounded-[30px] border-white/10 backdrop-blur-md">
                <Text className="text-white font-black text-xl md:text-2xl uppercase tracking-widest">Contact Sales</Text>
              </Button>
            </Link>
          </View>
        </View>
      </View>

      <View className="h-24" />
    </ScrollView>
  );
}
