'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Play, ArrowRight, Verified } from 'lucide-react';
import Link from 'next/link';

interface FeaturedArtistHeroProps {
  artist: {
    id: string;
    name: string;
    image: string;
    genre: string;
    quote: string;
  };
}

export function FeaturedArtistHero({ artist }: FeaturedArtistHeroProps) {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${artist.image})` }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/40 to-transparent" />
        {/* Fill empty space with subtle pattern if image fails or is dark */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-white rounded-sm">
              Featured Artist
            </span>
            <span className="text-gray-400 text-sm font-medium">/ {artist.genre}</span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black text-white mb-6 uppercase tracking-tighter leading-[0.9]">
            {artist.name}
            <Verified className="inline-block ml-4 w-10 h-10 text-primary" />
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 italic font-light leading-relaxed border-l-2 border-primary pl-6">
            "{artist.quote}"
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href={`/artist/${artist.id}`}>
              <Button size="lg" className="h-14 px-8 text-lg font-bold group">
                View Profile
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-white/20 hover:bg-white/10 text-white">
              <Play className="mr-2 w-5 h-5 fill-current" />
              Listen Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Magazine Detail - Vertical Text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <p className="rotate-90 text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 whitespace-nowrap">
          ArtistFlow Magazine • Issue #01 • Jan 2026
        </p>
      </div>
    </section>
  );
}
