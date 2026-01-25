'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Map, 
  Users, 
  BrainCircuit, 
  ArrowUpRight,
  Globe,
  Clock,
  Zap
} from 'lucide-react';
import { EngagementHeatmap } from '@/components/Analytics/EngagementHeatmap';

export default function ProducerAnalyticsPage() {
  const heatmapData = [
    { position: 0, intensity: 0.2 },
    { position: 0.1, intensity: 0.4 },
    { position: 0.2, intensity: 0.3, isDropoff: true },
    { position: 0.3, intensity: 0.6 },
    { position: 0.4, intensity: 0.8, isPeak: true },
    { position: 0.5, intensity: 0.7 },
    { position: 0.6, intensity: 0.5 },
    { position: 0.7, intensity: 0.9, isPeak: true },
    { position: 0.8, intensity: 0.6 },
    { position: 0.9, intensity: 0.3 },
    { position: 1, intensity: 0.1 },
  ];

  const locations = [
    { city: 'Atlanta, USA', share: 24, trend: '+12%' },
    { city: 'London, UK', share: 18, trend: '+5%' },
    { city: 'Paris, FR', share: 12, trend: '-2%' },
    { city: 'Toronto, CA', share: 10, trend: '+15%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">AI Intelligence</h1>
            <p className="text-gray-400 text-sm">Predictive trends and granular listener behavior.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 bg-dark-900 border-white/10">
          <Zap className="w-4 h-4 text-emerald-500" />
          Run AI Forecast
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Engagement Analysis */}
        <div className="lg:col-span-2 space-y-8">
           <EngagementHeatmap 
            title="Track Retention Analysis" 
            data={heatmapData} 
            duration={184} 
           />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-dark-900 border-white/5">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-primary" /> Conversion Funnel
                </h3>
                <div className="space-y-4">
                   {[
                    { label: 'Plays', count: '12,402', rate: '100%' },
                    { label: 'Wishlist', count: '842', rate: '6.8%' },
                    { label: 'Cart', count: '215', rate: '1.7%' },
                    { label: 'Purchase', count: '98', rate: '0.8%' },
                   ].map((item, i) => (
                     <div key={i} className="group">
                        <div className="flex justify-between items-end mb-1.5">
                           <span className="text-xs text-gray-400">{item.label}</span>
                           <span className="text-xs text-white font-bold">{item.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                            className="h-full bg-primary" 
                            style={{ width: item.rate }}
                           />
                        </div>
                     </div>
                   ))}
                </div>
              </Card>

              <Card className="p-6 bg-dark-900 border-white/5">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-secondary" /> Retaining Power
                </h3>
                <div className="flex flex-col items-center justify-center h-40">
                   <span className="text-5xl font-black text-white">4:12</span>
                   <p className="text-xs text-secondary font-bold mt-2 uppercase tracking-tighter">Average Session Duration</p>
                   <div className="mt-4 flex items-center gap-1.5 text-xs text-success">
                      <ArrowUpRight className="w-4 h-4" /> 24% higher than genre avg
                   </div>
                </div>
              </Card>
           </div>
        </div>

        {/* Geographic & Trend Data */}
        <div className="space-y-8">
           <Card className="p-6 bg-dark-950 border-white/5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Globe className="w-4 h-4 text-emerald-500" /> Hot Zones
              </h3>
              <div className="space-y-6">
                 {locations.map((loc, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-sm text-white font-medium">{loc.city}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-white font-bold">{loc.share}%</p>
                         <p className={`text-[10px] ${loc.trend.startsWith('+') ? 'text-success' : 'text-red-500'}`}>
                           {loc.trend}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button fullWidth variant="ghost" className="mt-6 text-xs text-emerald-500 hover:bg-emerald-500/5">
                 View Global Heatmap
              </Button>
           </Card>

           <Card className="p-6 bg-emerald-500/10 border-emerald-500/20 relative overflow-hidden group">
              <Zap className="absolute top-4 right-4 w-12 h-12 text-emerald-500/10 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4">AI Trend Alert</h3>
              <p className="text-xs text-white leading-relaxed mb-4">
                "Afrobeats" and "Lo-Fi" influence is rising in your target demographics. Your track <strong className="text-emerald-400">"Neon Glow"</strong> matches 89% of current search velocity.
              </p>
              <Button size="sm" className="bg-emerald-500 text-black font-bold h-8 text-[10px]">Optimize Listing</Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
