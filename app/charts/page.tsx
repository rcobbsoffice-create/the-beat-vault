'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChartsOverview } from '@/components/magazine/ChartsOverview';
import { Button } from '@/components/ui/Button';
import { Calendar, Filter, ChevronDown } from 'lucide-react';
import { magazineService, ChartEntry } from '@/lib/supabase/magazine';

export default function ChartsPage() {
  const [charts, setCharts] = useState<ChartEntry[]>([]);
  const [activeType, setActiveType] = useState<ChartEntry['chart_type']>('top_100');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharts() {
      setLoading(true);
      try {
        const data = await magazineService.getCharts(activeType, 50);
        if (data) {
          setCharts(data);
        }
      } catch (error) {
        console.error('Error fetching charts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCharts();
  }, [activeType]);

  const top6 = charts.slice(0, 6);
  const remaining = charts.slice(6);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24">
        {/* Charts Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-b border-dark-900">
          <h1 className="text-7xl sm:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8 italic">
            THE CHARTS
          </h1>
          <p className="text-sm font-black uppercase tracking-[0.5em] text-primary">
            Weekly Global Statistics • Issue #01
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-dark-950/50 backdrop-blur-md sticky top-16 z-20 border-b border-dark-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
              {[
                { label: 'Global Top 100', value: 'top_100' },
                { label: 'Trending Artists', value: 'trending' },
                { label: 'Genre Charts', value: 'genre' },
                { label: 'Viral Indie', value: 'viral' }
              ].map((item) => (
                <button 
                  key={item.value} 
                  onClick={() => setActiveType(item.value as any)}
                  className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${
                    activeType === item.value ? 'text-white border-b-2 border-primary' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="gap-2 text-[10px] uppercase font-black"><Calendar className="w-4 h-4" /> Jan 2026</Button>
              <Button variant="ghost" size="sm" className="gap-2 text-[10px] uppercase font-black"><Filter className="w-4 h-4" /> Filter</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center font-black uppercase tracking-widest animate-pulse">
            Analyzing rankings...
          </div>
        ) : (
          <>
            <ChartsOverview entries={top6.map(e => ({
              rank: e.rank,
              lastRank: e.last_rank || e.rank,
              title: e.title,
              artist: e.artist_name,
              image: e.image_url || `https://images.unsplash.com/photo-${1470225620800 + e.rank}-dba8ba36b745?q=80&w=200&auto=format&fit=crop`
            }))} />

            {/* Extended List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="grid grid-cols-1 gap-4">
                {remaining.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-8 py-4 px-6 bg-dark-900/30 border border-dark-800 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
                    <span className="text-2xl font-black text-white/50 w-8 italic group-hover:text-primary transition-colors">{entry.rank}</span>
                    <div className="w-12 h-12 bg-dark-800 rounded-sm overflow-hidden flex-none">
                      <img 
                        src={entry.image_url || `https://images.unsplash.com/photo-${1470225620800 + entry.rank}-dba8ba36b745?q=80&w=200&auto=format&fit=crop`} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                        alt={entry.title}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{entry.title}</h3>
                      <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{entry.artist_name}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-12 text-xs font-black uppercase tracking-widest text-gray-600">
                      <span>3.2M Plays</span>
                      <span>{entry.last_rank ? entry.last_rank - entry.rank : 'NEW'}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-700" />
                  </div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <Button variant="outline" className="font-black uppercase tracking-widest px-12 h-14">
                  Full Ranking Archive
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
