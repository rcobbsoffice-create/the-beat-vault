import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
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
  Plus, 
  History,
  Loader2,
  ChevronRight,
  BrainCircuit,
  Search,
  MapPin,
  Filter,
  UserCircle
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
// import Papa from 'papaparse'; // Commented out as regular file read requires fs/document picker integration
import { Picker } from '@react-native-picker/picker';

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'contacts' | 'automation'>('campaigns');
  const [activeSegment, setActiveSegment] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

      if (nlRes.error) console.error(nlRes.error); // throw nlRes.error;
      if (contactRes.error) console.error(contactRes.error); // throw contactRes.error;
      if (profileRes.error) console.error(profileRes.error); // throw profileRes.error;

      setNewsletters(nlRes.data || []);
      setContacts(contactRes.data || []);
      setProfiles(profileRes.data || []);
    } catch (error: any) {
      console.error('Fetch error details:', error);
      Alert.alert('Error', error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAiGenerate = async () => {
    if (!form.subject) {
      Alert.alert('Error', 'Please enter a subject topic for AI synthesis.');
      return;
    }
    setAiLoading(true);
    
    // Mock AI generation
    setTimeout(() => {
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
        setAiLoading(false);
        Alert.alert('Success', 'AI Draft Ready!');
    }, 2500);
  };

  const handleSend = async () => {
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
      Alert.alert('Success', 'Campaign broadcasted globally!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Simplified contact filter
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

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

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="mb-8">
        <Text className="text-3xl font-black uppercase tracking-tighter italic text-white flex-wrap">Intelligence / Newsletters</Text>
        <Text className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">AI-assisted broadcast</Text>
      </View>

      {!isCreating && (
        <View className="mb-8 flex-row justify-between items-center flex-wrap gap-4">
           {/* Navigation Tabs - Simplified for Mobile */}
           <View className="flex-row bg-dark-900 border border-white/5 rounded-xl p-1">
             {['campaigns', 'contacts', 'automation'].map((tab) => (
               <TouchableOpacity 
                 key={tab}
                 onPress={() => setActiveTab(tab as any)}
                 className={`px-4 py-2 rounded-lg ${activeTab === tab ? 'bg-primary' : ''}`}
               >
                 <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab ? 'text-black' : 'text-gray-500'}`}>{tab}</Text>
               </TouchableOpacity>
             ))}
           </View>

           <Button onPress={() => setIsCreating(true)} className="bg-primary flex-row gap-2">
             <Plus size={16} color="#000" />
             <Text className="text-black font-black uppercase tracking-widest text-xs">New Campaign</Text>
           </Button>
        </View>
      )}

      {isCreating ? (
        <View className="gap-6 bg-dark-900/50 p-6 rounded-3xl border border-white/5">
           <View className="flex-row justify-between items-center">
             <Button variant="ghost" onPress={() => setIsCreating(false)}>
               <Text className="text-gray-500 font-bold uppercase text-xs">Cancel</Text>
             </Button>
             <Text className="text-white font-black uppercase italic text-lg">New Broadcast</Text>
             <Button onPress={handleSend} className="bg-primary">
               <Text className="text-black font-bold uppercase text-xs">Send</Text>
             </Button>
           </View>
           
           <View className="gap-4">
              <View>
                 <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Subject</Text>
                 <TextInput 
                   value={form.subject}
                   onChangeText={(t) => setForm({...form, subject: t})}
                   className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold"
                   placeholder="Campaign Subject"
                   placeholderTextColor="#6B7280"
                 />
              </View>

              <View className="flex-row justify-between items-center">
                 <Button variant="outline" onPress={handleAiGenerate} disabled={aiLoading} className="flex-row gap-2 border-white/10">
                    {aiLoading ? <ActivityIndicator size="small" color="#fff" /> : <BrainCircuit size={16} color="#D4AF37" />}
                    <Text className="text-white font-bold text-xs uppercase">AI Draft</Text>
                 </Button>
              </View>

              <TextInput 
                value={form.content}
                onChangeText={(t) => setForm({...form, content: t})}
                className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-white h-64 text-base"
                multiline
                textAlignVertical="top"
                placeholder="Write your story..."
                placeholderTextColor="#6B7280"
              />
           </View>
        </View>
      ) : activeTab === 'campaigns' ? (
        <View className="gap-6">
           <Card className="p-6 bg-dark-900 border-white/5">
               <View className="flex-row items-center gap-3 mb-6">
                 <History size={20} color="#D4AF37" />
                 <Text className="text-xl font-black uppercase italic tracking-tighter text-white">Active Broadcasts</Text>
               </View>
               
               {newsletters.length === 0 ? (
                 <View className="py-12 items-center">
                   <Text className="text-gray-500 font-black uppercase tracking-widest text-xs italic">No Campaigns Recorded</Text>
                 </View>
               ) : (
                 newsletters.map((nl) => (
                   <View key={nl.id} className="mb-4 last:mb-0 p-4 bg-white/5 rounded-xl border border-white/5 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 bg-dark-800 rounded-lg items-center justify-center">
                          <Send size={16} color="#9CA3AF" />
                        </View>
                        <View>
                           <Text className="font-bold text-white mb-1">{nl.subject}</Text>
                           <Text className="text-[10px] text-gray-500 uppercase tracking-widest">{nl.audience} • {new Date(nl.created_at).toLocaleDateString()}</Text>
                        </View>
                      </View>
                   </View>
                 ))
               )}
           </Card>
        </View>
      ) : activeTab === 'contacts' ? (
        <View className="gap-6">
           <Card className="p-6 bg-dark-900 border-white/5">
              <View className="flex-row gap-4 mb-6">
                 <View className="flex-1 bg-dark-950 border border-white/10 rounded-xl px-3 py-2 flex-row items-center gap-2">
                    <Search size={16} color="#6B7280" />
                    <TextInput 
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search contacts..."
                      placeholderTextColor="#6B7280"
                      className="flex-1 text-white"
                    />
                 </View>
              </View>

              <View className="gap-4">
                 {filteredContacts.length === 0 ? (
                    <Text className="text-gray-500 text-center py-8">No contacts found.</Text>
                 ) : (
                    filteredContacts.map(c => (
                      <View key={c.id} className="p-4 bg-white/5 rounded-xl flex-row items-center justify-between">
                         <View className="flex-row items-center gap-3">
                            <UserCircle size={24} color="#D4AF37" />
                            <View>
                               <Text className="text-white font-bold">{c.first_name} {c.last_name}</Text>
                               <Text className="text-gray-500 text-xs">{c.email}</Text>
                            </View>
                         </View>
                         <Badge variant="outline" className="border-white/10"><Text className="text-[10px] text-gray-400">{c.source}</Text></Badge>
                      </View>
                    ))
                 )}
              </View>
           </Card>
        </View>
      ) : (
        <View className="p-12 items-center">
           <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">Automation Suite Coming Soon</Text>
        </View>
      )}
    </ScrollView>
  );
}
