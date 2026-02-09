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
  X,
  Share2,
  Trash2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { usePlayer } from '@/stores/player';
import { AdminBeatUploadForm } from '@/components/admin/AdminBeatUploadForm';

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [producers, setProducers] = useState<any[]>([]);
  
  const handleCancelUpload = () => setShowUploadModal(false);
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchBeats();
  };
  
  // PERFORMANCE FIX: Only subscribe to need player state to avoid re-renders on 'currentTime'
  const currentBeat = usePlayer(state => state.currentBeat);
  const isPlaying = usePlayer(state => state.isPlaying);
  const setCurrentBeat = usePlayer(state => state.setCurrentBeat);

  const fetchBeats = useCallback(async () => {
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
  }, [statusFilter, searchQuery]); // Stable dependencies

  // PERFORMANCE FIX: Debounce search query to prevent excessive Supabase requests and re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    fetchBeats();
    
    // Fetch producers for assignment
    const fetchProducers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('role', ['producer', 'admin']);
      if (data) setProducers(data);
    };
    fetchProducers();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this beat? This cannot be undone.')) return;

    const toastId = toast.loading('Deleting beat...');
    try {
      const { error } = await supabase
        .from('beats')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBeats(prev => prev.filter(b => b.id !== id));
      toast.success('Beat deleted successfully', { id: toastId });
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message, { id: toastId });
    }
  };

  const handleEdit = (beat: any) => {
    setEditingId(beat.id);
    setEditForm({ ...beat });
  };

  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

    const toastId = toast.loading('Uploading artwork...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('beat-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('beat-covers')
        .getPublicUrl(filePath);

      setEditForm((prev: any) => ({ ...prev, artwork_url: publicUrl }));
      toast.success('Artwork uploaded!', { id: toastId });
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: toastId });
    }
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
          key: editForm.key,
          price: editForm.price,
          status: editForm.status,
          description: editForm.description,
          mood_tags: editForm.mood_tags, // Array
          isrc: editForm.isrc,
          metadata: { ...editForm.metadata }, // Preserve other metadata
          producer_id: editForm.producer_id,
          artwork_url: editForm.artwork_url
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

  const handleShare = (beat: any) => {
    const url = `${window.location.origin}/beats/${beat.id}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: beat.title,
        text: `Check out this beat: ${beat.title}`,
        url: url,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      });
    } else {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success('Link copied to clipboard!', { icon: '🔗', style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' } });
        })
        .catch((err) => {
          console.error('Clipboard error:', err);
          toast.error('Failed to copy link. Please manually copy the URL.');
        });
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
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-primary text-black font-black uppercase tracking-widest gap-2"
            >
                <Music className="w-4 h-4" />
                Add Beat
            </Button>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search assets..."
              className="pl-10 pr-4 py-2 bg-dark-900 border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all text-white w-full sm:w-64"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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

    {/* Upload Modal */}
    {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                <AdminBeatUploadForm 
                    onCancel={handleCancelUpload}
                    onSuccess={handleUploadSuccess}
                />
            </div>
        </div>
    )}

      {/* Assets Grid */}
      <div className="grid grid-cols-1 gap-6">
        {beats.length === 0 ? (
          <div className="text-center py-32 bg-dark-900/30 border border-dashed border-white/5 rounded-[3rem]">
             <Music className="w-16 h-16 text-primary/10 mx-auto mb-6" />
             <h3 className="text-xl font-black uppercase italic text-white mb-2">No Assets Found</h3>
             <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Adjust your filters or search query</p>
          </div>
        ) : (
          beats.map((beat) => (
            <Card key={beat.id} className="p-6 hover:border-primary/30 transition-all duration-500 group bg-dark-900/50 border-white/5 relative overflow-hidden">
               <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                  {/* Artwork & Play */}
                  <div className="w-32 h-32 rounded-2xl bg-dark-800 shrink-0 relative overflow-hidden border border-white/5 group-artwork">
                    <img 
                      src={editingId === beat.id && editForm.artwork_url ? editForm.artwork_url : (beat.artwork_url || '/images/placeholder-instrumental.png')} 
                      alt={beat.title} 
                      className={`w-full h-full object-cover ${!beat.artwork_url && editingId !== beat.id ? 'opacity-50 grayscale' : ''}`} 
                    />
                    
                    {editingId === beat.id ? (
                      <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                        <span className="text-[10px] font-black uppercase text-white tracking-widest border border-white/20 px-2 py-1 rounded hover:bg-white/10">Change</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleArtworkUpload} />
                      </label>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Play button clicked for beat:', beat.id, beat.title);
                          setCurrentBeat(beat);
                        }}
                        className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl">
                            <Play className="w-5 h-5 fill-current ml-1" />
                         </div>
                      </button>
                    )}
                  </div>

                  {/* Details / Edit Form */}
                  <div className="flex-1 w-full space-y-4">
                    {editingId === beat.id ? (
                      /* Edit Form Container */
                      <div className="bg-dark-900/80 p-6 rounded-2xl border border-white/10 animate-in fade-in duration-300">
                        {/* AI Toolbar */}
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                           <h4 className="text-sm font-black uppercase text-white tracking-widest">Edit Mode</h4>
                            <button 
                              onClick={async () => {
                                const toastId = toast.loading('AI is listening to the track...');
                                try {
                                  // Perform AI Analysis using the audio URL directly
                                  // This avoids fetching the large audio file in the browser
                                  const analyzeRes = await fetch('/api/ai/analyze', {
                                    method: 'POST',
                                    body: JSON.stringify({ 
                                      filename: editForm.title || 'Unknown Beat',
                                      audioUrl: editForm.audio_url // Let backend fetch it
                                    })
                                  });
                                  
                                  const aiData = await analyzeRes.json();
                                  if (aiData.error) throw new Error(aiData.error);
                                  
                                  // 3. Generate Artwork if prompt available
                                  let artworkUrl = editForm.artwork_url;
                                  if (aiData.artwork_prompt) {
                                    toast.loading('Generating matching artwork...', { id: toastId });
                                    const artRes = await fetch('/api/ai/artwork', {
                                      method: 'POST',
                                      body: JSON.stringify({ 
                                        prompt: aiData.artwork_prompt,
                                        beatId: editingId 
                                      })
                                    });
                                    
                                    const artData = await artRes.json();
                                    if (artData.error) {
                                      console.error('Artwork generation error:', artData.error, artData.details);
                                      toast.error(`Artwork error: ${artData.error}`, { id: toastId, duration: 2000 });
                                      // Continue with metadata even if artwork fails
                                    } else if (artData.url) {
                                      console.log('AI Artwork Generated:', artData.url);
                                      artworkUrl = artData.url;
                                    }
                                  }

                                  // 4. Update Form
                                  setEditForm((prev: any) => ({
                                    ...prev,
                                    title: aiData.title || prev.title,
                                    genre: aiData.genre || prev.genre,
                                    description: aiData.description || prev.description,
                                    mood_tags: aiData.moods || prev.mood_tags,
                                    bpm: aiData.bpm || prev.bpm,
                                    key: aiData.key || prev.key,
                                    artwork_url: artworkUrl
                                  }));

                                  toast.success('Sync Complete: AI has analyzed your track!', { id: toastId });
                                } catch (err: any) {
                                  console.error('Auto-fill error:', err);
                                  toast.error(err.message || 'Failed to analyze track', { id: toastId });
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                            >
                              ✨ Auto-Fill
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Column 1: Core Info */}
                           <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Producer</label>
                                <select 
                                  value={editForm.producer_id || ''}
                                  onChange={(e) => setEditForm({...editForm, producer_id: e.target.value})}
                                  className="w-full h-10 bg-dark-950 border border-white/10 rounded-lg px-3 text-sm font-bold text-white focus:outline-none focus:border-primary"
                                >
                                  <option value="">Unknown / Legacy</option>
                                  {producers.map(p => (
                                    <option key={p.id} value={p.id}>{p.display_name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Title</label>
                                <Input 
                                  value={editForm.title || ''} 
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  className="bg-dark-950 border-white/10"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Genre</label>
                                <Input 
                                  value={editForm.genre || ''} 
                                  onChange={(e) => setEditForm({...editForm, genre: e.target.value})}
                                  className="bg-dark-950 border-white/10"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">BPM</label>
                                  <Input 
                                    type="number"
                                    value={editForm.bpm || ''} 
                                    onChange={(e) => setEditForm({...editForm, bpm: Number(e.target.value)})}
                                    className="bg-dark-950 border-white/10"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Key</label>
                                  <Input 
                                    value={editForm.key || ''} 
                                    onChange={(e) => setEditForm({...editForm, key: e.target.value})}
                                    className="bg-dark-950 border-white/10"
                                  />
                                </div>
                              </div>
                           </div>

                           {/* Column 2: Metadata & Rights */}
                           <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</label>
                                <select 
                                  value={editForm.status}
                                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                  className="w-full h-10 bg-dark-950 border border-white/10 rounded-lg px-3 text-sm font-bold text-white focus:outline-none focus:border-primary"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="published">Published</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="draft">Draft</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">ISRC</label>
                                <Input 
                                  value={editForm.isrc || ''} 
                                  onChange={(e) => setEditForm({...editForm, isrc: e.target.value})}
                                  className="bg-dark-950 border-white/10 font-mono text-xs"
                                  placeholder="US-XXX-XX-XXXXX"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Moods (comma sep)</label>
                                <Input 
                                  value={editForm.mood_tags?.join(', ') || ''} 
                                  onChange={(e) => setEditForm({...editForm, mood_tags: e.target.value.split(',').map((s: string) => s.trim())})}
                                  className="bg-dark-950 border-white/10"
                                  placeholder="Chill, Dark, Hype"
                                />
                              </div>
                           </div>
                        </div>
                        
                        {/* Description - Full Width */}
                        <div className="mt-4 space-y-1">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Description</label>
                           <textarea
                             value={editForm.description || ''}
                             onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                             className="w-full h-20 bg-dark-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary resize-none"
                             placeholder="Track description..."
                           />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
                           <Button 
                             onClick={() => setEditingId(null)}
                             variant="ghost" 
                             className="text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest"
                           >
                             Cancel
                           </Button>
                           <Button 
                             onClick={handleSaveEdit}
                             className="bg-primary text-black hover:bg-primary-light text-xs font-black uppercase tracking-widest"
                           >
                             Save Changes
                           </Button>
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
                           {/* Analytics Stats */}
                           <div className="flex items-center gap-4 text-center">
                             <div>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Plays</p>
                               <p className="text-lg font-black italic text-primary">{beat.play_count || 0}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Views</p>
                               <p className="text-lg font-black italic text-blue-400">{beat.view_count || 0}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Revenue</p>
                             <p className="text-lg font-black italic text-success">${beat.revenue || '0.00'}</p>
                           </div>
                           <button 
                             onClick={() => handleShare(beat)} 
                             className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-white"
                             title="Share Beat"
                           >
                             <Share2 className="w-5 h-5" />
                           </button>
                            <button onClick={() => handleDelete(beat.id)} className="p-3 bg-white/5 hover:bg-error/10 hover:border-error/30 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-error" title="Delete Beat">
                              <Trash2 className="w-5 h-5" />
                            </button>
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
                      
                      {editingId !== beat.id && beat.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAction(beat.id, 'rejected')} className="h-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-error/10 hover:text-error hover:border-error/30">
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleAction(beat.id, 'approved')} className="h-8 text-[10px] font-black uppercase tracking-widest bg-primary text-black px-6">
                              Approve
                            </Button>
                          </div>
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
