'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArtistProfileHeader } from '@/components/artist/ArtistProfileHeader';
import { ArtistStats } from '@/components/artist/ArtistStats';
import { MusicEmbeds } from '@/components/artist/MusicEmbeds';
import { magazineService, ArtistExtension } from '@/lib/supabase/magazine';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ArtistPage() {
  const params = useParams();
  const id = params.id as string;
  const [artistData, setArtistData] = useState<ArtistExtension | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtist() {
      if (!id) return;
      try {
        // Try fetching by ID (UUID) first
        let data = await magazineService.getArtistExtension(id);
        
        // If not found, try fetching by slug/display_name
        if (!data) {
          const profileBySlug = await magazineService.getArtistBySlug(id);
          if (profileBySlug) {
            data = {
              profile_id: profileBySlug.id,
              bio: profileBySlug.bio || '',
              location: profileBySlug.location || '',
              ...profileBySlug.artist_profiles_ext,
              profiles: {
                display_name: profileBySlug.display_name,
                avatar_url: profileBySlug.avatar_url
              }
            };
          }
        }

        if (data) {
          setArtistData(data);
        }
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl font-black uppercase tracking-widest animate-pulse">Loading Artist...</div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase mb-4">Artist Not Found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const artist = {
    id: artistData.profile_id,
    name: artistData.profiles?.display_name || 'Anonymous Artist',
    image: artistData.press_photo_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2070&auto=format&fit=crop',
    coverImage: artistData.cover_image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
    genre: 'Artist',
    bio: artistData.bio || 'No bio available.',
    location: artistData.location || 'Unknown',
    socials: artistData.social_links || {}
  };

  const stats = artistData.stats || {
    views: '0',
    chartPeak: 0,
    totalTracks: 0,
    listeners: '0'
  };

  // For now, embeds are still hardcoded or could be added to extensions
  const embeds = [
    { platform: "spotify" as const, url: "https://open.spotify.com/track/2vS626uB99mBRY96UclO9z" }
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 pb-24">
        {/* Header with Hero Background */}
        <ArtistProfileHeader artist={artist} />Condition

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Breakdown */}
          <ArtistStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
            {/* Left Column: Music & Content */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4 italic">
                  Latest Releases
                </h2>
                <MusicEmbeds embeds={embeds} />
              </section>

              <section className="py-12 border-t border-dark-800">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4 italic">
                  Bio / Press
                </h2>
                <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed font-medium">
                  <p>{artist.bio}</p>
                </div>
              </section>
            </div>

            {/* Right Column: Featured On / Sidebar */}
            <div className="lg:col-span-1">
              <section className="py-12 sticky top-24">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4 italic">
                  Featured On
                </h2>
                <div className="space-y-8">
                  <div className="flex items-center gap-6 group cursor-pointer border-b border-white/5 pb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary whitespace-nowrap">Jan 24</span>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">History entry placeholder</h3>
                    <Play className="w-4 h-4 ml-auto text-dark-600 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
