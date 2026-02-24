import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  History, 
  Sparkles, 
  Loader2, 
  PenTool
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
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

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGenerate = async (submission: any) => {
    setGenerating(submission.id);
    
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
Drawing from ${responses.major_influences}, the sound is a curated blend of history and future. "My ultimate message is ${responses.message_to_fans}," ${artistName} tells AudioGenes.

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
      
      Alert.alert('Success', 'AI Draft Generated! View it in Editorial.');
    } catch (error: any) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'AI Link Failed: ' + error.message);
    } finally {
      setGenerating(null);
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center p-6 gap-4">
        <ActivityIndicator size="large" color="#005CB9" />
        <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">Syncing Editorial Mind...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <View>
          <Text className="text-3xl font-black uppercase tracking-tighter italic text-white">Editorial / Intelligence Queue</Text>
          <Text className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">AI-driven story synthesis and artist synthesis</Text>
        </View>
        <Badge className="bg-primary px-4 py-1">
          <Text className="font-black italic text-black text-xs">{submissions.filter(s => s.status === 'pending').length} PRIORITY</Text>
        </Badge>
      </View>

      <View className="gap-6">
        {submissions.map((sub) => (
          <Card key={sub.id} className="p-8 bg-dark-900 border-white/5 shadow-2xl overflow-hidden relative">
             <View className="flex-1 gap-6">
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 bg-white/5 rounded-2xl items-center justify-center border border-white/10">
                    <Text className="font-black text-xl italic text-white">{sub.artist?.display_name?.[0] || '?'}</Text>
                  </View>
                  <View>
                    <Text className="text-2xl font-black italic tracking-tighter uppercase text-white">{sub.artist?.display_name || 'Unknown Artist'}</Text>
                    <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sub.artist?.email}</Text>
                  </View>
                  <Badge className={`${sub.status === 'generated' ? 'bg-green-500/20' : 'bg-primary/20'} py-1 px-3 border-none`}>
                    <Text className={`${sub.status === 'generated' ? 'text-green-500' : 'text-primary'} text-[10px] font-black uppercase tracking-widest`}>{sub.status}</Text>
                  </Badge>
                </View>

                <View className="gap-4">
                   <View className="gap-1">
                     <Text className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Journey</Text>
                     <Text className="text-gray-400 italic leading-relaxed" numberOfLines={2}>"{sub.responses.musical_journey}"</Text>
                   </View>
                   <View className="gap-1">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Upcoming</Text>
                      <Text className="text-gray-400 italic leading-relaxed" numberOfLines={1}>"{sub.responses.upcoming_projects}"</Text>
                   </View>
                </View>
             </View>

             <View className="mt-6 gap-3">
                <Button 
                  className="w-full bg-primary flex-row gap-3 items-center justify-center h-14"
                  disabled={generating === sub.id || sub.status === 'generated'}
                  onPress={() => handleGenerate(sub)}
                >
                  {generating === sub.id ? <ActivityIndicator size="small" color="#000" /> : <Sparkles size={16} color="#000" />}
                  <Text className="text-black font-black uppercase tracking-widest text-xs">
                    {sub.status === 'generated' ? 'Article Live' : 'Synthesize Article'}
                  </Text>
                </Button>
                <Button variant="outline" className="w-full border-white/10 h-10 items-center justify-center">
                  <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">View Complete Dossier</Text>
                </Button>
             </View>

             <View className="mt-6 pt-4 border-t border-white/5 flex-row items-center justify-between">
               <Text className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">ID: {sub.id.slice(0,8)}</Text>
               <Text className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">SUBMITTED {format(new Date(sub.created_at), 'MMM d, HH:mm')}</Text>
             </View>
          </Card>
        ))}

        {submissions.length === 0 && (
          <View className="py-20 items-center bg-dark-900/10 border border-dashed border-white/5 rounded-[4rem]">
            <PenTool size={48} color="#4B5563" className="mb-4" />
            <Text className="text-2xl font-black uppercase italic tracking-widest text-white">Queue is Deserted</Text>
            <Text className="text-gray-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">No stories pending synthesis at this time</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
