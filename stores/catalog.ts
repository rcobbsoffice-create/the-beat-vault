import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProducerBeat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  plays: string;
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
  cover_url?: string;
}

interface CatalogState {
  beats: ProducerBeat[];
  setBeats: (beats: ProducerBeat[]) => void;
  updateBeat: (id: string, updates: Partial<ProducerBeat>) => void;
  getBeat: (id: string) => ProducerBeat | undefined;
}

const INITIAL_BEATS: ProducerBeat[] = [
  { 
    id: '1', 
    title: 'Future Hendrix', 
    genre: 'Trap', 
    bpm: 130, 
    plays: '12.5K', 
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
    plays: '8.2K', 
    sales: 28, 
    earnings: '$840', 
    status: 'published',
    description: 'Smooth melodic vibes for late night sessions.',
    key: 'F# Minor',
    moods: ['Chill', 'Melodic']
  },
  { 
    id: '3', 
    title: 'Savage Mode', 
    genre: 'Dark', 
    bpm: 85, 
    plays: '4.1K', 
    sales: 12, 
    earnings: '$360', 
    status: 'draft',
    description: 'Gritty dark beat.',
    key: 'A Minor',
    moods: ['Aggressive', 'Dark']
  },
];

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      beats: INITIAL_BEATS,
      
      setBeats: (beats) => set({ beats }),
      
      updateBeat: (id, updates) => set((state) => ({
        beats: state.beats.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      
      getBeat: (id) => get().beats.find((b) => b.id === id),
    }),
    {
      name: 'producer-catalog-storage',
    }
  )
);
