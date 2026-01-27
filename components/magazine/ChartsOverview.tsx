'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartEntry {
  rank: number;
  lastRank: number;
  title: string;
  artist: string;
  image: string;
}

interface ChartsOverviewProps {
  entries: ChartEntry[];
}

export function ChartsOverview({ entries }: ChartsOverviewProps) {
  const getRankChange = (current: number, last: number) => {
    if (current < last) return <TrendingUp className="w-3 h-3 text-success" />;
    if (current > last) return <TrendingDown className="w-3 h-3 text-error" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  return (
    <section className="py-24 bg-dark-900 border-y border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Top 100 Charts</h2>
            <p className="text-gray-400 mt-2 font-medium uppercase tracking-[0.2em] text-xs">Based on site engagement and streams</p>
          </div>
          <Link href="/charts" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline underline-offset-4">
            Full Charts →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
          {entries.map((entry, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group flex items-center gap-6 py-4 border-b border-dark-800 hover:bg-white/5 transition-colors px-4 -mx-4 rounded-sm"
            >
              <div className="flex flex-col items-center min-w-[32px]">
                <span className="text-2xl font-black text-white italic">{entry.rank}</span>
                {getRankChange(entry.rank, entry.lastRank)}
              </div>
              
              <div className="relative w-14 h-14 bg-dark-700 rounded-sm overflow-hidden flex-none">
                <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                  {entry.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider truncate">
                  {entry.artist}
                </p>
              </div>

              <div className="hidden sm:block">
                <Link href={`/artist/${entry.artist.toLowerCase().replace(' ', '-')}`}>
                  <button className="text-[10px] font-bold uppercase tracking-widest border border-dark-600 px-3 py-1 hover:border-white hover:text-white transition-all">
                    Profile
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
