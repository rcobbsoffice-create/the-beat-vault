'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FeaturedArtistHero } from '@/components/magazine/FeaturedArtistHero';
import { TrendingArticles } from '@/components/magazine/TrendingArticles';
import { NewReleasesCarousel } from '@/components/magazine/NewReleasesCarousel';
import { ChartsOverview } from '@/components/magazine/ChartsOverview';
import { magazineService } from '@/lib/supabase/magazine';

// Fallback Mock Data
const MOCK_FEATURED_ARTIST = {
  id: 'metro-boomin',
  name: 'Metro Boomin',
  image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', // Verified working cool dark studio photo
  genre: 'Trap / Hip Hop',
  quote: 'If Young Metro don\'t trust you, I\'m gon\' shoot you.'
};

const MOCK_RELEASES = [
  {
    id: 'r1',
    title: 'Sonic Boom',
    artist: 'Voltz',
    coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop',
    type: 'Single' as const
  },
  {
    id: 'r2',
    title: 'After Hours',
    artist: 'Lumina',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
    type: 'Album' as const
  },
  {
    id: 'r3',
    title: 'Midnight Drive',
    artist: 'Retro Kid',
    coverImage: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2070&auto=format&fit=crop', // Verified working
    type: 'EP' as const
  }
];

export default function HomePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);
  const [charts, setCharts] = useState<any[]>([]);
  const [featuredArtist, setFeaturedArtist] = useState(MOCK_FEATURED_ARTIST);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [fetchedArticles, fetchedPicks, fetchedCharts] = await Promise.all([
          magazineService.getArticles(4),
          magazineService.getArticles(3, false, "Editor's Picks"),
          magazineService.getCharts('top_100', 6)
        ]);
        
        if (!isMounted) return;

        if (fetchedArticles && fetchedArticles.length > 0) {
          setArticles(fetchedArticles.map(a => ({
            ...a,
            author: a.profiles?.display_name || 'Staff',
            image: a.image_url,
            date: new Date(a.published_at).toLocaleDateString()
          })));
        }

        if (fetchedPicks && fetchedPicks.length > 0) {
          setEditorsPicks(fetchedPicks.map(a => ({
            ...a,
            author: a.profiles?.display_name || 'Staff',
            image: a.image_url,
            date: new Date(a.published_at).toLocaleDateString()
          })));
        }

        if (fetchedCharts && fetchedCharts.length > 0) {
          setCharts(fetchedCharts.map(c => ({
            rank: c.rank,
            lastRank: c.last_rank,
            title: c.title,
            artist: c.artist_name,
            image: c.image_url
          })));
        }
      } catch (error: any) {
        if (!isMounted) return;
        console.error('Error fetching magazine data full error:', JSON.stringify(error, null, 2));
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <main className="flex-1">
        {/* Magazine Cover Hero */}
        <FeaturedArtistHero artist={featuredArtist} />

        {/* Trending Stories Board */}
        {loading ? (
          <div className="py-24 bg-white text-black text-center font-bold uppercase tracking-widest animate-pulse">
            Loading Stories...
          </div>
        ) : articles.length > 0 ? (
          <TrendingArticles articles={articles} />
        ) : (
          <div className="py-24 bg-white text-black text-center font-medium uppercase tracking-widest opacity-50">
            No stories featured this week.
          </div>
        )}

        {/* New Releases Carousel */}
        <NewReleasesCarousel releases={MOCK_RELEASES} />

        {/* Charts Section */}
        {charts.length > 0 && <ChartsOverview entries={charts} />}

        {/* Editor's Picks / Featured On Grid */}
        <section className="py-24 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 border-b-2 border-black pb-4">
              Editor's Picks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {editorsPicks.length > 0 ? editorsPicks.map((pick) => (
                <div key={pick.id} className="group cursor-pointer">
                  <div className="relative aspect-square bg-gray-100 mb-6 overflow-hidden">
                    <img 
                      src={pick.image} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      alt={pick.title}
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">{pick.category}</p>
                  <h3 className="text-2xl font-black uppercase mb-4 group-hover:underline decoration-2">{pick.title}</h3>
                  <button className="text-sm font-bold border-b border-black pb-1 hover:text-primary hover:border-primary transition-colors">
                    READ STORY
                  </button>
                </div>
              )) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="group animate-pulse">
                    <div className="relative aspect-square bg-gray-100 mb-6" />
                    <div className="h-4 bg-gray-100 w-1/4 mb-4" />
                    <div className="h-8 bg-gray-100 w-3/4 mb-4" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
