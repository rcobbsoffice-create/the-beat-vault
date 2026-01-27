'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface Release {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  type: 'Single' | 'Album' | 'EP';
}

interface NewReleasesCarouselProps {
  releases: Release[];
}

export function NewReleasesCarousel({ releases }: NewReleasesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-dark-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">New Releases</h2>
          <p className="text-gray-400 mt-2 font-medium uppercase tracking-[0.2em] text-xs">Fresh from the studio</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-3 rounded-full border border-dark-700 text-white hover:bg-primary hover:border-primary transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-3 rounded-full border border-dark-700 text-white hover:bg-primary hover:border-primary transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-6 lg:px-[calc((100vw-1280px)/2+32px)]"
      >
        {releases.map((release) => (
          <motion.div 
            key={release.id}
            className="flex-none w-[300px] snap-start group"
            whileHover={{ y: -10 }}
          >
            <div className="relative aspect-square mb-4 overflow-hidden rounded-sm bg-dark-800">
              <Image
                src={release.coverImage}
                alt={release.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-primary p-4 rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <Play className="w-6 h-6 fill-current" />
                </button>
              </div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                {release.type}
              </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors truncation whitespace-nowrap overflow-hidden">
              {release.title}
            </h3>
            <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">{release.artist}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
