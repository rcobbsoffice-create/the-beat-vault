'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { UserCheck, UserX, ExternalLink, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';

export default function AdminArtistsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
        if (profile.role === 'admin' || profile.role === 'editor') {
          fetchSubmissions();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Remove from list
      setSubmissions(submissions.filter(s => s.id !== id));
      
      if (status === 'approved') {
        alert('Artist verified and submission approved.');
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Error updating status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'editor') {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Access Denied</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">This station is for authorized staff only.</p>
        <Button onClick={() => window.location.href = '/'}>Return to Surface</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Control Room / Artists</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">Verify and manage artist profiles</p>
        </div>
        <div className="flex gap-4">
          <Badge className="flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary border-primary/20 text-xs font-black uppercase rounded-full tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Queue: {submissions.length}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-black uppercase tracking-widest animate-pulse text-gray-500">
          Loading queue...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((artist) => (
            <div key={artist.id} className="bg-dark-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-primary/50 transition-all duration-500 shadow-2xl">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center font-black text-3xl text-dark-600 border border-white/5 group-hover:border-primary/30 transition-all">
                  {artist.name?.[0] || artist.artist_name?.[0] || '?'}
                </div>
                <div>
                  <h3 className="text-2xl font-black italic mb-2 tracking-tight">{artist.name || artist.artist_name}</h3>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{artist.genre}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] items-center flex gap-2 font-black text-gray-400 uppercase tracking-widest italic">
                      {artist.tier} Priority Review
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none gap-3 font-black uppercase tracking-widest border-white/10 hover:bg-error/10 hover:text-error hover:border-error/30 transition-all h-12 px-8"
                  disabled={processingId === artist.id}
                  onClick={() => handleAction(artist.id, 'rejected')}
                >
                  {processingId === artist.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Reject
                </Button>
                <Button 
                  className="flex-1 md:flex-none gap-3 font-black uppercase tracking-widest bg-primary text-black hover:opacity-90 h-12 px-8 shadow-xl shadow-primary/20"
                  disabled={processingId === artist.id}
                  onClick={() => handleAction(artist.id, 'approved')}
                >
                  {processingId === artist.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Verify Artist
                </Button>
                {artist.release_url && (
                  <Button variant="ghost" className="hidden lg:flex p-3 h-12 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/5" onClick={() => window.open(artist.release_url, '_blank')}>
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="py-32 text-center bg-dark-900/30 border border-dashed border-white/5 rounded-[3rem] backdrop-blur-sm">
              <ShieldCheck className="w-16 h-16 text-primary/20 mx-auto mb-6" />
              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-sm italic">Queue is clear • Standards Met</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
