'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BeatCard } from '@/components/BeatCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Music, Grid } from 'lucide-react';
import type { Beat } from '@/types/supabase';

// Demo favorites
const demoFavorites: Beat[] = [
  {
    id: '1',
    producer_id: 'p1',
    title: 'Midnight Dreams',
    description: 'Smooth trap beat',
    genre: 'Trap',
    mood_tags: ['Melodic', 'Dark'],
    bpm: 140,
    key: 'F# Minor',
    duration: 180,
    audio_url: '/demo/beat1.wav',
    preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artwork_url: null,
    waveform_data: null,
    status: 'published',
    play_count: 1250,
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    producer: { id: 'p1', email: '', role: 'producer', display_name: 'Metro Vibes', bio: null, avatar_url: null, stripe_connect_account_id: null, stripe_onboarding_complete: false, created_at: '', updated_at: '' },
    licenses: [{ id: 'l1', beat_id: '1', type: 'basic', price: 2999, terms: null, files_included: ['mp3'], is_active: true, created_at: '', updated_at: '' }],
  },
];

export default function ArtistFavoritesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
            <p className="text-gray-400">Beats you&apos;ve saved for later</p>
          </div>

          {demoFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {demoFavorites.map((beat) => (
                <BeatCard key={beat.id} beat={beat} isFavorited />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
              <p className="text-gray-400">Browse the marketplace and save beats you like</p>
            </Card>
          )}
        </div>
      </main>

      <AudioPlayer />
      <Footer />
    </div>
  );
}
