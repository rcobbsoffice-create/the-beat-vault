'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Play,
  Download,
  MoreVertical,
  Flag
} from 'lucide-react';

// Demo beats for moderation
const pendingBeats = [
  { id: '1', title: 'Street Kings', producer: 'Dark Sound', genre: 'Trap', uploaded: '10 min ago', flag: 'Copyright Alert' },
  { id: '2', title: 'Midnight Dreams', producer: 'Metro Vibes', genre: 'Melodic', uploaded: '25 min ago', flag: null },
  { id: '3', title: 'Future Hendrix', producer: 'Future Sound', genre: 'Trap', uploaded: '1 hour ago', flag: 'Inappropriate Title' },
  { id: '4', title: 'Lo-fi Study', producer: 'Chill Beats', genre: 'Lo-fi', uploaded: '2 hours ago', flag: null },
];

export default function AdminBeatsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Moderation</h1>
          <p className="text-gray-400">Review and moderate uploaded tracks for quality and legal compliance</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-warning/20 text-warning border-warning/30 px-3 py-1">
            {pendingBeats.length} Pending Reviews
          </Badge>
        </div>
      </div>

      {/* Moderation List */}
      <div className="grid grid-cols-1 gap-4">
        {pendingBeats.map((beat) => (
          <Card key={beat.id} className="p-4 hover:border-white/20 transition-all group">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Preview Box */}
              <div className="w-24 h-24 rounded-xl bg-dark-800 shrink-0 relative overflow-hidden flex items-center justify-center">
                <Music className="w-8 h-8 text-gray-600" />
                <button className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center">
                     <Play className="w-4 h-4 fill-current ml-0.5" />
                   </div>
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">{beat.title}</h3>
                  {beat.flag && (
                    <Badge variant="warning" className="flex gap-1 items-center bg-error/10 text-error border-error/20">
                      <Flag className="w-3 h-3" />
                      {beat.flag}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  Produced by <span className="text-primary font-medium">{beat.producer}</span> • {beat.genre}
                </p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Uploaded {beat.uploaded}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all">
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button size="sm" className="flex-1 md:flex-none gap-2 bg-success text-white hover:bg-success/80">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
                <Button variant="ghost" size="sm" className="px-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State / Footer */}
      <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
        <p className="text-gray-500 italic">End of moderation queue</p>
      </div>
    </div>
  );
}
