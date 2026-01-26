'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Download, 
  ShieldCheck, 
  Globe2, 
  Music,
  Zap,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SyncPlayground() {
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate fetching sync-ready tracks
    const timer = setTimeout(() => {
      setTracks([
        {
          id: '1',
          title: 'Neon Odyssey',
          producer: 'The Beat Vault Pro',
          genre: 'Electronic',
          bpm: 124,
          key: 'C Minor',
          isrc: 'US-TF1-26-99001',
          isSyncReady: true,
          moods: ['Futuristic', 'Energetic']
        },
        {
          id: '2',
          title: 'Ethereal Voyage',
          producer: 'Sound Designer',
          genre: 'Ambient',
          bpm: 90,
          key: 'A Major',
          isrc: 'US-TF1-26-99002',
          isSyncReady: true,
          moods: ['Calm', 'Cinematic']
        }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLicenseClick = (trackName: string) => {
    toast.success(`Broadcasting license request for ${trackName}...`, {
      icon: '📡',
      style: {
        background: '#0A0A0A',
        color: '#10B981',
        border: '1px solid #10B981',
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Premium Header */}
      <div className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Sync Partner Portal</Badge>
            <Badge variant="outline" className="border-white/10 text-gray-500">v1.2.0 API</Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Sync Playground</h1>
          <p className="text-gray-400 mt-2 text-lg">Programmatic Rights-Locked Music Catalog for Content Producers.</p>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="flex flex-col items-end px-4 border-r border-white/10">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">API Status</span>
            <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
          <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
            <Globe2 className="w-4 h-4" />
            Integration Docs
          </Button>
        </div>
      </div>

      {/* Discovery Board */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-dark-900/40 border-white/5 backdrop-blur-xl sticky top-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500" />
              Rights Filter
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Clearance Level</label>
                <div className="space-y-2">
                   {['Instant Sync', 'One-Stop', 'Global Only'].map(level => (
                     <label key={level} className="flex items-center gap-3 group cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500" />
                       <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{level}</span>
                     </label>
                   ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">BPM Range</label>
                <div className="flex items-center gap-3">
                  <Input placeholder="70" className="bg-black/40 text-center" />
                  <span className="text-gray-600">-</span>
                  <Input placeholder="140" className="bg-black/40 text-center" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button fullWidth className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                   Update Search
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Catalog List */}
        <div className="lg:col-span-3 space-y-4">
           {/* Search Bar */}
           <div className="relative mb-6">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
             <input 
               type="text" 
               placeholder="Search by keywords, mood, or instrument..."
               className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="animate-pulse">Loading verified sync catalog...</p>
             </div>
           ) : (
             tracks.map(track => (
               <Card key={track.id} className="p-4 bg-dark-900/60 border-white/5 hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-1">
                    <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 border-b border-l border-emerald-500/20">
                      <Zap className="w-2 h-2" /> Programmatic Ready
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Art/Play */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center relative group-hover:scale-105 transition-all outline outline-white/5">
                      <Play className="w-8 h-8 text-emerald-500 fill-emerald-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white tracking-tight">{track.title}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">By {track.producer}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                         <Badge variant="outline" className="text-[10px] text-gray-500 border-white/10">{track.genre}</Badge>
                         <Badge variant="outline" className="text-[10px] text-gray-500 border-white/10">{track.bpm} BPM</Badge>
                         <Badge variant="outline" className="text-[10px] text-gray-500 border-white/10">{track.key}</Badge>
                         {track.moods.map(mood => (
                           <Badge key={mood} className="bg-white/5 text-emerald-400 text-[10px] border-emerald-500/10 hover:bg-emerald-500/10 transition-colors uppercase font-bold">{mood}</Badge>
                         ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <span className="text-[10px] font-mono text-gray-600 mb-2">{track.isrc}</span>
                       <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-10 px-4">
                           <Download className="w-4 h-4" />
                         </Button>
                         <Button 
                           className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-10 px-6 gap-2"
                           onClick={() => handleLicenseClick(track.title)}
                         >
                           License This Track
                         </Button>
                       </div>
                    </div>
                  </div>
               </Card>
             ))
           )}

           {/* API Usage Note */}
           <div className="mt-12 p-8 bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                   <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Build for Programmatic Sync</h4>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                    Every track in this catalog is pre-cleared for automated licensing via our The Beat Vault Sync API. 
                    Integrate our marketplace directly into your creative platform, video editor, or content management system.
                  </p>
                  <Button variant="outline" className="mt-4 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold gap-2">
                    Generate API Key <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
