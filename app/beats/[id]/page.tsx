'use client';

import { use } from 'react';
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
  Repeat
} from 'lucide-react';
import { usePlayer } from '@/stores/player';
import toast from 'react-hot-toast';

// Mock Data
const MOCK_BEAT = {
  id: '1',
  title: 'Midnight Dreams',
  producer: 'Metro Vibes',
  genre: 'Trap',
  bpm: 140,
  key: 'F# Minor',
  duration: '3:05',
  date: 'Jan 24, 2026',
  price: 29.99,
  audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  description: 'A smooth, atmospheric trap beat with heavy 808s and ethereal melodies. Perfect for late-night vibes and melodic rap flows.',
  tags: ['Melodic', 'Dark', 'Ambient', 'Chill']
};

export default function BeatDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentBeat, isPlaying, setCurrentBeat, togglePlayPause } = usePlayer();
  
  const isCurrentBeat = currentBeat?.id === MOCK_BEAT.id;

  const handlePlay = () => {
    if (isCurrentBeat) {
      togglePlayPause();
    } else {
      setCurrentBeat({
        id: MOCK_BEAT.id,
        title: MOCK_BEAT.title,
        genre: MOCK_BEAT.genre,
        bpm: MOCK_BEAT.bpm.toString(),
        audio_url: MOCK_BEAT.audio_url,
        cover_url: '',
      } as any);
    }
  };

  const handleCart = () => {
    toast.success(`${MOCK_BEAT.title} added to cart!`, {
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
    });
  };

  const handleShare = () => {
    toast('Link copied to clipboard!', { icon: '🔗' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Artwork & Player */}
            <div className="lg:col-span-1 space-y-8">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5 relative overflow-hidden group shadow-2xl">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-32 h-32 text-white/5 opacity-20" />
                 </div>
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
                <Button variant="outline" className="h-14 aspect-square p-0" onClick={handleShare}>
                   <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Middle Column: Info */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="primary" className="bg-primary/10 text-primary border-none">Exclusive Available</Badge>
                  <span className="text-gray-500 flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4" /> {MOCK_BEAT.date}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 italic tracking-tight">
                  {MOCK_BEAT.title.toUpperCase()}
                </h1>
                <Link href={`/producers/metro-vibes`} className="text-xl text-primary hover:underline font-bold">
                  {MOCK_BEAT.producer}
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-8 items-center bg-dark-900/50 p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">BPM</span>
                   <span className="text-white font-bold text-xl">{MOCK_BEAT.bpm}</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Key</span>
                   <span className="text-white font-bold text-xl">{MOCK_BEAT.key}</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Duration</span>
                   <span className="text-white font-bold text-xl">{MOCK_BEAT.duration}</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Genre</span>
                   <span className="text-primary font-bold text-xl">{MOCK_BEAT.genre}</span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-dark-900 border-white/5 hover:border-primary/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-white text-lg">Basic License</h3>
                      <span className="text-2xl font-black text-primary">$29.99</span>
                   </div>
                   <p className="text-sm text-gray-500 mb-6 line-clamp-2">MP3 + Streaming Rights (Limited to 10k streams)</p>
                   <Button fullWidth onClick={handleCart} variant="outline" className="group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                      Add to Cart
                   </Button>
                </Card>
                <Card className="p-6 bg-primary border-primary transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-black text-lg">Exclusive Rights</h3>
                      <span className="text-2xl font-black text-black">$499.99</span>
                   </div>
                   <p className="text-sm text-black/70 mb-6 line-clamp-2">WAV + Stems + Full Ownership + Unlimited Rights</p>
                   <Button fullWidth onClick={handleCart} className="bg-black text-white hover:bg-black/90 border-none transition-all">
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
                       "{MOCK_BEAT.description}"
                    </p>
                 </div>
                 <div className="flex flex-wrap gap-2 pt-4">
                    {MOCK_BEAT.tags.map(tag => (
                      <Badge key={tag} className="bg-white/5 text-gray-400 border-white/10 px-4 py-1">#{tag.toLowerCase()}</Badge>
                    ))}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
