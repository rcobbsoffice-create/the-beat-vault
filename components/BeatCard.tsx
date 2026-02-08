'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, ShoppingCart, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { usePlayer } from '@/stores/player';
import toast from 'react-hot-toast';
import type { Database } from '@/types/supabase';

type Beat = Database['public']['Tables']['beats']['Row'] & {
  producer?: Database['public']['Tables']['profiles']['Row'];
  licenses?: Database['public']['Tables']['licenses']['Row'][];
  favorite_count?: number;
  play_count?: number;
  view_count?: number;
};

import { sanitizeUrl } from '@/lib/utils/url';

interface BeatCardProps {
  beat: Beat & { favorite_count?: number };
  onFavorite?: (id: string) => void;
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(beat.id);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get active licenses sorted by price
  const activeLicenses = beat.licenses?.filter(l => l.is_active).sort((a, b) => a.price - b.price) || [];
  const lowestPrice = activeLicenses[0]?.price ?? 0;

  return (
    <div className="group bg-dark-900 border border-dark-700 hover:border-primary/30 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex p-4 gap-4">
        {/* Compact Artwork with Play Overlay */}
        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-dark-800">
          {beat.artwork_url ? (
            <Image
              src={sanitizeUrl(beat.artwork_url)}
              alt={beat.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-dark-800 text-dark-600 relative">
               <Image
                 src="/images/placeholder-instrumental.png"
                 alt="Placeholder"
                 fill
                 className="object-cover opacity-50 grayscale transition-transform duration-500 group-hover:scale-110"
               />
               <span className="text-2xl relative z-10">🎵</span>
             </div>
          )}
          
          <button
            onClick={handlePlayClick}
            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${isCurrentBeat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
               {isCurrentBeat && isPlaying ? (
                 <Pause className="w-4 h-4 fill-current" />
               ) : (
                 <Play className="w-4 h-4 fill-current ml-0.5" />
               )}
            </div>
          </button>
        </div>

        {/* Info & Metadata */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <Link href={`/beats/${beat.id}`} className="block">
                    <h3 className="font-bold text-white text-lg truncate hover:text-primary transition-colors cursor-pointer" title={beat.title}>
                      {beat.title}
                    </h3>
                 </Link>
                 <p className="text-sm text-gray-400 truncate">{beat.producer?.display_name || 'Unknown'}</p>
               </div>
               
               <button onClick={handleFavoriteClick} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
               </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(beat.duration)}</span>
               <span className="w-1 h-1 rounded-full bg-dark-600" />
               <span>{beat.bpm} BPM</span>
               <span className="w-1 h-1 rounded-full bg-dark-600" />
               <span className="truncate max-w-[80px]">{beat.genre}</span>
            </div>
        </div>
      </div>

      {/* License Actions */}
      <div className="px-4 pb-4 pt-2">
         <div className="grid grid-cols-2 gap-2">
           {activeLicenses.slice(0, 2).map((license) => (
             <button
               key={license.id}
               onClick={(e) => {
                 e.stopPropagation();
                 toast.success(`Added ${license.type} license to cart!`, {
                    style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
                 });
               }}
               className="flex flex-col items-center justify-center py-2 px-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary/50 hover:bg-dark-750 transition-all group/btn"
             >
                <span className="text-[10px] font-bold uppercase text-gray-400 group-hover/btn:text-white transition-colors">{license.type}</span>
                <span className="text-sm font-black text-primary">${(license.price / 100).toFixed(2)}</span>
             </button>
           ))}
           {activeLicenses.length > 2 && (
              <Link 
                href={`/beats/${beat.id}`}
                className="col-span-2 flex items-center justify-center py-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              >
                + {activeLicenses.length - 2} more licenses
              </Link>
           )}
           {activeLicenses.length === 0 && (
              <div className="col-span-2 text-center py-2 text-xs text-gray-500 italic">
                No licenses available
              </div>
           )}
         </div>
      </div>
    </div>
  );
}
