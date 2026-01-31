'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Search, 
  Plus, 
  MoreVertical, 
  Play, 
  Eye, 
  DollarSign,
  Edit2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePlayer } from '@/stores/player';
import { useCatalogStore } from '@/stores/catalog';
import toast from 'react-hot-toast';
import type { Database } from '@/types/supabase';

type Beat = Database['public']['Tables']['beats']['Row'] & {
  producer?: Database['public']['Tables']['profiles']['Row'];
  licenses?: Database['public']['Tables']['licenses']['Row'][];
  favorite_count?: number;
  play_count?: number;
  view_count?: number;
  is_sync_ready?: boolean;
};

import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ProducerBeatsPage() {
  const router = useRouter();
  const { setCurrentBeat, togglePlayPause, currentBeat, isPlaying } = usePlayer();
  const { beats, fetchBeats, isLoading, error } = useCatalogStore();

  useEffect(() => {
    fetchBeats();
  }, [fetchBeats]);

  if (isLoading && beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-400">Loading your catalog...</p>
      </div>
    );
  }

  const handlePlayBeat = (beat: any) => {
    if (currentBeat?.id === beat.id) {
      togglePlayPause();
    } else {
      // Use stream endpoint to bypass 403 Forbidden on private buckets
      setCurrentBeat({
        ...beat,
        preview_url: `/api/beats/${beat.id}/stream`,
        artwork_url: `/api/beats/${beat.id}/artwork`
      });
    }
  };

  const handleEdit = (beat: any) => {
    router.push(`/dashboard/producer/beats/${beat.id}/edit`);
  };

  const handleDelete = async (beat: any) => {
    if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) return;

    const toastId = toast.loading('Deleting track...');
    try {
      console.log('Fetching session for delete...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Auth session error: ${sessionError.message}`);
      }
      
      const token = session?.access_token;
      console.log('Token retrieved:', token ? 'Yes (starts with ' + token.substring(0, 10) + '...)' : 'No');

      if (!token) {
        throw new Error('No active session found. Please log in again.');
      }

      console.log('Sending delete request for beat:', beat.id);
      const res = await fetch(`/api/beats/${beat.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete response status:', res.status);
      const data = await res.json();
      console.log('Delete response data:', data);

      if (!res.ok) throw new Error(data.error || 'Failed to delete track');

      toast.success('Track deleted', { id: toastId });
      fetchBeats(); // Refresh catalog
    } catch (err: any) {
      console.error('Delete error details:', err);
      toast.error(`Delete failed: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Catalog</h1>
          <p className="text-gray-400">Manage your tracks, track performance, and edit listings</p>
        </div>
        <Link href="/dashboard/producer/upload">
          <Button className="bg-primary text-black font-bold gap-2">
            <Plus className="w-4 h-4" />
            Upload New Beat
          </Button>
        </Link>
      </div>

      {/* Catalog List */}
      <div className="space-y-4">
        {beats.map((beat) => (
          <Card key={beat.id} className="p-4 hover:border-white/20 transition-all group">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Cover Art Preview */}
              <div className="w-20 h-20 rounded-xl bg-dark-800 shrink-0 relative overflow-hidden flex items-center justify-center">
                {beat.artwork_url ? (
                  <img src={`/api/beats/${beat.id}/artwork`} alt={beat.title} className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-6 h-6 text-gray-600" />
                )}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePlayBeat(beat);
                  }}
                  className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity z-10 ${
                    currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                   {currentBeat?.id === beat.id && isPlaying ? (
                     <div className="flex gap-1 items-end h-4">
                        <div className="w-1 bg-black animate-bounce-short" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 bg-black animate-bounce-short" style={{ animationDelay: '100ms' }} />
                        <div className="w-1 bg-black animate-bounce-short" style={{ animationDelay: '200ms' }} />
                     </div>
                   ) : (
                     <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
                   )}
                </button>
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{beat.title}</h3>
                  <Badge className={
                    beat.status === 'published' ? 'bg-success/10 text-success border-success/20' : 'bg-gray-800 text-gray-400'
                  }>
                    {beat.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  {beat.genre} • {beat.bpm} BPM • 44.1kHz WAV
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 px-6 border-x border-white/5 hidden lg:flex">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Plays</p>
                  <p className="text-white font-bold">{beat.plays}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Sales</p>
                  <p className="text-white font-bold">{beat.sales}</p>
                </div>
                <div className="text-center text-primary">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Earned</p>
                  <p className="font-bold">{beat.earnings}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleEdit(beat)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDelete(beat)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center py-6">
        <Button variant="ghost" className="text-gray-500">
          Load more tracks
        </Button>
      </div>
    </div>
  );
}
