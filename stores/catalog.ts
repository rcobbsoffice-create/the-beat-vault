import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

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
  audio_url?: string;
  preview_url?: string;
  producer_id?: string;
}

interface CatalogState {
  beats: ProducerBeat[];
  isLoading: boolean;
  error: string | null;
  setBeats: (beats: ProducerBeat[]) => void;
  fetchBeats: () => Promise<void>;
  addBeat: (beat: ProducerBeat) => void;
  updateBeat: (id: string, updates: Partial<ProducerBeat>) => void;
  getBeat: (id: string) => ProducerBeat | undefined;
}

const INITIAL_BEATS: ProducerBeat[] = [];

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
            audio_url: beat.audio_url,
            preview_url: beat.preview_url,
            producer_id: beat.producer_id,
          }));

          set({ beats: mappedBeats, isLoading: false });
        } catch (err: any) {
          console.error('Fetch beats error:', err);
          set({ error: err.message, isLoading: false });
        }
      },
      
      addBeat: (beat) => set((state) => ({
        beats: [beat, ...state.beats]
      })),
      
      updateBeat: (id, updates) => set((state) => ({
        beats: state.beats.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      
      getBeat: (id) => get().beats.find((b) => b.id === id),
    }),
    {
      name: 'producer-catalog-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ beats: state.beats }),
    }
  )
);
