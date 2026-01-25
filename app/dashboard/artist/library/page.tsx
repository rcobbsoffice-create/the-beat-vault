'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  Music, 
  Play, 
  Search, 
  Filter, 
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function ArtistLibraryPage() {
  const purchasedBeats = [
    { title: 'Midnight Dreams', producer: 'Metro Vibes', license: 'Exclusive', type: 'WAV + Stem Pack' },
    { title: 'Future Hendrix', producer: 'Future Sound', license: 'Basic', type: 'MP3' },
    { title: 'Lo-fi Study', producer: 'Chill Beats', license: 'Premium', type: 'WAV' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
          <p className="text-gray-400">Access and download your licensed beat collection</p>
        </div>
        <div className="flex bg-dark-900 border border-white/5 rounded-xl p-1 gap-1">
          <Button size="sm" className="bg-primary text-black font-bold">All Purchases</Button>
          <Button size="sm" variant="ghost" className="text-gray-500">Stems</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {purchasedBeats.map((beat, i) => (
          <Card key={i} className="p-4 bg-dark-900/40 border-white/5 hover:border-white/10 transition-all group">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Box */}
              <div className="w-16 h-16 rounded-xl bg-dark-800 shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                <Music className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1">{beat.title}</h3>
                <p className="text-sm text-gray-400">Produced by <span className="text-white">{beat.producer}</span></p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] uppercase border-white/10">{beat.license} License</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase border-white/10">{beat.type}</Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <button className="flex-1 md:flex-none p-3 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                    <Play className="w-5 h-5 mx-auto" />
                 </button>
                 <Button className="flex-[2] md:flex-none bg-white text-black font-bold gap-2 shadow-lg shadow-white/5">
                    <Download className="w-4 h-4" />
                    Download {beat.type.includes('Stem') ? 'Everything' : 'File'}
                 </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Locked Content Hint */}
      <Card className="p-8 border-dashed border-white/5 text-center bg-transparent">
         <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5">
            <Lock className="w-6 h-6 text-gray-600" />
         </div>
         <h3 className="text-white font-bold">Unreleased Purchases</h3>
         <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
           Any beats marked as "Coming Soon" by the producer will appear here once ready.
         </p>
      </Card>
    </div>
  );
}
