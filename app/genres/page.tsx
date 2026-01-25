'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Music, ArrowRight, Play, TrendingUp, Zap, Sparkles } from 'lucide-react';

const genres = [
  { 
    name: 'Hip Hop', 
    description: 'From boom bap to modern lyrical masterpieces.',
    count: '2.4K+ Beats', 
    gradient: 'from-purple-600 to-blue-600',
    icon: Music
  },
  { 
    name: 'Trap', 
    description: 'High-energy 808s and rapid-fire hi-hats.',
    count: '1.8K+ Beats', 
    gradient: 'from-red-600 to-orange-500',
    icon: Zap
  },
  { 
    name: 'R&B', 
    description: 'Smooth melodies and soulful chord progressions.',
    count: '1.2K+ Beats', 
    gradient: 'from-pink-600 to-purple-600',
    icon: Sparkles
  },
  { 
    name: 'Pop', 
    description: 'Catchy hooks and radio-ready production.',
    count: '900+ Beats', 
    gradient: 'from-cyan-500 to-blue-500',
    icon: TrendingUp
  },
  { 
    name: 'Lo-Fi', 
    description: 'Relaxing, dusty vibes for chill study sessions.',
    count: '750+ Beats', 
    gradient: 'from-green-600 to-teal-500',
    icon: Play
  },
  { 
    name: 'Drill', 
    description: 'Aggressive sliding basses and gritty atmospheres.',
    count: '600+ Beats', 
    gradient: 'from-gray-700 to-gray-900',
    icon: Music
  },
  { 
    name: 'Afrobeat', 
    description: 'Infectious rhythms and vibrant percussion.',
    count: '450+ Beats', 
    gradient: 'from-yellow-500 to-orange-600',
    icon: Zap
  },
  { 
    name: 'Electronic', 
    description: 'Synthesized soundscapes and driving beats.',
    count: '380+ Beats', 
    gradient: 'from-indigo-600 to-blue-500',
    icon: Sparkles
  }
];

export default function GenresPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Explore <span className="gradient-text">Genres</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover the perfect sound for your next hit. Browse through our curated collection of professional beats across every popular genre.
            </p>
          </div>

          {/* Genres Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {genres.map((genre, index) => (
              <Link
                key={index}
                href={`/marketplace?genre=${genre.name.toLowerCase()}`}
                className="group relative h-64 rounded-3xl overflow-hidden border border-white/5 bg-dark-900 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                
                {/* Mesh/Grain Overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 transform group-hover:rotate-12">
                      <genre.icon className="w-6 h-6 text-white group-hover:text-black" />
                    </div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                      {genre.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                      {genre.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {genre.description}
                    </p>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </Link>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-24 p-1 rounded-[2.5rem] bg-gradient-to-r from-primary/20 via-white/5 to-secondary/20">
            <div className="bg-dark-950 rounded-[2.4rem] p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 relative z-10">
                    Need something more <span className="gradient-text">Targeted?</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-10 relative z-10">
                    Use our advanced marketplace filters to sort by BPM, Key, Mood, and Sync-Status.
                </p>
                <Link href="/marketplace">
                    <Button className="h-14 px-12 text-lg font-black rounded-2xl bg-primary text-black hover:scale-105 transition-transform">
                        Go to Marketplace
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
