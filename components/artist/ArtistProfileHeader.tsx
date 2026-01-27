'use client';

import { motion } from 'framer-motion';
import { Verified, Instagram, Twitter, Globe, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ArtistHeaderProps {
  artist: {
    name: string;
    image: string;
    coverImage: string;
    bio: string;
    location: string;
    socials: {
      instagram?: string;
      twitter?: string;
      website?: string;
    };
  };
}

export function ArtistProfileHeader({ artist }: ArtistHeaderProps) {
  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="h-[40vh] min-h-[300px] w-full relative overflow-hidden bg-dark-900">
        <img 
          src={artist.coverImage} 
          alt={artist.name} 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-t from-dark-950 to-transparent" />
      </div>

      {/* Profile Info Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          {/* Profile Photo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-dark-950 bg-dark-800 shadow-2xl flex-none"
          >
            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Text Info */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                {artist.name}
              </h1>
              <Verified className="w-8 h-8 text-primary" />
            </div>
            
            <p className="text-gray-400 font-medium mb-6 max-w-2xl text-lg">
              {artist.bio}
            </p>

            <div className="flex flex-wrap gap-6">
              <div className="flex gap-4">
                {artist.socials.instagram && (
                  <a href={artist.socials.instagram} className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {artist.socials.twitter && (
                  <a href={artist.socials.twitter} className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {artist.socials.website && (
                  <a href={artist.socials.website} className="text-gray-400 hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
              <div className="h-5 w-px bg-dark-700 hidden sm:block" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {artist.location}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-4">
            <Button className="font-bold px-8">Follow</Button>
            <Button variant="outline" className="p-2 aspect-square">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
