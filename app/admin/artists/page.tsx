'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { UserCheck, UserX, ExternalLink, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

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
    // ... same processing logic ...
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
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'editor') {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Access Denied</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">This station is for authorized staff only.</p>
        <Button onClick={() => window.location.href = '/'}>Return to Surface</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Control Room / Artists</h1>
            <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">Verify and manage artist profiles</p>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Queue: {submissions.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center font-black uppercase tracking-widest animate-pulse">
            Loading queue...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((artist) => (
              <div key={artist.id} className="bg-dark-900 border border-dark-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-white/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-dark-800 rounded-xl flex items-center justify-center font-black text-2xl text-dark-600">
                    {artist.artist_name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{artist.artist_name}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">{artist.genre}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-widest italic">
                        {artist.tier} Review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 font-bold uppercase tracking-widest border-dark-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                    disabled={processingId === artist.id}
                    onClick={() => handleAction(artist.id, 'rejected')}
                  >
                    {processingId === artist.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Reject
                  </Button>
                  <Button 
                    className="gap-2 font-bold uppercase tracking-widest bg-success hover:bg-success-dark"
                    disabled={processingId === artist.id}
                    onClick={() => handleAction(artist.id, 'approved')}
                  >
                    {processingId === artist.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Verify Artist
                  </Button>
                  {artist.release_url && (
                    <Button variant="ghost" className="p-2 h-auto text-gray-500 hover:text-white" onClick={() => window.open(artist.release_url, '_blank')}>
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-dark-800 rounded-3xl">
                <p className="text-gray-600 font-bold uppercase tracking-[0.2em]">Queue is clear</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
