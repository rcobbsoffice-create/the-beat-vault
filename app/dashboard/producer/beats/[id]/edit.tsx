import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ChevronLeft,
  Save,
  Trash2,
  Trash,
  Sparkles
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useCatalogStore } from '@/stores/catalog';
import { useAIAnalyze } from '@/lib/useAIAnalyze';

export default function BeatEditPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getBeat, updateBeat } = useCatalogStore();
  const { analyzeWithUI, isAnalyzing } = useAIAnalyze();
  
  const [loading, setLoading] = useState(false);
  const [beat, setBeat] = useState<any>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'unpublished'>('published');
  const [priceBasic, setPriceBasic] = useState('49.99');
  const [priceExclusive, setPriceExclusive] = useState('899.99');
  const [basicLicenseId, setBasicLicenseId] = useState<string | null>(null);
  const [exclusiveLicenseId, setExclusiveLicenseId] = useState<string | null>(null);

  useEffect(() => {
    const existingBeat = getBeat(id as string);
    if (existingBeat) {
      setBeat(existingBeat);
      setTitle(existingBeat.title);
      setGenre(existingBeat.genre);
      setBpm(existingBeat.bpm.toString());
      setKey(existingBeat.key || '');
      setDescription(existingBeat.description || '');
      setTags(existingBeat.moods?.join(', ') || '');
      setStatus(existingBeat.status as any);
      
      const basic = existingBeat.licenses?.find((l: any) => l.type === 'basic');
      if (basic) {
        setPriceBasic((basic.price / 100).toString());
        setBasicLicenseId(basic.id);
      }
      const exclusive = existingBeat.licenses?.find((l: any) => l.type === 'exclusive');
      if (exclusive) {
        setPriceExclusive((exclusive.price / 100).toString());
        setExclusiveLicenseId(exclusive.id);
      }
    } else {
      // Fetch from DB if not in store
      fetchBeatFromDB();
    }
  }, [id]);

  const fetchBeatFromDB = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setBeat(data);
      setTitle(data.title);
      setGenre(data.genre);
      setBpm(data.bpm?.toString() || '');
      setKey(data.key || '');
      setDescription(data.description || '');
      setTags(data.mood_tags?.join(', ') || '');
      setStatus(data.status);

      const { data: licenses } = await supabase.from('licenses').select('*').eq('beat_id', id);
      const basic = licenses?.find((l: any) => l.type === 'basic');
      if (basic) {
        setPriceBasic((basic.price / 100).toString());
        setBasicLicenseId(basic.id);
      }
      const exclusive = licenses?.find((l: any) => l.type === 'exclusive');
      if (exclusive) {
        setPriceExclusive((exclusive.price / 100).toString());
        setExclusiveLicenseId(exclusive.id);
      }
    } catch (err) {
      console.error('Fetch beat error:', err);
      Alert.alert('Error', 'Failed to load beat data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIReAnalyze = async () => {
    if (!beat?.audio_url || beat.audio_url === 'pending') {
      Alert.alert('Error', 'No audio URL available for this beat.');
      return;
    }

    const result = await analyzeWithUI({
      audioUri: beat.audio_url,
      mimeType: 'audio/wav',
      generateArtwork: true,
      forceNewArtwork: true,
      currentArtworkPreview: null, // Force new generation on re-analyze
    });

    if (result) {
      if (result.title) setTitle(result.title);
      if (result.primary_genre) setGenre(result.primary_genre);
      if (result.bpm) setBpm(result.bpm.toString());
      if (result.key) setKey(result.key);
      if (result.mood_tags) setTags(result.mood_tags.join(', '));
      if (result.description) setDescription(result.description);
      if (result.artworkUrl) setArtworkPreview(result.artworkUrl);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        title,
        genre,
        bpm: parseInt(bpm) || null,
        key,
        description,
        mood_tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        status
      };

      const { error } = await supabase
        .from('beats')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update Licenses
      if (basicLicenseId) {
        await supabase.from('licenses').update({ price: Math.round(parseFloat(priceBasic) * 100) }).eq('id', basicLicenseId);
      }
      if (exclusiveLicenseId) {
        await supabase.from('licenses').update({ price: Math.round(parseFloat(priceExclusive) * 100) }).eq('id', exclusiveLicenseId);
      }

      // Update local store
      updateBeat(id as string, {
        ...updates,
        bpm: parseInt(bpm) || 0,
        moods: updates.mood_tags
      } as any);

      router.back();
    } catch (err: any) {
      console.error('Save error:', err);
      Alert.alert('Error', err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  if (!beat && loading) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-950">
        <ActivityIndicator color="#005CB9" size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 px-4 py-8">
      {/* Header */}
      <View className="mb-8">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <ChevronLeft size={20} color="#6B7280" />
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Back to Catalog</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white mb-2">Edit Beat</Text>
        <Text className="text-gray-400">Update metadata and availability for "{beat?.title}"</Text>
      </View>

      <View className="space-y-8">
        <Card className="p-6 bg-dark-900 border-white/5 space-y-6">
           {/* AI Re-Analyze Button */}
           <Button
             onPress={handleAIReAnalyze}
             disabled={isAnalyzing || !beat?.audio_url}
             className="w-full py-4 bg-purple-600/20 border border-purple-500/30 rounded-2xl mb-2"
           >
             {isAnalyzing ? (
               <View className="flex-row items-center gap-2">
                 <ActivityIndicator color="#A855F7" size="small" />
                 <Text className="text-purple-400 font-bold uppercase tracking-widest text-xs">Re-Analyzing Audio...</Text>
               </View>
             ) : (
               <View className="flex-row items-center gap-2">
                 <Sparkles size={16} color="#A855F7" />
                 <Text className="text-purple-400 font-bold uppercase tracking-widest text-xs">✨ Re-Analyze with AI</Text>
               </View>
             )}
           </Button>

           <View className="flex-row items-center gap-6 mb-4">
              <View className="w-24 h-24 rounded-xl bg-dark-800 border border-white/10 overflow-hidden">
                {beat?.artwork_url ? (
                  <Image source={{ uri: beat.artwork_url }} className="w-full h-full object-cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Text className="text-gray-600 text-[10px] font-bold uppercase">No Artwork</Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                  <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Status</Text>
                 <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => setStatus('published')}
                      className={`px-3 py-1.5 rounded-lg border ${status === 'published' ? 'bg-primary/10 border-primary' : 'bg-transparent border-white/10'}`}
                    >
                      <Text className={`text-[10px] font-bold uppercase ${status === 'published' ? 'text-primary' : 'text-gray-400'}`}>Published</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setStatus('unpublished')}
                      className={`px-3 py-1.5 rounded-lg border ${status === 'unpublished' ? 'bg-white/5 border-white/30' : 'bg-transparent border-white/10'}`}
                    >
                      <Text className={`text-[10px] font-bold uppercase ${status === 'unpublished' ? 'text-white' : 'text-gray-400'}`}>Unpublished</Text>
                    </TouchableOpacity>
                 </View>
              </View>
           </View>

           <Input 
              label="Beat Title" 
              value={title} 
              onChangeText={setTitle} 
              placeholder="Beat Title" 
           />
           
           <View className="flex-row gap-4">
              <View className="flex-1">
                <Input 
                  label="Genre" 
                  value={genre} 
                  onChangeText={setGenre} 
                  placeholder="Genre" 
                />
              </View>
              <View className="flex-1">
                <Input 
                  label="BPM" 
                  value={bpm} 
                  onChangeText={setBpm} 
                  keyboardType="numeric" 
                  placeholder="140" 
                />
              </View>
           </View>

           <View className="flex-row gap-4">
              <View className="flex-1">
                <Input 
                  label="Basic Price ($)" 
                  value={priceBasic} 
                  onChangeText={setPriceBasic} 
                  keyboardType="decimal-pad" 
                  placeholder="29.99" 
                />
              </View>
              <View className="flex-1">
                <Input 
                  label="Exclusive Price ($)" 
                  value={priceExclusive} 
                  onChangeText={setPriceExclusive} 
                  keyboardType="decimal-pad" 
                  placeholder="499.99" 
                />
              </View>
           </View>

           <Input 
              label="Key" 
              value={key} 
              onChangeText={setKey} 
              placeholder="e.g. C Minor" 
           />

           <Input 
              label="Mood Tags" 
              value={tags} 
              onChangeText={setTags} 
              placeholder="Dark, Aggressive, Fast" 
           />

           <Input 
              label="Description" 
              value={description} 
              onChangeText={setDescription} 
              multiline 
              numberOfLines={4}
              placeholder="Description" 
           />
        </Card>

        <Button 
          onPress={handleSave} 
          disabled={loading}
          className="bg-primary w-full py-4"
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View className="flex-row items-center gap-2">
               <Save size={18} color="#000" />
               <Text className="text-black font-black uppercase tracking-widest">Save Changes</Text>
            </View>
          )}
        </Button>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
