'use client';

import { use, useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Music, MapPin, Globe, Instagram, Twitter, Mail, Check, Star, Play, Share2, Loader2, AlertCircle } from 'lucide-react';
import { usePlayer } from '@/stores/player';
import { useMerchStore } from '@/stores/merch';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

export default function ProducerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { items: merchItems } = useMerchStore();
  const player = usePlayer();
  const [mounted, setMounted] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producer, setProducer] = useState<any>(null);
  const [beats, setBeats] = useState<any[]>([]);

  const { setCurrentBeat, currentBeat, isPlaying, togglePlayPause } = player;

  useEffect(() => {
    setMounted(true);
    setWaveformHeights(Array.from({ length: 40 }, () => Math.random() * 100));

    async function fetchProducerData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Find profile by display_name (case-insensitive slug match)
        // Note: In a production app, we should use a dedicated 'slug' field.
        // For now, we'll try to match the display_name.
        const displayName = slug.split('-').join(' ');
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'producer')
          .ilike('display_name', displayName)
          .limit(1);

        if (profileError) throw profileError;
        
        if (!profiles || profiles.length === 0) {
          // Try a second attempt: direct match if ilike fails or slug is weird
          const { data: secondAttempt } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'producer')
            .eq('display_name', displayName)
            .limit(1);
            
          if (!secondAttempt || secondAttempt.length === 0) {
            setError('Producer not found');
            return;
          }
          setProducer(secondAttempt[0]);
        } else {
          setProducer(profiles[0]);
        }

        const profileId = profiles?.[0]?.id || (producer?.id);
        if (!profileId) return;

        // 2. Fetch Beats for this producer
        const { data: beatsData, error: beatsError } = await supabase
          .from('beats')
          .select('*')
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
      // Use internal stream endpoint if URL is private or needs bypass, 
      // but if it's already a public R2 URL, use it directly.
      const audioUrl = beat.audio_url || beat.preview_url || beat.audio;
      
      setCurrentBeat({
        ...beat,
        audio_url: audioUrl,
        preview_url: audioUrl,
        cover_url: beat.artwork_url || '',
      });
    }
  };

  const handleAddToCart = (beat: any) => {
    toast.success(`${beat.title} added to cart!`, {
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-gray-400 font-medium animate-pulse">Loading Producer Profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !producer) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md px-4">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Producer Not Found</h1>
              <p className="text-gray-400">The profile you are looking for doesn't exist or has been moved.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/producers'}>
              Browse All Producers
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const featuredBeat = beats.length > 0 ? beats[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative h-[400px] w-full">
          {/* Cover Image/Linear */}
          <div className="absolute inset-0 bg-linear-to-r from-dark-900 to-dark-800">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
             <div className="absolute inset-0 bg-linear-to-t from-dark-950 via-dark-950/50 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-end gap-8">
                {/* Avatar */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-950 bg-dark-800 relative shadow-2xl shrink-0 -mb-4 overflow-hidden">
                  {producer.avatar_url ? (
                    <img src={producer.avatar_url} alt={producer.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-purple-600 animate-gradient-xy flex items-center justify-center">
                      <Music className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 mb-2 md:mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl md:text-5xl font-bold text-white">{producer.display_name}</h1>
                        <Badge variant="primary" className="bg-primary text-black border-none">Verified</Badge>
                      </div>
                      <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
                        <MapPin className="w-4 h-4 text-primary" />
                        {producer.location || 'Professional Producer'}
                        <span className="mx-1 text-dark-700">|</span>
                        <span className="text-white font-medium capitalize">{producer.role}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" className="glass border-white/10 hover:bg-white/10 text-white gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                      <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 shadow-lg shadow-white/10">
                        Hire Me
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="border-y border-white/5 bg-dark-900/50 backdrop-blur-sm sticky top-[72px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 overflow-x-auto">
              <div className="flex gap-8 md:gap-12 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Total Plays</span>
                  <span className="text-white font-bold text-lg">--</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Solds</span>
                  <span className="text-white font-bold text-lg">--</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Followers</span>
                  <span className="text-white font-bold text-lg">--</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Tracks</span>
                  <span className="text-white font-bold text-lg">{beats.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-400">
                 <Mail className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content (Beats) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Featured Beat */}
              {featuredBeat && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-primary fill-current" />
                    <h2 className="text-xl font-bold text-white">Featured Track</h2>
                  </div>
                  
                  <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-32 h-32 rounded-xl bg-dark-800 relative shrink-0 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-linear-to-br from-dark-700 to-black flex items-center justify-center">
                          {featuredBeat.artwork_url ? (
                            <img src={featuredBeat.artwork_url} alt={featuredBeat.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-12 h-12 text-gray-600" />
                          )}
                        </div>
                        {/* Play Button Overlay */}
                        <button 
                          onClick={() => handlePlayBeat(featuredBeat)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] z-10"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            {currentBeat?.id === featuredBeat.id && isPlaying ? (
                              <div className="flex gap-1 items-end h-3">
                                 <div className="w-1 bg-black animate-pulse" />
                                 <div className="w-1 bg-black animate-pulse delay-75" />
                                 <div className="w-1 bg-black animate-pulse delay-150" />
                              </div>
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-1" />
                            )}
                          </div>
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl font-bold text-white truncate">{featuredBeat.title}</h3>
                            <p className="text-primary font-medium">{featuredBeat.genre} • {featuredBeat.bpm} BPM</p>
                          </div>
                        </div>
                        
                        {/* Fake Waveform */}
                        <div className="h-12 w-full flex items-end gap-1 opacity-60 mb-4">
                          {waveformHeights.map((height, i) => (
                            <div 
                              key={i} 
                              style={{ height: `${height}%` }} 
                              className={`flex-1 rounded-full ${i % 3 === 0 ? 'bg-primary' : 'bg-white/20'}`} 
                            />
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 bg-primary text-black hover:bg-primary-dark font-bold"
                            onClick={() => handleAddToCart(featuredBeat)}
                          >
                            Add to Cart
                          </Button>
                          <Button variant="outline" className="border-white/10 hover:bg-white/5">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* All Beats List */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Latest Releases</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-white bg-white/5">Newest</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {beats.length === 0 ? (
                    <div className="text-center py-12 bg-dark-900/20 rounded-2xl border border-dashed border-white/5">
                      <Music className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500">No tracks published yet.</p>
                    </div>
                  ) : beats.map((beat, i) => (
                    <div key={beat.id} className="group flex items-center gap-4 p-3 rounded-xl bg-dark-900/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                      <span className="text-gray-500 w-6 text-center font-mono text-sm">{i + 1}</span>
                      
                      <div className="w-12 h-12 rounded-lg bg-dark-800 shrink-0 relative overflow-hidden">
                         <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-800 to-black">
                           {beat.artwork_url ? (
                             <img src={beat.artwork_url} alt={beat.title} className="w-full h-full object-cover" />
                           ) : (
                             <Music className="w-5 h-5 text-gray-600" />
                           )}
                         </div>
                         <button 
                            onClick={() => handlePlayBeat(beat)}
                            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                              currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {currentBeat?.id === beat.id && isPlaying ? (
                               <div className="flex gap-0.5 items-end h-3">
                                  <div className="w-0.5 h-3 bg-white animate-pulse" />
                                  <div className="w-0.5 h-4 bg-white animate-pulse delay-75" />
                                  <div className="w-0.5 h-2 bg-white animate-pulse delay-150" />
                               </div>
                            ) : (
                               <Play className="w-4 h-4 text-white fill-white" />
                            )}
                         </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{beat.title}</h4>
                        <p className="text-xs text-gray-400">
                          {beat.bpm} BPM • {beat.key} • <span className="text-primary">{beat.genre}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-white/10 hover:border-primary hover:text-primary rounded-full px-4"
                          onClick={() => handleAddToCart(beat)}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar (About) */}
            <div className="space-y-8">
              <div className="bg-dark-900 border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">About</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {producer.bio || 'Professional music producer creating high-quality tracks for artists worldwide.'}
                </p>
                
                <h4 className="font-bold text-white text-sm mb-3">Service Includes</h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-primary" /> High Quality WAVs
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-primary" /> Trackout Stems
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-primary" /> Unlimited License Rights
                  </li>
                </ul>

                <Button 
                  fullWidth 
                  className="bg-white/5 text-white hover:bg-white/10"
                  onClick={() => window.location.href = `mailto:${producer.email}`}
                >
                   Contact
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
