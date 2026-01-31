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
  ShoppingCart, 
  Heart, 
  Share2, 
  Music, 
  Clock, 
  Calendar,
  Waves,
  MessageSquare,
  Repeat,
  Eye
} from 'lucide-react';
import { usePlayer } from '@/stores/player';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

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
import { sanitizeUrl } from '@/lib/utils/url';
import Image from 'next/image';

export default function BeatDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentBeat, isPlaying, setCurrentBeat, togglePlayPause } = usePlayer();
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
        
        // Track view
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
      toast.error('Please sign in to favorite beats', {
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
      });
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
    toast.success(`${beat.title} (${licenseType}) added to cart!`, {
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
    });
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
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Artwork & Player */}
            <div className="lg:col-span-1 space-y-8">
              <div className="aspect-square rounded-3xl bg-linear-to-br from-primary/20 to-secondary/20 border border-white/5 relative overflow-hidden group shadow-2xl">
                 {beat.artwork_url ? (
                   <Image 
                    src={sanitizeUrl(beat.artwork_url)} 
                    alt={beat.title} 
                    fill 
                    className="object-cover"
                   />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Music className="w-32 h-32 text-white/5 opacity-20" />
                   </div>
                 )}
                 <button 
                  onClick={handlePlay}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                 >
                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      {isCurrentBeat && isPlaying ? (
                        <Pause className="w-10 h-10 text-black fill-current" />
                      ) : (
                        <Play className="w-10 h-10 text-black fill-current ml-2" />
                      )}
                    </div>
                 </button>
              </div>

              <div className="flex gap-4">
                <Button fullWidth onClick={handlePlay} className="h-14 font-black text-lg gap-3">
                   {isCurrentBeat && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                   {isCurrentBeat && isPlaying ? 'Pause Preview' : 'Play Preview'}
                </Button>
                <Button variant="outline" className="h-14 aspect-square p-0" onClick={handleFavorite} title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}>
                   <Heart className={`w-5 h-5 ${isFavorited ? 'text-secondary fill-secondary' : ''}`} />
                </Button>
                <Button variant="outline" className="h-14 aspect-square p-0" onClick={handleShare}>
                   <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Analytics Sub-bar */}
              <div className="flex items-center gap-6 px-4 py-3 bg-dark-900/30 rounded-xl border border-white/5 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>{beat.play_count || 0} plays</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{(beat as any).view_count || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                   <Heart className={`w-4 h-4 ${isFavorited ? 'text-secondary fill-secondary' : ''}`} />
                   <span>{beat.favorite_count || 0} favorites</span>
                </div>
              </div>
            </div>

            {/* Middle Column: Info */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {beat.is_sync_ready && <Badge variant="primary" className="bg-primary/10 text-primary border-none">Exclusive Available</Badge>}
                  <span className="text-gray-500 flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4" /> {new Date(beat.created_at || new Date()).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 italic tracking-tight">
                  {beat.title.toUpperCase()}
                </h1>
                <Link href={`/producers/${beat.producer_id}`} className="text-xl text-primary hover:underline font-bold">
                  {beat.producer?.display_name || 'Unknown Producer'}
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-8 items-center bg-dark-900/50 p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">BPM</span>
                   <span className="text-white font-bold text-xl">{beat.bpm || '--'}</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Key</span>
                   <span className="text-white font-bold text-xl">{beat.key || '--'}</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Duration</span>
                   <span className="text-white font-bold text-xl">
                      {beat.duration ? `${Math.floor(beat.duration / 60)}:${(beat.duration % 60).toString().padStart(2, '0')}` : '--:--'}
                   </span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Genre</span>
                   <span className="text-primary font-bold text-xl">{beat.genre || 'Uncategorized'}</span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-dark-900 border-white/5 hover:border-primary/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-white text-lg">Basic License</h3>
                      <span className="text-2xl font-black text-primary">${basePrice.toFixed(2)}</span>
                   </div>
                   <p className="text-sm text-gray-500 mb-6 line-clamp-2">MP3 + Streaming Rights (Limited to 10k streams)</p>
                   <Button fullWidth onClick={() => handleCart('Basic')} variant="outline" className="group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                      Add to Cart
                   </Button>
                </Card>
                <Card className="p-6 bg-primary border-primary transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-black text-lg">Exclusive Rights</h3>
                      <span className="text-2xl font-black text-black">${exclusivePrice.toFixed(2)}</span>
                   </div>
                   <p className="text-sm text-black/70 mb-6 line-clamp-2">WAV + Stems + Full Ownership + Unlimited Rights</p>
                   <Button fullWidth onClick={() => handleCart('Exclusive')} className="bg-black text-white hover:bg-black/90 border-none transition-all">
                      Purchase Exclusive
                   </Button>
                </Card>
              </div>

              {/* Description & Tags */}
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <MessageSquare className="w-5 h-5 text-primary" /> Description
                    </h3>
                    <p className="text-gray-400 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                       "{beat.description || 'No description provided.'}"
                    </p>
                 </div>
                 {beat.mood_tags && (
                   <div className="flex flex-wrap gap-2 pt-4">
                      {beat.mood_tags.map(tag => (
                        <Badge key={tag} className="bg-white/5 text-gray-400 border-white/10 px-4 py-1">#{tag.toLowerCase()}</Badge>
                      ))}
                   </div>
                 )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
