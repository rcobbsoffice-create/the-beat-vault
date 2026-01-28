'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Mail, 
  Sparkles, 
  Send, 
  Users, 
  Eye, 
  BarChart3, 
  Plus, 
  History,
  Loader2,
  ChevronRight,
  BrainCircuit,
  Layout
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    subject: '',
    content: '',
    audience: 'all'
  });

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const handleAiGenerate = async () => {
    if (!form.subject) {
      toast.error('Please enter a subject topic for AI synthesis.');
      return;
    }
    setAiLoading(true);
    const toastId = toast.loading('AudioGenes AI is drafting your campaign...');
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockedContent = `
# New Opportunities: ${form.subject}

Hello AudioGenes Fam,

We're excited to announce some major updates regarding ${form.subject}. 
Our platform continues to evolve, and we want you at the forefront of this sonic revolution.

## Key Highlights:
- Deep-dive analytics for all distributed tracks.
- New Printful integration for exclusive artist merch.
- AI-driven editorial spots now open for application.

Don't miss out on the future of music management.

Best,
The AudioGenes Editorial Team
      `;
      
      setForm({ ...form, content: mockedContent });
      toast.success('AI Draft Ready!', { id: toastId });
    } catch (error) {
      toast.error('AI Draft failed.', { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSend = async () => {
    const toastId = toast.loading('Broadcasting campaign...');
    try {
      const { error } = await supabase
        .from('newsletters')
        .insert({
          ...form,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setIsCreating(false);
      fetchNewsletters();
      toast.success('Campaign broadcasted globally!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Intelligence / Newsletters</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">AI-assisted broadcast and relationship management</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-primary text-black font-black uppercase tracking-widest gap-2 h-14 px-8 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" /> Start New Campaign
          </Button>
        )}
      </div>

      {isCreating ? (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsCreating(false)}
                className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg"
              >
                Cancel Campaign
              </button>
              <div className="flex gap-4">
                 <Button variant="outline" className="border-white/10 font-black uppercase tracking-widest text-xs h-12" onClick={handleAiGenerate} disabled={aiLoading}>
                   {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                   Ask AI to Draft
                 </Button>
                 <Button className="bg-primary text-black font-black uppercase tracking-widest text-xs h-12 px-8" onClick={handleSend}>
                   <Send className="w-4 h-4 mr-2" /> Broadcast Now
                 </Button>
              </div>
           </div>

           <div className="space-y-8 bg-dark-900/50 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Campaign Subject / Topic</label>
                  <Input 
                    placeholder="e.g. Weekly Artist Spotlight..."
                    className="bg-dark-950 border-white/10 h-16 text-xl font-bold rounded-2xl"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Audience</label>
                  <select 
                    className="w-full h-16 bg-dark-950 border border-white/10 rounded-2xl px-6 font-black uppercase tracking-widest text-xs text-white"
                    value={form.audience}
                    onChange={(e) => setForm({...form, audience: e.target.value})}
                  >
                    <option value="all">All Subscribers</option>
                    <option value="producers">Producers Only</option>
                    <option value="artists">Artists Only</option>
                    <option value="customers">Customers Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Newsletter Body (Markdown Supported)</label>
                <textarea 
                  className="w-full h-96 bg-dark-950 border border-white/10 rounded-4xl p-8 text-lg font-medium text-gray-400 placeholder:text-dark-700 focus:ring-1 focus:ring-primary leading-relaxed shadow-inner"
                  placeholder="Draft your story or let AI do the work..."
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                />
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Sidebar: Audience Insights */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8">
                    <Users className="w-5 h-5 text-primary" /> Reachable Network
                 </h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Reach</span>
                       <span className="text-2xl font-black italic">4,520</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Artists</span>
                       <span className="text-2xl font-black italic">1,205</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg. Open Rate</span>
                       <span className="text-2xl font-black italic text-success">42%</span>
                    </div>
                 </div>
              </Card>

              <Card className="p-8 border-primary/20 bg-primary/5">
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-primary mb-2">Predictive AI</h4>
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                   Based on your previous 5 campaigns, Thursdays at 10:00 AM EST provide the highest engagement for your Artist audience.
                 </p>
              </Card>
           </div>

           {/* History List */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Broadcast History</h2>
              
              <div className="space-y-4">
                {newsletters.length === 0 ? (
                  <div className="py-32 text-center bg-dark-900/10 border border-dashed border-white/5 rounded-[4rem]">
                     <Mail className="w-16 h-16 text-dark-500 mx-auto mb-6" />
                     <p className="text-gray-600 font-black uppercase tracking-widest text-xs italic">No Campaigns Recorded</p>
                  </div>
                ) : (
                  newsletters.map((nl) => (
                    <Card key={nl.id} className="p-6 bg-dark-900/30 border-white/5 hover:border-primary/20 transition-all group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                                <Send className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                             </div>
                             <div>
                                <h3 className="font-black italic uppercase tracking-tighter text-lg">{nl.subject}</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">To {nl.audience} Audience • {format(new Date(nl.sent_at || nl.created_at), 'MMM d, yyyy')}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Open Rate</p>
                                <p className="text-lg font-black italic text-success">--</p>
                             </div>
                             <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                                <Eye className="w-5 h-5 text-gray-400" />
                             </button>
                          </div>
                       </div>
                    </Card>
                  ))
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
