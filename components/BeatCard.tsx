'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, ShoppingCart, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { usePlayer } from '@/stores/player';
import type { Beat } from '@/types/supabase';

interface BeatCardProps {
  beat: Beat;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function BeatCard({ beat, onFavorite, isFavorited = false }: BeatCardProps) {
  const { currentBeat, isPlaying, setCurrentBeat, pause } = usePlayer();
  const isCurrentBeat = currentBeat?.id === beat.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrentBeat && isPlaying) {
      pause();
    } else {
      setCurrentBeat(beat);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const lowestPrice = beat.licenses?.reduce((min, license) => 
    license.is_active && license.price < min ? license.price : min, 
    Infinity
  ) ?? 0;

  return (
    <Link href={`/beats/${beat.id}`}>
      <div className="group relative bg-dark-900 border border-dark-700 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">
        {/* Artwork */}
        <div className="relative aspect-square overflow-hidden">
          {beat.artwork_url ? (
            <Image
              src={beat.artwork_url}
              alt={beat.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <div className="text-4xl">🎵</div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent" />

          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 transition-transform hover:scale-110">
              {isCurrentBeat && isPlaying ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              )}
            </div>
          </button>

          {/* Duration Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-dark-950/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300">
            <Clock className="w-3 h-3" />
            {formatDuration(beat.duration)}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite?.();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-950/70 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110"
          >
            <Heart 
              className={`w-4 h-4 ${isFavorited ? 'text-secondary fill-secondary' : 'text-white'}`} 
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
            {beat.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1 truncate">
            {beat.producer?.display_name || 'Unknown Producer'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {beat.genre && <Badge variant="primary">{beat.genre}</Badge>}
            {beat.bpm && <Badge>{beat.bpm} BPM</Badge>}
            {beat.key && <Badge>{beat.key}</Badge>}
          </div>

          {/* Price & Cart */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
            <div>
              <span className="text-xs text-gray-400">From</span>
              <p className="text-lg font-bold text-white">
                ${(lowestPrice / 100).toFixed(2)}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
              }}
              className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/30"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
