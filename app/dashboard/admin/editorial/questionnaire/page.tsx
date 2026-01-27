'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  History, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight,
  User,
  ExternalLink,
  PenTool
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminQuestionnaireQueue() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_questionnaires')
        .select(`
          *,
          artist:profiles!artist_id(display_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGenerate = async (submission: any) => {
    setGenerating(submission.id);
    const toastId = toast.loading('Consulting AI Writer...');
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const responses = submission.responses;
      const artistName = submission.artist?.display_name || 'Generic Artist';
      
      // Construct a "cool" article draft based on questionnaire
      const generatedTitle = `${artistName}: Beyond the Sound Waves`;
      const generatedExcerpt = `Discover the raw, unfiltered journey of ${artistName}, from their early studio sparks to their global vision.`;
      const generatedContent = `
# The Sonic Evolution of ${artistName}

${responses.musical_journey}

## The Creative Vortex
When asked about their process, ${artistName} shared a profound insight into the studio: "${responses.creative_process}". This dedication to craft is what sets them apart in today's landscape.

## Influences and Visions
Drawing from ${responses.major_influences}, the sound is a curated blend of history and future. "My ultimate message is ${responses.message_to_fans}," ${artistName} tells TrackFlow.

## What's Next
Look out for ${responses.upcoming_projects} as ${artistName} continues to redefine the boundaries of ${submission.artist?.genre || 'electronic'} music.
      `;

      // Save as a draft article
      const { data: userData } = await supabase.auth.getUser();
      const slug = generatedTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      const { error: articleError } = await supabase
        .from('articles')
        .insert({
          title: generatedTitle,
          slug: slug,
          excerpt: generatedExcerpt,
          content: generatedContent,
          category: 'Interviews',
          image_url: 'https://images.unsplash.com/photo-1514525253361-b83f85df035e?q=80&w=2070&auto=format&fit=crop',
          status: 'draft',
          author_id: userData.user?.id || '00000000-0000-0000-0000-000000000000',
          featured: true
        });

      if (articleError) throw articleError;

      // Update questionnaire status
      await supabase
        .from('artist_questionnaires')
        .update({ status: 'generated' })
        .eq('id', submission.id);

      setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'generated' } : s));
      
      toast.success('AI Draft Generated! View it in Editorial.', { id: toastId });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error('AI Link Failed: ' + error.message, { id: toastId });
    } finally {
      setGenerating(null);
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
        <Sparkles className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">Syncing Editorial Mind...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Editorial / Intelligence Queue</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">AI-driven story synthesis and artist synthesis</p>
        </div>
        <Badge variant="primary" className="font-black italic px-4 py-1">
          {submissions.filter(s => s.status === 'pending').length} PRIORITY
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {submissions.map((sub) => (
          <Card key={sub.id} className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5 group hover:border-primary/50 transition-all duration-500 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <History className="w-48 h-48" />
             </div>

             <div className="flex flex-col lg:flex-row gap-12 items-start justify-between relative z-10">
                <div className="space-y-6 flex-1">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all font-black text-xl italic">
                       {sub.artist?.display_name?.[0] || '?'}
                     </div>
                     <div>
                       <h3 className="text-2xl font-black italic tracking-tighter uppercase">{sub.artist?.display_name || 'Unknown Artist'}</h3>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sub.artist?.email}</p>
                     </div>
                     <Badge className={`${sub.status === 'generated' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'} text-[10px] font-black uppercase tracking-widest py-0.5 px-3 border-none shadow-sm`}>
                       {sub.status}
                     </Badge>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Journey</p>
                          <p className="text-gray-400 line-clamp-2 italic leading-relaxed">"{sub.responses.musical_journey}"</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Influences</p>
                          <p className="text-gray-400 line-clamp-1 italic leading-relaxed">"{sub.responses.major_influences}"</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Upcoming</p>
                           <p className="text-gray-400 line-clamp-1 italic leading-relaxed">"{sub.responses.upcoming_projects}"</p>
                        </div>
                        <div className="px-4 py-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group-hover:border-primary/20 transition-all shadow-inner">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Research Depth</span>
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 rounded-full bg-primary/20" />)}
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-64">
                   <Button 
                     className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-14 group/btn relative overflow-hidden shadow-xl shadow-primary/10"
                     disabled={generating === sub.id || sub.status === 'generated'}
                     onClick={() => handleGenerate(sub)}
                   >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                     <div className="flex items-center justify-center gap-3 relative z-10">
                       {generating === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                       {sub.status === 'generated' ? 'Article Live' : 'Synthesize Article'}
                     </div>
                   </Button>
                   <Button variant="outline" className="w-full border-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] h-12 hover:bg-white/5">
                     View Complete Dossier
                   </Button>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">
               <span>ID: {sub.id.slice(0,8)}</span>
               <span>SUBMITTED {format(new Date(sub.created_at), 'MMM d, HH:mm')}</span>
             </div>
          </Card>
        ))}

        {submissions.length === 0 && (
          <div className="py-48 text-center bg-dark-900/10 border border-dashed border-white/5 rounded-[4rem] backdrop-blur-sm grayscale opacity-50">
            <PenTool className="w-20 h-20 mx-auto mb-8 text-dark-500" />
            <h3 className="text-2xl font-black uppercase italic tracking-widest text-dark-400">Queue is Deserted</h3>
            <p className="text-gray-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">No stories pending synthesis at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
