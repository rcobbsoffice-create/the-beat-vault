'use client';

import { use, useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Music, MapPin, Globe, Instagram, Twitter, Mail, Check, Star, Play, Share2 } from 'lucide-react';
import { usePlayer } from '@/stores/player';
import { useMerchStore } from '@/stores/merch';
import toast from 'react-hot-toast';

// Mock Data
const MOCK_PRODUCER_DATA = {
  name: 'Metro Boomin',
  role: 'Producer',
  location: 'Atlanta, GA',
  bio: 'Multi-platinum producer known for dark, trap beats. Creating the sound of the future one track at a time.',
  stats: {
    beats: 124,
    plays: '1.2M',
    sales: '5.4K',
    followers: '250K'
  },
  socials: {
    website: 'https://metroboomin.com',
    instagram: '#',
    twitter: '#',
    email: 'contact@metro.com'
  },
  featuredBeat: {
    id: 'prod-feat-1',
    title: 'SPACE CADET',
    genre: 'Trap',
    bpm: 144,
    key: 'C Minor',
    price: 29.99,
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  beats: [
    { id: '1', title: 'FUTURE HENDRIX', bpm: 130, key: 'D Minor', genre: 'Trap', price: 29.99, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: '2', title: 'SAVAGE MODE', bpm: 85, key: 'G Minor', genre: 'Dark', price: 29.99, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '3', title: 'HEROES', bpm: 150, key: 'E Minor', genre: 'Hype', price: 29.99, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: '4', title: 'VILLAINS', bpm: 142, key: 'A Minor', genre: 'Trap', price: 29.99, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: '5', title: 'LOW LIFE', bpm: 120, key: 'F Minor', genre: 'R&B', price: 29.99, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: '6', title: 'CONGRATULATIONS', bpm: 110, key: 'B Major', genre: 'Pop', price: 29.99, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  ]
};

export default function ProducerProfilePage({ params }: { params: any }) {
  const { slug } = use(params);
  const { addToCart } = useMerchStore();
  const player = usePlayer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const { setCurrentBeat, currentBeat, isPlaying, togglePlayPause } = player;
  
  const producer = {
    ...MOCK_PRODUCER_DATA,
    name: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
  };

  const handlePlayBeat = (beat: any) => {
    const beatData = {
      id: beat.id,
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm.toString(),
      audio_url: beat.audio || beat.audio_url,
      cover_url: '',
    } as any;

    if (currentBeat?.id === beat.id) {
      togglePlayPause();
    } else {
      setCurrentBeat(beatData);
    }
  };

  const handleAddToCart = (beat: any) => {
    toast.success(`${beat.title} added to cart!`, {
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative h-[400px] w-full">
          {/* Cover Image/Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 to-dark-800">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
             <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-end gap-8">
                {/* Avatar */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-950 bg-dark-800 relative shadow-2xl shrink-0 -mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-purple-600 animate-gradient-xy flex items-center justify-center">
                    <Music className="w-16 h-16 text-white/50" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 mb-2 md:mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl md:text-5xl font-bold text-white">{producer.name}</h1>
                        <Badge variant="primary" className="bg-primary text-black border-none">Verified</Badge>
                      </div>
                      <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
                        <MapPin className="w-4 h-4 text-primary" />
                        {producer.location}
                        <span className="mx-1 text-dark-700">|</span>
                        <span className="text-white font-medium">{producer.role}</span>
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
                  <span className="text-white font-bold text-lg">{producer.stats.plays}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Solds</span>
                  <span className="text-white font-bold text-lg">{producer.stats.sales}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Followers</span>
                  <span className="text-white font-bold text-lg">{producer.stats.followers}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider">Tracks</span>
                  <span className="text-white font-bold text-lg">{producer.stats.beats}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-400">
                <a href={producer.socials.website} className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                <a href={producer.socials.instagram} className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href={producer.socials.twitter} className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href={`mailto:${producer.socials.email}`} className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content (Beats) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Featured Beat */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-primary fill-current" />
                  <h2 className="text-xl font-bold text-white">Featured Track</h2>
                </div>
                
                <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="flex gap-6 items-center">
                    <div className="w-32 h-32 rounded-xl bg-dark-800 relative shrink-0 overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-black flex items-center justify-center">
                        <Music className="w-12 h-12 text-gray-600" />
                      </div>
                      {/* Play Button Overlay */}
                      <button 
                        onClick={() => handlePlayBeat(producer.featuredBeat)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] z-10"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          {currentBeat?.id === producer.featuredBeat.id && isPlaying ? (
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
                          <h3 className="text-2xl font-bold text-white truncate">{producer.featuredBeat.title}</h3>
                          <p className="text-primary font-medium">{producer.featuredBeat.genre} • {producer.featuredBeat.bpm} BPM</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-white">${producer.featuredBeat.price}</span>
                        </div>
                      </div>
                      
                      {/* Fake Waveform */}
                      <div className="h-12 w-full flex items-end gap-1 opacity-60 mb-4">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div 
                            key={i} 
                            style={{ height: mounted ? `${Math.random() * 100}%` : '50%' }} 
                            className={`flex-1 rounded-full ${i % 3 === 0 ? 'bg-primary' : 'bg-white/20'}`} 
                          />
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-primary text-black hover:bg-primary-dark font-bold"
                          onClick={() => handleAddToCart(producer.featuredBeat)}
                        >
                          Add to Cart ${producer.featuredBeat.price}
                        </Button>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5">
                          Download Demo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* All Beats List */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Latest Releases</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-white bg-white/5">Newest</Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">Popular</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {producer.beats.map((beat, i) => (
                    <div key={beat.id} className="group flex items-center gap-4 p-3 rounded-xl bg-dark-900/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                      <span className="text-gray-500 w-6 text-center font-mono text-sm">{i + 1}</span>
                      
                      <div className="w-12 h-12 rounded-lg bg-dark-800 shrink-0 relative overflow-hidden">
                         <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                           <Music className="w-5 h-5 text-gray-600" />
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
                        <span className="text-white font-bold">${beat.price}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-white/10 hover:border-primary hover:text-primary rounded-full px-4"
                          onClick={() => handleAddToCart(beat)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button variant="outline" className="w-full py-6 border-dashed border-dark-700 text-gray-400 hover:text-white hover:border-white/20">
                    View All Tracks
                  </Button>
                </div>
              </section>
            </div>

            {/* Sidebar (About) */}
            <div className="space-y-8">
              <div className="bg-dark-900 border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">About</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {producer.bio}
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

                <Button fullWidth className="bg-white/5 text-white hover:bg-white/10">
                  Read Full Bio
                </Button>
              </div>

              {/* Credits / Clients */}
              <div>
                <h3 className="font-bold text-white mb-4 px-2">Work Credits</h3>
                <div className="glass rounded-2xl p-1 border border-white/5">
                  <div className="grid grid-cols-3 gap-1">
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} className="aspect-square bg-dark-800 rounded-lg flex items-center justify-center hover:bg-dark-700 transition-colors cursor-pointer">
                        <span className="text-xs text-gray-600 font-bold">ALBUM {i}</span>
                      </div>
                    ))}
                  </div>
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
