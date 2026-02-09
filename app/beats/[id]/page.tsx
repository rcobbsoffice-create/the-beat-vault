'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Music, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { usePlayer } from '@/stores/player';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { LinearVisualizer } from '@/components/LinearVisualizer';
import { sanitizeUrl } from '@/lib/utils/url';
import Image from 'next/image';

type BeatRow = Database['public']['Tables']['beats']['Row'];
type LicenseRow = Database['public']['Tables']['licenses']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

type Beat = BeatRow & {
  favorite_count?: number;
  play_count?: number;
  view_count?: number;
  licenses?: LicenseRow[];
  is_sync_ready?: boolean;
  producer?: ProfileRow;
};

export default function BeatDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentBeat, isPlaying, analyser, setCurrentBeat, togglePlayPause } = usePlayer();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const isCurrentBeat = currentBeat?.id === beat?.id;

  useEffect(() => {
    async function fetchBeat() {
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
        setBeat(data as any);
        
        fetch(`/api/beats/${id}/track-view`, { method: 'POST' })
          .catch(err => console.error('Failed to track view:', err));
          
      } catch (err) {
        console.error('Error fetching beat:', err);
        setError('Beat not found');
      } finally {
        setLoading(false);
      }
    }
    fetchBeat();
  }, [id]);

  useEffect(() => {
    async function checkFavorite() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !beat) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('beat_id', beat.id)
        .maybeSingle();
      
      setIsFavorited(!!data);
    }
    checkFavorite();
  }, [beat?.id]);

  const handleFavorite = async () => {
    if (!beat) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to favorite beats');
      return;
    }

    const wasFavorited = isFavorited;
    setIsFavorited(!wasFavorited);
    setBeat(prev => prev ? {
      ...prev,
      favorite_count: Math.max(0, (prev.favorite_count || 0) + (wasFavorited ? -1 : 1))
    } as any : null);

    try {
      const response = await fetch(`/api/beats/${beat.id}/favorite`, { method: 'POST' });
      const resData = await response.json();
      
      if (resData.error) {
        toast.error('Failed to update favorite');
        setIsFavorited(wasFavorited);
        setBeat(prev => prev ? {
          ...prev,
          favorite_count: Math.max(0, (prev.favorite_count || 0) + (wasFavorited ? 1 : -1))
        } as any : null);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const handlePlay = () => {
    if (!beat) return;
    if (isCurrentBeat) {
      togglePlayPause();
    } else {
      setCurrentBeat(beat);
    }
  };

  const handleCart = (licenseType: string) => {
    if (!beat) return;
    toast.success(`${beat.title} (${licenseType}) added to cart!`);
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: beat?.title,
        text: `Check out this beat: ${beat?.title}`,
        url: url,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      });
    } else {
      navigator.clipboard.writeText(url);
      toast('Link copied to clipboard!', { icon: '🔗' });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (error || !beat) {
    return <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-white gap-4">
      <h1 className="text-2xl font-bold">{error || 'Beat not found'}</h1>
      <Link href="/marketplace">
        <Button>Back to Marketplace</Button>
      </Link>
    </div>;
  }

  const basePrice = (beat.licenses?.find(l => l.type === 'basic')?.price || 2999) / 100;
  const exclusivePrice = (beat.licenses?.find(l => l.type === 'exclusive')?.price || 49999) / 100;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Immersive Blurred Background */}
        {beat.artwork_url && (
          <div className="absolute inset-0 pointer-events-none">
            <Image 
              src={sanitizeUrl(beat.artwork_url)} 
              alt="" 
              fill 
              className="object-cover opacity-10 blur-[100px] scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/80 to-dark-950" />
            
            {/* Background Linear Visualizer */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30 flex items-end justify-center">
               <LinearVisualizer 
                 analyser={isCurrentBeat ? analyser : null} 
                 isPlaying={isCurrentBeat && isPlaying}
                 height={300}
                 barWidth={10}
                 gap={4}
               />
            </div>
          </div>
        )}

        <div className="relative pt-32 pb-24 max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/marketplace" className="text-gray-400 hover:text-primary transition-colors text-sm">
              ← Back to Marketplace
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Artwork Hero */}
            <div className="space-y-6">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-dark-900 to-secondary/10 border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/10">
                 {beat.artwork_url ? (
                   <Image 
                    src={sanitizeUrl(beat.artwork_url)} 
                    alt={beat.title} 
                    fill 
                    className="object-cover"
                    priority
                   />
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-900">
                      <Music className="w-48 h-48 text-primary/20" />
                    </div>
                  )}
                 
                 {/* Play Button Overlay */}
                 <button 
                  onClick={handlePlay}
                  className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                 >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/50 transform scale-90 group-hover:scale-100 transition-transform">
                      {isCurrentBeat && isPlaying ? (
                        <Pause className="w-14 h-14 text-black fill-current" />
                      ) : (
                        <Play className="w-14 h-14 text-black fill-current ml-2" />
                      )}
                    </div>
                 </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <Button fullWidth onClick={handlePlay} size="lg" className="h-16 text-lg font-bold">
                   {isCurrentBeat && isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                   {isCurrentBeat && isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" size="lg" className="h-16" onClick={handleFavorite}>
                   <Heart className={`w-5 h-5 ${isFavorited ? 'text-secondary fill-secondary' : ''}`} />
                </Button>
                <Button variant="outline" size="lg" className="h-16" onClick={handleShare}>
                   <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-dark-900/50 backdrop-blur-xl rounded-2xl border border-white/5">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{beat.play_count || 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Plays</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{(beat as any).view_count || 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{beat.favorite_count || 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Favorites</div>
                </div>
              </div>
            </div>

            {/* Right: Info & Pricing */}
            <div className="space-y-8">
              <div>
                {beat.is_sync_ready && <Badge variant="primary" className="mb-4 text-base px-4 py-1">Sync Ready</Badge>}
                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(beat.created_at || new Date()).toLocaleDateString()}
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tighter">
                  {beat.title}
                </h1>
                <Link href={`/producers/${beat.producer_id}`} className="text-2xl text-primary hover:underline font-bold inline-block mb-8">
                  by {beat.producer?.display_name || 'Unknown Producer'}
                </Link>
              </div>

              {/* Metadata Pills */}
              <div className="flex flex-wrap gap-6">
                <div className="px-6 py-4 bg-dark-900/70 backdrop-blur-xl rounded-2xl border border-white/10">
                   <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">BPM</div>
                   <div className="text-2xl font-black text-white">{beat.bpm || '--'}</div>
                </div>
                <div className="px-6 py-4 bg-dark-900/70 backdrop-blur-xl rounded-2xl border border-white/10">
                   <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Key</div>
                   <div className="text-2xl font-black text-white">{beat.key || '--'}</div>
                </div>
                <div className="px-6 py-4 bg-dark-900/70 backdrop-blur-xl rounded-2xl border border-white/10">
                   <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Duration</div>
                   <div className="text-2xl font-black text-white">
                      {beat.duration ? `${Math.floor(beat.duration / 60)}:${(beat.duration % 60).toString().padStart(2, '0')}` : '--'}
                   </div>
                </div>
                <div className="px-6 py-4 bg-dark-900/70 backdrop-blur-xl rounded-2xl border border-white/10">
                   <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Genre</div>
                   <div className="text-2xl font-black text-primary">{beat.genre || '--'}</div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-8 bg-gradient-to-br from-dark-900 to-dark-950 border-white/10 hover:border-primary/50 transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <h3 className="font-black text-white text-2xl">Basic License</h3>
                      <span className="text-4xl font-black text-primary">${basePrice.toFixed(2)}</span>
                   </div>
                   <p className="text-gray-400 mb-8">MP3 + Streaming Rights (Limited to 10k streams)</p>
                   <Button fullWidth onClick={() => handleCart('Basic')} size="lg" variant="outline" className="group-hover:bg-primary group-hover:text-black transition-all h-14 text-lg font-bold">
                      Add to Cart
                   </Button>
                </Card>
                <Card className="p-8 bg-gradient-to-br from-primary via-primary/90 to-secondary border-primary relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-black text-primary px-4 py-1 text-xs font-bold rounded-bl-xl">EXCLUSIVE</div>
                   <div className="flex justify-between items-start mb-6">
                      <h3 className="font-black text-black text-2xl">Full Rights</h3>
                      <span className="text-4xl font-black text-black">${exclusivePrice.toFixed(2)}</span>
                   </div>
                   <p className="text-black/80 mb-8 font-medium">WAV + Stems + Full Ownership + Unlimited Rights</p>
                   <Button fullWidth onClick={() => handleCart('Exclusive')} size="lg" className="bg-black text-white hover:bg-black/90 h-14 text-lg font-bold">
                      Purchase Exclusive
                   </Button>
                </Card>
              </div>

              {/* Description */}
              {beat.description && (
                <div className="p-6 bg-dark-900/30 backdrop-blur-xl rounded-2xl border border-white/5">
                   <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" /> Description
                   </h3>
                   <p className="text-gray-300 leading-relaxed">
                      {beat.description}
                   </p>
                </div>
              )}

              {/* Tags */}
              {beat.mood_tags && (
                <div className="flex flex-wrap gap-3">
                   {beat.mood_tags.map(tag => (
                     <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
                       #{tag.toLowerCase()}
                     </Badge>
                   ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
