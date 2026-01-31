import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '@/types/supabase';

type Beat = Database['public']['Tables']['beats']['Row'] & {
  producer?: Database['public']['Tables']['profiles']['Row'];
  licenses?: Database['public']['Tables']['licenses']['Row'][];
  favorite_count?: number;
  play_count?: number;
  view_count?: number;
  is_sync_ready?: boolean;
};


interface PlayerState {
  currentBeat: Beat | null;
  isPlaying: boolean;
  volume: number;
  queue: Beat[];
  currentTime: number;
  duration: number;
  
  // Actions
  setCurrentBeat: (beat: Beat) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setQueue: (beats: Beat[]) => void;
  addToQueue: (beat: Beat) => void;
  removeFromQueue: (beatId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentBeat: null,
      isPlaying: false,
      volume: 0.7,
      queue: [],
      currentTime: 0,
      duration: 0,

      setCurrentBeat: (beat) => set({ currentBeat: beat, isPlaying: true }),

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      togglePlayPause: () => set({ isPlaying: !get().isPlaying }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      setQueue: (beats) => set({ queue: beats }),

      addToQueue: (beat) => set((state) => ({ 
        queue: [...state.queue, beat] 
      })),

      removeFromQueue: (beatId) => set((state) => ({
        queue: state.queue.filter((b) => b.id !== beatId),
      })),

      playNext: () => {
        const { currentBeat, queue } = get();
        if (!currentBeat || queue.length === 0) return;

        const currentIndex = queue.findIndex((b) => b.id === currentBeat.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        set({ currentBeat: queue[nextIndex], isPlaying: true, currentTime: 0 });
      },

      playPrevious: () => {
        const { currentBeat, queue } = get();
        if (!currentBeat || queue.length === 0) return;

        const currentIndex = queue.findIndex((b) => b.id === currentBeat.id);
        const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
        set({ currentBeat: queue[prevIndex], isPlaying: true, currentTime: 0 });
      },

      seek: (time) => set({ currentTime: time }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      reset: () => set({ 
        currentBeat: null, 
        isPlaying: false, 
        currentTime: 0,
        duration: 0 
      }),
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        queue: state.queue,
      }),
    }
  )
);
