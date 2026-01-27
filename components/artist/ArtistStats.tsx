'use client';

import { motion } from 'framer-motion';
import { Eye, TrendingUp, Music2, Users } from 'lucide-react';

interface ArtistStatsProps {
  stats: {
    views: string;
    chartPeak: number;
    totalTracks: number;
    listeners: string;
  };
}

export function ArtistStats({ stats }: ArtistStatsProps) {
  const items = [
    { label: 'Profile Views', value: stats.views, icon: Eye },
    { label: 'Chart Peak', value: `#${stats.chartPeak}`, icon: TrendingUp },
    { label: 'Releases', value: stats.totalTracks.toString(), icon: Music2 },
    { label: 'Monthly Listeners', value: stats.listeners, icon: Users },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-dark-900/50 border border-dark-800 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <item.icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">
            {item.value}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
