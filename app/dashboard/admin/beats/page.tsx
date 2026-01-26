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
  Flag,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingBeats = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const res = await fetch('/api/admin/beats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch pending beats');
      }

      const data = await res.json();
      setBeats(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBeats();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} beat...`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const res = await fetch('/api/admin/beats/moderate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ beatId: id, action })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Moderation failed');
      }

      setBeats(prev => prev.filter(b => b.id !== id));
      toast.success(`Beat ${action === 'approve' ? 'approved' : 'rejected'} successfully`, {
        id: toastId,
        icon: action === 'approve' ? '✅' : '❌',
      });
    } catch (err: any) {
      console.error('Moderation error:', err);
      toast.error(err.message, { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-400">Loading pending reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Moderation</h1>
          <p className="text-gray-400">Review and moderate uploaded tracks for quality and legal compliance</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 font-bold">
            {beats.length} Pending Reviews
          </Badge>
        </div>
      </div>

      {/* Moderation List */}
      <div className="grid grid-cols-1 gap-4">
        {beats.length === 0 ? (
          <div className="text-center py-20 bg-dark-800/50 rounded-3xl border border-white/5">
             <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
             <p className="text-gray-400">There are no pending beats to moderate at this time.</p>
          </div>
        ) : (
          beats.map((beat) => (
            <Card key={beat.id} className="p-4 hover:border-white/20 transition-all group">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Preview Box */}
                <div className="w-24 h-24 rounded-xl bg-dark-800 shrink-0 relative overflow-hidden flex items-center justify-center">
                  {beat.artwork_url ? (
                    <img src={`/api/beats/${beat.id}/artwork`} alt={beat.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-8 h-8 text-gray-600" />
                  )}
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
                    {beat.is_sync_ready && (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Sync Ready
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Produced by <span className="text-primary font-medium">{beat.producer?.display_name || 'Unknown'}</span> • {beat.genre} • {beat.bpm} BPM
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Uploaded {format(new Date(beat.created_at), 'MMM d, yyyy')}
                    </p>
                    {beat.metadata?.flag && (
                      <p className="text-xs text-error flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        {beat.metadata.flag}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAction(beat.id, 'reject')}
                    className="flex-1 md:flex-none gap-2 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all border-white/5"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleAction(beat.id, 'approve')}
                    className="flex-1 md:flex-none gap-2 bg-primary text-black hover:opacity-90 transition-opacity"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      {beats.length > 0 && (
        <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-gray-500 italic">End of moderation queue</p>
        </div>
      )}
    </div>
  );
}
