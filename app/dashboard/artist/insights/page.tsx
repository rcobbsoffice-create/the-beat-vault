'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Target, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Music2,
  Headphones,
  Search
} from 'lucide-react';

export default function ArtistInsightsPage() {
  const recommendations = [
    { title: 'Cyberpunk Nights', genre: 'Synthwave', match: 98, reason: 'Similar to your recent purchases' },
    { title: 'Golden Hour', genre: 'Lo-Fi', match: 92, reason: 'Trending in your region' },
    { title: 'Drill Sergeant', genre: 'Drill', match: 88, reason: 'Matches your BPM preferences' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-8 rounded-3xl relative overflow-hidden">
        <Sparkles className="absolute top-[-20px] right-[-20px] w-32 h-32 text-primary/5 -rotate-12" />
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Artist Insights</h1>
          <p className="text-gray-400 text-sm">AI-driven suggestions and market trends tailored to your sound.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended for You */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-lg font-bold text-white flex items-center gap-2 px-2">
             <Zap className="w-5 h-5 text-primary" /> Top AI Matches
           </h2>
           <div className="grid gap-4">
              {recommendations.map((rec, i) => (
                <Card key={i} className="p-5 bg-dark-900/50 border-white/5 hover:border-primary/30 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-primary border border-white/5">
                         <Music2 className="w-6 h-6" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{rec.title}</span>
                            <Badge variant="primary" className="text-[10px] h-4">
                               {rec.match}% Match
                            </Badge>
                         </div>
                         <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Listen Now <ArrowRight className="w-4 h-4" />
                   </Button>
                </Card>
              ))}
           </div>

           {/* Trend Discovery */}
           <div className="pt-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 px-2 mb-4">
                <Search className="w-5 h-5 text-emerald-500" /> Market Shift Prediction
              </h2>
              <Card className="p-8 bg-black/40 border-white/5">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'Tempo Trend', value: '140 BPM', status: 'Rising', color: 'primary' },
                      { label: 'Key Vibe', value: 'F Minor', status: 'Stable', color: 'secondary' },
                      { label: 'Style Shift', value: 'Melodic Trap', status: 'Peaking', color: 'success' },
                    ].map((trend, i) => (
                      <div key={i} className="text-center">
                         <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{trend.label}</span>
                         <p className="text-xl font-black text-white mt-1">{trend.value}</p>
                         <Badge className={`mt-2 bg-${trend.color}/10 text-${trend.color} border-${trend.color}/20`}>
                           {trend.status}
                         </Badge>
                      </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>

        {/* Listening Habits */}
        <div className="space-y-6">
           <Card className="p-6 bg-dark-950 border-white/5 ring-1 ring-white/5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Headphones className="w-4 h-4 text-secondary" /> Sound Profile
              </h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                       <span className="text-gray-400">Aggressive</span>
                       <span className="text-white">74%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-secondary w-[74%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                       <span className="text-gray-400">Melodic</span>
                       <span className="text-white">42%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[42%]" />
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/10 border-white/10">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-white mb-2">Growth Opportunity</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tracks with <strong className="text-white">"Cinematic Brass"</strong> are seeing 3x higher license conversion this week. Update your search filters to find these gems first.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
}
