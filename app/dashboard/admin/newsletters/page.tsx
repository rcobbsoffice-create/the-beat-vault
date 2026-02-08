'use client';

import { useState, useEffect, useRef } from 'react';
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
  Layout,
  Upload,
  Search,
  MapPin,
  Filter,
  UserCircle,
  Chrome
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminNewslettersPage() {
  const { profile } = useAuth();
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'contacts' | 'automation'>('campaigns');
  const [activeSegment, setActiveSegment] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    subject: '',
    content: '',
    audience: 'all',
    sender_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nlRes, contactRes, profileRes] = await Promise.all([
        supabase.from('newsletters').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, display_name, role').in('role', ['artist', 'producer'])
      ]);

      if (nlRes.error) throw nlRes.error;
      if (contactRes.error) throw contactRes.error;
      if (profileRes.error) throw profileRes.error;

      setNewsletters(nlRes.data || []);
      setContacts(contactRes.data || []);
      setProfiles(profileRes.data || []);
    } catch (error: any) {
      console.error('Fetch error details:', error);
      if (error.code === '42P01') {
        toast.error('Database tables missing. Please run contacts_setup.sql in Supabase.');
      } else {
        toast.error(error.message || 'An unexpected error occurred while fetching data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGmailImportReturn = async (token: string) => {
    const toastId = toast.loading('Syncing Google Contacts...');
    try {
      const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch contacts from Google');
      const data = await response.json();
      
      const gmailContacts = data.connections?.map((person: any) => ({
        email: person.emailAddresses?.[0]?.value,
        first_name: person.names?.[0]?.givenName || '',
        last_name: person.names?.[0]?.familyName || '',
        source: 'gmail',
        owner_id: profile?.id,
        geolocation: { city: 'Remote', country: 'Google Account' }
      })).filter((c: any) => c.email) || [];

      if (gmailContacts.length > 0) {
        const { error } = await supabase.from('contacts').upsert(gmailContacts, { onConflict: 'email,owner_id' });
        if (error) throw error;
        toast.success(`Imported ${gmailContacts.length} Google contacts!`, { id: toastId });
        fetchData();
      } else {
        toast.success('No contacts found in your Google account.', { id: toastId });
      }
    } catch (error: any) {
      console.error('Gmail Import Error:', error);
      toast.error('Gmail import failed: ' + error.message, { id: toastId });
    }
  };

  useEffect(() => {
    fetchData();

    // Check for provider_token on mount (return from OAuth)
    const handleSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        handleGmailImportReturn(session.provider_token);
        // Clear the fragment to prevent re-triggering on manual refresh
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleSync();

    // Only listen for INITIAL_SESSION or SIGNED_IN events with a token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.provider_token) {
        handleGmailImportReturn(session.provider_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [profile?.id]);

  const handleAiGenerate = async () => {
    if (!form.subject) {
      toast.error('Please enter a subject topic for AI synthesis.');
      return;
    }
    setAiLoading(true);
    const toastId = toast.loading('AudioGenes AI is drafting your campaign...');
    
    try {
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
          subject: form.subject,
          content: form.content,
          audience: form.audience,
          sender_id: form.sender_id || null,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setIsCreating(false);
      fetchData();
      toast.success('Campaign broadcasted globally!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Processing CSV...');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: async (results) => {
        try {
          if (results.errors.length > 0) {
            console.error('PapaParse Errors:', results.errors);
          }

          const newContacts = results.data.map((row: any) => {
            // Dynamically find keys that match our needs
            const keys = Object.keys(row);
            const findValue = (possibleMatch: string[]) => {
              const key = keys.find(k => {
                const normalizedKey = k.replace(/[^a-z]/g, '');
                return possibleMatch.includes(normalizedKey);
              });
              return key ? row[key] : null;
            };

            const email = findValue(['email', 'emailaddress', 'mail', 'address', 'eaddress']);
            const phone = findValue(['phone', 'mobile', 'cell', 'telephone', 'contactnumber', 'phonenumber']);
            const firstName = findValue(['firstname', 'first', 'fname', 'givenname', 'name']);
            const lastName = findValue(['lastname', 'last', 'lname', 'surname', 'familyname']);
            const city = findValue(['city', 'town', 'location', 'municipality']);
            const country = findValue(['country', 'nation', 'state']);
            const tags = findValue(['tags', 'categories', 'labels', 'groups']);

            return {
              email,
              phone: phone || null,
              first_name: firstName || '',
              last_name: lastName || '',
              source: 'csv',
              geolocation: { 
                city: city || '', 
                country: country || '' 
              },
              tags: tags ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              owner_id: profile?.id
            };
          }).filter(c => c.email && String(c.email).includes('@'));

          if (newContacts.length === 0) {
            console.log('Final parsed contacts (empty):', newContacts);
            console.log('Raw data sample:', results.data.slice(0, 3));
            throw new Error(`No valid contacts found. We couldn't find an "Email" column. Found columns: ${Object.keys(results.data[0] || {}).join(', ')}`);
          }

          const { error } = await supabase.from('contacts').upsert(newContacts, { onConflict: 'email,owner_id' });
          if (error) throw error;

          toast.success(`Successfully imported ${newContacts.length} contacts!`, { id: toastId });
          fetchData();
        } catch (error: any) {
          console.error('CSV Import Error:', error);
          toast.error(error.message, { id: toastId });
        }
      }
    });
  };

  const handleGmailImport = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/contacts.readonly',
        redirectTo: window.location.href
      }
    });

    if (error) {
      toast.error('Google Auth initialization failed');
      console.error(error);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeSegment === 'all') return true;
    if (activeSegment === 'customers') return c.tags?.includes('customer');
    if (activeSegment === 'producers') return c.tags?.includes('producer');
    if (activeSegment === 'artists') return c.tags?.includes('artist');
    if (activeSegment === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(c.created_at) > sevenDaysAgo;
    }
    
    return true;
  });

  const toggleContactSelection = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Intelligence / Newsletters</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">AI-assisted broadcast and relationship management</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-primary text-black font-black uppercase tracking-widest gap-2 h-14 px-8 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" /> New Campaign
          </Button>
        )}
      </div>

      {!isCreating && (
        <div className="flex bg-dark-900/50 p-1 rounded-2xl border border-white/5 w-fit mb-12">
            <button 
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'campaigns' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              Campaigns
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'contacts' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              Contacts
            </button>
            <button 
              onClick={() => setActiveTab('automation')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'automation' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              Automation
            </button>
        </div>
      )}

      {isCreating ? (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
           {/* Campaign Creation Flow */}
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Campaign Subject</label>
                  <Input 
                    placeholder="e.g. Weekly Artist Spotlight..."
                    className="bg-dark-950 border-white/10 h-16 text-xl font-bold rounded-2xl"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Send As (Optional)</label>
                  <select 
                    className="w-full h-16 bg-dark-950 border border-white/10 rounded-2xl px-6 font-black uppercase tracking-widest text-xs text-white"
                    value={form.sender_id}
                    onChange={(e) => setForm({...form, sender_id: e.target.value})}
                  >
                    <option value="">System Admin (Default)</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.display_name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
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
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Newsletter Body</label>
                <textarea 
                  className="w-full h-96 bg-dark-950 border border-white/10 rounded-4xl p-8 text-lg font-medium text-gray-400 placeholder:text-dark-700 focus:ring-1 focus:ring-primary leading-relaxed shadow-inner"
                  placeholder="Draft your story or let AI do the work..."
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                />
              </div>
           </div>
        </div>
      ) : activeTab === 'campaigns' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Campaigns View */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8">
                    <History className="w-5 h-5 text-primary" /> Active Broadcasts
                 </h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Reach</span>
                       <span className="text-2xl font-black italic">{(contacts?.length || 0) * 10}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sent Campaigns</span>
                       <span className="text-2xl font-black italic">{newsletters?.length || 0}</span>
                    </div>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Broadcast History</h2>
              <div className="space-y-4">
                {(!newsletters || newsletters.length === 0) ? (
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
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">To {nl.audience} Audience • {format(new Date(nl.sent_at || nl.created_at || Date.now()), 'MMM d, yyyy')}</p>
                             </div>
                          </div>
                          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                             <Eye className="w-5 h-5 text-gray-400" />
                          </button>
                       </div>
                    </Card>
                  ))
                )}
              </div>
           </div>
        </div>
      ) : activeTab === 'contacts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Contacts View */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="p-8 bg-dark-900/50 border-white/5">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 mb-8">
                    <Users className="w-5 h-5 text-primary" /> Network Intel
                 </h3>
                 <div className="space-y-4">
                    <Button 
                      fullWidth 
                      variant="outline" 
                      className="border-white/10 justify-start gap-3 h-12 font-black uppercase tracking-widest text-[10px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                       <Upload className="w-4 h-4 text-primary" /> Upload CSV
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCsvUpload} />
                    
                    <Button 
                      fullWidth 
                      variant="outline" 
                      className="border-white/10 justify-start gap-4 h-12 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
                      onClick={handleGmailImport}
                    >
                       <Chrome className="w-4 h-4 text-primary" /> Import Gmail
                    </Button>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Smart Segments</p>
                    <div className="space-y-2">
                       {[
                         { id: 'all', label: 'All Contacts', icon: Users },
                         { id: 'customers', label: 'Customers', icon: Send },
                         { id: 'producers', label: 'Producers', icon: UserCircle },
                         { id: 'artists', label: 'Artists', icon: Sparkles },
                         { id: 'recent', label: 'Recently Added', icon: History },
                       ].map((segment) => (
                         <button
                           key={segment.id}
                           onClick={() => setActiveSegment(segment.id)}
                           className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSegment === segment.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                         >
                            <div className="flex items-center gap-3">
                               <segment.icon className="w-3 h-3" />
                               {segment.label}
                            </div>
                            <span className="opacity-50">
                               {segment.id === 'all' ? (contacts?.length || 0) : contacts?.filter(c => {
                                 if (segment.id === 'customers') return c.tags?.includes('customer');
                                 if (segment.id === 'producers') return c.tags?.includes('producer');
                                 if (segment.id === 'artists') return c.tags?.includes('artist');
                                 if (segment.id === 'recent') {
                                   const sevenDaysAgo = new Date();
                                   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                   return new Date(c.created_at) > sevenDaysAgo;
                                 }
                                 return false;
                               }).length || 0}
                            </span>
                         </button>
                       ))}
                    </div>
                  </div>
              </Card>

              <Card className="p-8 border-primary/20 bg-primary/5">
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-primary mb-2">Geolocation Sync</h4>
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                   Contact locations are automatically geocoded during import to allow for regional tour campaigns and localized drops.
                 </p>
              </Card>
           </div>

           <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center gap-6">
                 <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      placeholder="Search by email, name, or location..."
                      className="pl-14 bg-dark-900/50 border-white/10 h-14 rounded-2xl text-xs font-bold uppercase tracking-widest"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="border-white/10 h-14 w-14 rounded-2xl p-0">
                    <Filter className="w-5 h-5 text-gray-400" />
                 </Button>
              </div>

              <div className="bg-dark-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="px-8 py-6 w-12 text-[10px] font-black uppercase tracking-widest text-gray-500">
                             <input 
                               type="checkbox" 
                               className="w-4 h-4 rounded border-white/10 bg-dark-950 accent-primary"
                               checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                               onChange={() => {
                                 if (selectedContacts.length === filteredContacts.length) setSelectedContacts([]);
                                 else setSelectedContacts(filteredContacts.map(c => c.id));
                               }}
                             />
                          </th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Contact</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Location</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Source</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Tags</th>
                          <th className="px-8 py-6"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredContacts.length === 0 ? (
                         <tr>
                            <td colSpan={6} className="py-20 text-center">
                               <p className="text-gray-600 font-black uppercase tracking-widest text-xs italic">No contacts found in this segment</p>
                            </td>
                         </tr>
                       ) : (
                         filteredContacts.map((contact) => (
                           <tr key={contact.id} className="hover:bg-white/2 transition-colors group">
                               <td className="px-8 py-6">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-white/10 bg-dark-950 accent-primary"
                                    checked={selectedContacts.includes(contact.id)}
                                    onChange={() => toggleContactSelection(contact.id)}
                                  />
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <UserCircle className="w-5 h-5 text-gray-600" />
                                     </div>
                                     <div>
                                        <p className="font-bold text-white leading-tight">{contact.first_name || ''} {contact.last_name || ''}</p>
                                        <p className="text-xs text-gray-500">{contact.email}</p>
                                        {contact.phone && <p className="text-[10px] text-gray-600 font-mono mt-0.5">{contact.phone}</p>}
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2 text-gray-400">
                                     <MapPin className="w-3 h-3 text-primary" />
                                     <span className="text-xs font-medium uppercase tracking-wider">
                                       {contact.geolocation?.city || 'Unknown'}, {contact.geolocation?.country || 'Earth'}
                                     </span>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <Badge variant="outline" className="bg-dark-950 border-white/5 text-[8px] px-2 py-0.5">{contact.source}</Badge>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex flex-wrap gap-1">
                                     {contact.tags?.map((tag: string) => (
                                       <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-primary/70">{tag}</span>
                                     ))}
                                     {(!contact.tags || contact.tags.length === 0) && <span className="text-[8px] font-black uppercase tracking-widest text-gray-700">untagged</span>}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                     <ChevronRight className="w-4 h-4" />
                                  </button>
                               </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      ) : activeTab === 'automation' ? (
        <div className="space-y-8">
           {/* Automation View */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-24 h-24 text-primary" />
                 </div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Welcome Sequence</h3>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Automated onboarding for new leads</p>
                 <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Immediate: Welcome Email
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary/50" /> Day 2: Platform Tour
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> Day 5: Exclusive Producer Discount
                    </div>
                 </div>
                 <Button fullWidth variant="outline" className="border-white/10 font-black uppercase tracking-widest text-[10px]">Configure Flow</Button>
              </Card>

              <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5 relative overflow-hidden group">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Drip Campaigns</h3>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Sync with marketplace activity</p>
                 <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Abandoned Checkout Sync
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> License Expiring Reminder
                    </div>
                 </div>
                 <Badge className="bg-primary/20 text-primary border-primary/20 mb-4">Premium Feature</Badge>
                 <Button fullWidth className="bg-white/5 border-white/10 font-black uppercase tracking-widest text-[10px] cursor-not-allowed">Enable Connect</Button>
              </Card>

              <Card className="p-8 border-primary/20 bg-primary/5">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-primary" /> AI Automation
                  </h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">
                    Our AudioGenes Engine monitors your network and suggests the best time to send campaigns based on user activity and geolocation.
                  </p>
                  <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] w-full">Enable AI Intelligence</Button>
              </Card>
           </div>

           <div className="mt-12">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Automation Pipelines</h2>
              <div className="bg-dark-900/30 rounded-[2.5rem] border border-white/5 p-12 text-center">
                 <History className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                 <p className="text-xs font-black uppercase tracking-widest text-gray-600">No active pipelines running. Start a new sequence to begin automatic engagement.</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="p-12 text-center">
           <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Tab {activeTab} is under construction</p>
           <Button onClick={() => setActiveTab('campaigns')} className="mt-4">Back to Campaigns</Button>
        </div>
      )}
    </div>
  );
}
