'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  Calendar,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { usePlayer } from '@/stores/player';

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const { currentBeat, isPlaying, setCurrentBeat } = usePlayer();

  const fetchBeats = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('beats')
        .select(`
          *,
          producer:profiles(display_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBeats(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeats();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBeats();
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const toastId = toast.loading(`Updating beat status...`);
    try {
      const { error } = await supabase
        .from('beats')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;

      setBeats(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
      toast.success(`Beat ${action} successfully`, {
        id: toastId,
      });
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message, { id: toastId });
    }
  };

  const handleEdit = (beat: any) => {
    setEditingId(beat.id);
    setEditForm({ ...beat });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const toastId = toast.loading('Saving changes...');
    try {
      const { error } = await supabase
        .from('beats')
        .update({
          title: editForm.title,
          genre: editForm.genre,
          bpm: editForm.bpm,
          price: editForm.price,
          status: editForm.status
        })
        .eq('id', editingId);

      if (error) throw error;

      setBeats(prev => prev.map(b => b.id === editingId ? { ...b, ...editForm } : b));
      setEditingId(null);
      toast.success('Beat updated successfully', { id: toastId });
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message, { id: toastId });
    }
  };

  if (isLoading && beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Content Oversight</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Manage and moderate all platform assets</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search assets..."
              className="pl-10 pr-4 py-2 bg-dark-900 border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all text-white w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-bold focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 gap-6">
        {beats.length === 0 ? (
          <div className="text-center py-32 bg-dark-900/30 border border-dashed border-white/5 rounded-[3rem] backdrop-blur-sm">
             <Music className="w-16 h-16 text-primary/10 mx-auto mb-6" />
             <h3 className="text-xl font-black uppercase italic text-white mb-2">No Assets Found</h3>
             <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Adjust your filters or search query</p>
          </div>
        ) : (
          beats.map((beat) => (
            <Card key={beat.id} className="p-6 hover:border-primary/30 transition-all duration-500 group bg-dark-900/50 backdrop-blur-xl border-white/5 relative overflow-hidden">
               <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                  {/* Artwork & Play */}
                  <div className="w-32 h-32 rounded-2xl bg-dark-800 shrink-0 relative overflow-hidden border border-white/5">
                    {beat.artwork_url ? (
                      <img src={beat.artwork_url} alt={beat.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-10 h-10 text-dark-600 absolute inset-0 m-auto" />
                    )}
                    <button className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl">
                         <Play className="w-5 h-5 fill-current ml-1" />
                       </div>
                    </button>
                  </div>

                  {/* Details / Edit Form */}
                  <div className="flex-1 w-full space-y-4">
                    {editingId === beat.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Title</label>
                          <Input 
                            value={editForm.title} 
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="bg-dark-950 border-white/10 text-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Genre</label>
                          <Input 
                            value={editForm.genre} 
                            onChange={(e) => setEditForm({...editForm, genre: e.target.value})}
                            className="bg-dark-950 border-white/10 text-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</label>
                          <select 
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                            className="w-full h-10 bg-dark-950 border border-white/10 rounded-lg px-3 text-sm font-bold"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">{beat.title}</h3>
                            <Badge className={`${
                              beat.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
                              beat.status === 'pending' ? 'bg-primary/10 text-primary border-primary/20' :
                              'bg-error/10 text-error border-error/20'
                            } text-[10px] font-black uppercase px-2 py-0`}>
                              {beat.status}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {beat.producer?.display_name || 'Unknown Producer'} • {beat.genre} • {beat.bpm} BPM
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Revenue</p>
                             <p className="text-lg font-black italic text-success">${beat.revenue || '0.00'}</p>
                           </div>
                           <button onClick={() => handleEdit(beat)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-white">
                             <Edit2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(new Date(beat.created_at), 'MMM d, yyyy')}</span>
                        {beat.is_sync_ready && <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sync Ready</span>}
                      </div>
                      
                      {editingId === beat.id ? (
                        <div className="flex gap-2">
                           <Button variant="ghost" className="gap-2 font-bold uppercase text-[10px] h-8" onClick={() => setEditingId(null)}>
                             <X className="w-3 h-3" /> Cancel
                           </Button>
                           <Button className="bg-primary text-black gap-2 font-bold uppercase text-[10px] h-8" onClick={handleSaveEdit}>
                             <Save className="w-3 h-3" /> Save Changes
                           </Button>
                        </div>
                      ) : (
                        beat.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAction(beat.id, 'rejected')} className="h-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-error/10 hover:text-error hover:border-error/30">
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleAction(beat.id, 'approved')} className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary text-black px-6">
                              Approve
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>

      {/* Grid Footer */}
      {beats.length > 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-[10px] italic">E.O.M Oversight Complete</p>
        </div>
      )}
    </div>
  );
}
