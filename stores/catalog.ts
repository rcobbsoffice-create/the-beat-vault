import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';

export interface ProducerBeat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  plays: number;
  sales: number;
  earnings: string;
  status: 'published' | 'unpublished' | 'draft';
  description?: string;
  key?: string;
  moods?: string[];
  price_basic?: number;
  price_premium?: number;
  is_sync_ready?: boolean;
  label?: string;
  publisher?: string;
  isrc?: string;
  upc?: string;
  artwork_url?: string;
}

interface CatalogState {
  beats: ProducerBeat[];
  isLoading: boolean;
  error: string | null;
  setBeats: (beats: ProducerBeat[]) => void;
  fetchBeats: () => Promise<void>;
  updateBeat: (id: string, updates: Partial<ProducerBeat>) => void;
  getBeat: (id: string) => ProducerBeat | undefined;
}

const INITIAL_BEATS: ProducerBeat[] = [
  { 
    id: '1', 
    title: 'Future Hendrix', 
    genre: 'Trap', 
    bpm: 130, 
    plays: 12500, 
    sales: 42, 
    earnings: '$1,250', 
    status: 'published',
    description: 'High energy trap beat inspired by Future.',
    key: 'C Minor',
    moods: ['Energetic', 'Dark']
  },
  { 
    id: '2', 
    title: 'Midnight Dreams', 
    genre: 'Melodic', 
    bpm: 140, 
    plays: 8200, 
    sales: 28, 
    earnings: '$840', 
    status: 'published',
    description: 'Smooth melodic vibes for late night sessions.',
    key: 'F# Minor',
    moods: ['Chill', 'Melodic']
  },
];

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      beats: INITIAL_BEATS,
      isLoading: false,
      error: null,
      
      setBeats: (beats) => set({ beats }),
      
      fetchBeats: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data, error } = await supabase
            .from('beats')
            .select(`
              *,
              licenses(*)
            `)
            .eq('producer_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const mappedBeats: ProducerBeat[] = (data || []).map((beat: any) => ({
            id: beat.id,
            title: beat.title,
            genre: beat.genre || 'Unknown',
            bpm: beat.bpm || 0,
            plays: beat.play_count || 0,
            sales: 0, 
            earnings: '$0', 
            status: beat.status as any,
            description: beat.description,
            key: beat.key,
            moods: beat.mood_tags,
            artwork_url: beat.artwork_url,
          }));

          set({ beats: mappedBeats.length > 0 ? mappedBeats : INITIAL_BEATS, isLoading: false });
        } catch (err: any) {
          console.error('Fetch beats error:', err);
          set({ error: err.message, isLoading: false });
        }
      },
      
      updateBeat: (id, updates) => set((state) => ({
        beats: state.beats.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      
      getBeat: (id) => get().beats.find((b) => b.id === id),
    }),
    {
      name: 'producer-catalog-storage',
      partialize: (state) => ({ beats: state.beats }),
    }
  )
);
