'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BeatCard } from '@/components/BeatCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, SlidersHorizontal, Grid, List, ChevronDown, X } from 'lucide-react';
import type { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type BeatSortOption = 'newest' | 'popular' | 'price_asc' | 'price_desc';

interface BeatFilters {
  genre?: string;
  search?: string;
  bpmMin?: number;
  bpmMax?: number;
  key?: string;
  isSyncReady?: boolean;
}

type Beat = Database['public']['Tables']['beats']['Row'] & {
  producer?: Database['public']['Tables']['profiles']['Row'];
  licenses?: Database['public']['Tables']['licenses']['Row'][];
  favorite_count?: number;
  play_count?: number;
  view_count?: number;
  is_sync_ready?: boolean;
  isrc?: string | null;
  upc?: string | null;
  label?: string | null;
  publisher?: string | null;
};

const genres = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeat', 'Dance'];
const moods = ['Dark', 'Energetic', 'Chill', 'Aggressive', 'Melodic', 'Emotional', 'Happy'];
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Demo beats for initial display
const demoBeats: Beat[] = [
  {
    id: '1',
    producer_id: 'p1',
    title: 'Midnight Dreams',
    description: 'Smooth trap beat with melodic vibes',
    genre: 'Trap',
    mood_tags: ['Melodic', 'Dark'],
    bpm: 140,
    key: 'F# Minor',
    duration: 180,
    audio_url: '/demo/beat1.wav',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artwork_url: null,
    stems_url: null,
    waveform_data: null,
    status: 'published',
    play_count: 1250,
    is_sync_ready: true,
    isrc: 'US-TF1-26-00001',
    upc: '190000000001',
    label: 'AudioGenes Independent',
    publisher: 'AudioGenes Publishing',
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    producer: { id: 'p1', email: '', role: 'producer', display_name: 'Metro Vibes', bio: null, avatar_url: null, status: 'active', stripe_connect_account_id: null, stripe_onboarding_complete: false, created_at: '', updated_at: '' },
    licenses: [
      { id: 'l1', beat_id: '1', type: 'basic', price: 2999, terms: null, files_included: ['mp3'], is_active: true, created_at: '', updated_at: '' },
      { id: 'l2', beat_id: '1', type: 'premium', price: 4999, terms: null, files_included: ['mp3', 'wav'], is_active: true, created_at: '', updated_at: '' },
    ],
  },
  {
    id: '2',
    producer_id: 'p2',
    title: 'Street Anthem',
    description: 'Hard-hitting drill beat',
    genre: 'Drill',
    mood_tags: ['Aggressive', 'Dark'],
    bpm: 145,
    key: 'G Minor',
    duration: 195,
    audio_url: '/demo/beat2.wav',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artwork_url: null,
    stems_url: null,
    waveform_data: null,
    status: 'published',
    play_count: 890,
    is_sync_ready: false,
    isrc: null,
    upc: null,
    label: null,
    publisher: null,
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    producer: { id: 'p2', email: '', role: 'producer', display_name: 'Dark Sound', bio: null, avatar_url: null, status: 'active', stripe_connect_account_id: null, stripe_onboarding_complete: false, created_at: '', updated_at: '' },
    licenses: [
      { id: 'l3', beat_id: '2', type: 'basic', price: 3499, terms: null, files_included: ['mp3'], is_active: true, created_at: '', updated_at: '' },
    ],
  },
  {
    id: '3',
    producer_id: 'p3',
    title: 'Summer Nights',
    description: 'Chill R&B vibes perfect for hooks',
    genre: 'R&B',
    mood_tags: ['Chill', 'Melodic'],
    bpm: 85,
    key: 'A Minor',
    duration: 210,
    audio_url: '/demo/beat3.wav',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artwork_url: null,
    stems_url: null,
    waveform_data: null,
    status: 'published',
    play_count: 2100,
    is_sync_ready: true,
    isrc: 'US-TF1-26-00003',
    upc: '190000000003',
    label: 'Smooth Records',
    publisher: 'Urban Flow Music',
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    producer: { id: 'p3', email: '', role: 'producer', display_name: 'Smooth Keys', bio: null, avatar_url: null, status: 'active', stripe_connect_account_id: null, stripe_onboarding_complete: false, created_at: '', updated_at: '' },
    licenses: [
      { id: 'l4', beat_id: '3', type: 'basic', price: 2499, terms: null, files_included: ['mp3'], is_active: true, created_at: '', updated_at: '' },
      { id: 'l5', beat_id: '3', type: 'exclusive', price: 19999, terms: null, files_included: ['mp3', 'wav', 'stems'], is_active: true, created_at: '', updated_at: '' },
    ],
  },
  {
    id: '4',
    producer_id: 'p1',
    title: 'Neon Glow',
    description: 'Futuristic synth-heavy trap',
    genre: 'Trap',
    mood_tags: ['Energetic', 'Dark'],
    bpm: 150,
    key: 'D Minor',
    duration: 175,
    audio_url: '/demo/beat4.wav',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artwork_url: null,
    stems_url: null,
    waveform_data: null,
    status: 'published',
    play_count: 560,
    is_sync_ready: true,
    isrc: 'US-TF1-26-00004',
    upc: '190000000004',
    label: 'AudioGenes Independent',
    publisher: 'AudioGenes Publishing',
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    producer: { id: 'p1', email: '', role: 'producer', display_name: 'Metro Vibes', bio: null, avatar_url: null, status: 'active', stripe_connect_account_id: null, stripe_onboarding_complete: false, created_at: '', updated_at: '' },
    licenses: [
      { id: 'l6', beat_id: '4', type: 'basic', price: 2999, terms: null, files_included: ['mp3'], is_active: true, created_at: '', updated_at: '' },
    ],
  },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<BeatSortOption>('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<BeatFilters>({
    genre: searchParams.get('genre') || undefined,
    search: '',
    bpmMin: undefined,
    bpmMax: undefined,
    key: undefined,
    isSyncReady: false,
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    async function fetchBeats() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('beats')
          .select(`
            *,
            producer:profiles(*),
            licenses(*)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBeats((data as any) || []);
      } catch (error) {
        console.error('Error fetching beats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBeats();
  }, []);

  // Fetch Favorites
  useEffect(() => {
    async function fetchFavorites() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('beat_id')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
      } else {
        setFavorites(new Set(data.map(f => f.beat_id)));
      }
    }
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (beatId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to favorite beats', {
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
      });
      return;
    }

    // Optimistic UI update
    const isAdding = !favorites.has(beatId);
    setFavorites(prev => {
      const next = new Set(prev);
      if (isAdding) next.add(beatId);
      else next.delete(beatId);
      return next;
    });

    // Update beat count optimistically in the local state
    setBeats(prev => prev.map(b => {
      if (b.id === beatId) {
        return {
          ...b,
          favorite_count: Math.max(0, (b.favorite_count || 0) + (isAdding ? 1 : -1))
        } as any;
      }
      return b;
    }));

    try {
      const response = await fetch(`/api/beats/${beatId}/favorite`, { method: 'POST' });
      const data = await response.json();
      
      if (data.error) {
        toast.error('Failed to update favorite');
        // Rollback
        setFavorites(prev => {
          const next = new Set(prev);
          if (isAdding) next.delete(beatId);
          else next.add(beatId);
          return next;
        });
        setBeats(prev => prev.map(b => {
          if (b.id === beatId) {
            return {
              ...b,
              favorite_count: Math.max(0, (b.favorite_count || 0) + (isAdding ? -1 : 1))
            } as any;
          }
          return b;
        }));
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  useEffect(() => {
    const newActiveFilters: string[] = [];
    if (filters.genre) newActiveFilters.push(`Genre: ${filters.genre}`);
    if (filters.bpmMin || filters.bpmMax) {
      newActiveFilters.push(`BPM: ${filters.bpmMin || 0}-${filters.bpmMax || 200}`);
    }
    if (filters.key) newActiveFilters.push(`Key: ${filters.key}`);
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const clearFilter = (filter: string) => {
    if (filter.startsWith('Genre:')) {
      setFilters(f => ({ ...f, genre: undefined }));
    } else if (filter.startsWith('BPM:')) {
      setFilters(f => ({ ...f, bpmMin: undefined, bpmMax: undefined }));
    } else if (filter.startsWith('Key:')) {
      setFilters(f => ({ ...f, key: undefined }));
    }
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const filteredBeats = beats.filter(beat => {
    if (filters.genre && beat.genre?.toLowerCase() !== filters.genre.toLowerCase()) return false;
    if (filters.search && !beat.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.bpmMin && beat.bpm && beat.bpm < filters.bpmMin) return false;
    if (filters.bpmMax && beat.bpm && beat.bpm > filters.bpmMax) return false;
    if (filters.key && !beat.key?.startsWith(filters.key)) return false;
    if (filters.isSyncReady && !beat.is_sync_ready) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
            <p className="text-gray-400">
              Discover {beats.length.toLocaleString()}+ beats from professional producers
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search beats by name, producer, or keyword..."
                value={filters.search || ''}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-xs flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </Button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as BeatSortOption)}
                className="appearance-none px-4 py-3 pr-10 bg-dark-800 border border-dark-600 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-dark-800 border border-dark-600 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-dark-700 text-white' : 'text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-dark-700 text-white' : 'text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setFilters(f => ({ 
                          ...f, 
                          genre: f.genre === genre ? undefined : genre 
                        }))}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                          filters.genre === genre
                            ? 'bg-primary text-white'
                            : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BPM Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">BPM Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.bpmMin || ''}
                      onChange={(e) => setFilters(f => ({ ...f, bpmMin: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-20 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.bpmMax || ''}
                      onChange={(e) => setFilters(f => ({ ...f, bpmMax: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-20 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Key</label>
                  <select 
                    value={filters.key || ''}
                    onChange={(e) => setFilters(f => ({ ...f, key: e.target.value || undefined }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm"
                  >
                    <option value="">Any Key</option>
                    {keys.map((key) => (
                      <option key={key} value={key}>{key} Major / Minor</option>
                    ))}
                  </select>
                </div>

                {/* Sync Ready */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Rights Status</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.isSyncReady}
                      onChange={(e) => setFilters(f => ({ ...f, isSyncReady: e.target.checked }))}
                      className="w-5 h-5 accent-primary rounded border-dark-600 bg-dark-800"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Sync Ready Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-gray-400">Active filters:</span>
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => clearFilter(filter)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                >
                  {filter}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-gray-400 mb-6">
            Showing {filteredBeats.length} beats
          </p>

          {/* Beats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-dark-900 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-dark-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-dark-800 rounded w-3/4" />
                    <div className="h-3 bg-dark-800 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-dark-800 rounded w-16" />
                      <div className="h-6 bg-dark-800 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBeats.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No beats found matching your filters</p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredBeats.map((beat) => (
                <BeatCard 
                  key={beat.id} 
                  beat={beat as any} 
                  isFavorited={favorites.has(beat.id)}
                  onFavorite={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AudioPlayer />
      <Footer />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950" />}>
      <MarketplaceContent />
    </Suspense>
  );
}
