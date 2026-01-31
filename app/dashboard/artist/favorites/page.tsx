'use client';

import { useState, useEffect } from 'react';
import { BeatCard } from '@/components/BeatCard';
import { Card } from '@/components/ui/Card';
import { Music, Loader2 } from 'lucide-react';
import type { Beat } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ArtistFavoritesPage() {
  const [favorites, setFavorites] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          beat_id,
          beat:beats (
            *,
            producer:profiles(*),
            licenses(*)
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const beats = data
        .map(f => f.beat)
        .filter(b => b !== null) as unknown as Beat[];
      
      setFavorites(beats);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (beatId: string) => {
    try {
      // Optimistic remove for the favorites page
      setFavorites(prev => prev.filter(b => b.id !== beatId));

      const response = await fetch(`/api/beats/${beatId}/favorite`, { method: 'POST' });
      const data = await response.json();
      
      if (data.error) {
        toast.error('Failed to update favorite');
        fetchFavorites(); // Rollback fetch
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
        <p className="text-gray-400">Beats you&apos;ve saved for later</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Favorites...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((beat) => (
            <BeatCard 
              key={beat.id} 
              beat={beat as any} 
              isFavorited={true} 
              onFavorite={handleFavoriteToggle}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-dark-900/50 border-white/5 backdrop-blur-sm">
          <Music className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white uppercase italic mb-2">No favorites yet</h2>
          <p className="text-gray-400 font-medium text-sm">Browse the marketplace and save beats you like</p>
        </Card>
      )}
    </div>
  );
}
