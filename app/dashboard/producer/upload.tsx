import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Upload, 
  X, 
  Music, 
  Image as ImageIcon, 
  Sparkles, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCatalogStore } from '@/stores/catalog';
import { uploadToR2, getBeatFilePaths } from '@/lib/r2';

export default function BeatUploadPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { addBeat } = useCatalogStore();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // File States
  const [audioFile, setAudioFile] = useState<any>(null);
  const [artworkFile, setArtworkFile] = useState<any>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  // Metadata States
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [priceBasic, setPriceBasic] = useState('29.99');
  const [priceExclusive, setPriceExclusive] = useState('499.99');

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/mpeg', 'audio/x-wav'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setAudioFile(result.assets[0]);
        // Auto-set title from filename if empty
        if (!title) {
          const fileName = result.assets[0].name.replace(/\.[^/.]+$/, "");
          setTitle(fileName);
        }
      }
    } catch (err) {
      console.error('Pick audio error:', err);
    }
  };

  const pickArtwork = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setArtworkFile(result.assets[0]);
        setArtworkPreview(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Pick artwork error:', err);
    }
  };

  const handleAIAnalysis = async (beatId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-audio', {
        body: { beat_id: beatId }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('AI Analysis Error:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!audioFile || !title) {
      Alert.alert('Missing Info', 'Please provide at least a title and an audio file.');
      return;
    }

    setLoading(true);
    try {
      if (!profile?.id) throw new Error('Not authenticated');

      // 1. Create Beat in DB first to get UUID
      const { data: beat, error: beatError } = await supabase
        .from('beats')
        .insert({
          producer_id: profile.id,
          title,
          genre,
          bpm: parseInt(bpm) || null,
          key,
          description,
          mood_tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          status: 'draft',
          // Temporary placeholder for audio/artwork to be updated after upload
          audio_url: 'pending',
          preview_url: 'pending'
        })
        .select()
        .single();

      if (beatError) throw beatError;

      // 2. Prepare R2 Paths
      const paths = getBeatFilePaths(beat.id);
      
      // 3. Upload Audio
      // We need to convert URI to something uploadable
      const response = await fetch(audioFile.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const audioUrl = await uploadToR2(paths.original, uint8Array as any, audioFile.mimeType || 'audio/wav');

      // 4. Upload Artwork if present
      let artworkUrl = null;
      if (artworkFile) {
        const artResponse = await fetch(artworkFile.uri);
        const artBlob = await artResponse.blob();
        const artBuffer = await new Response(artBlob).arrayBuffer();
        artworkUrl = await uploadToR2(paths.artwork, new Uint8Array(artBuffer) as any, artworkFile.mimeType || 'image/jpeg');
      }

      // 5. Update Beat with real URLs
      const { error: updateError } = await supabase
        .from('beats')
        .update({
          audio_url: audioUrl,
          preview_url: audioUrl, // placeholder for preview
          artwork_url: artworkUrl,
          status: 'published'
        })
        .eq('id', beat.id);

      if (updateError) throw updateError;

      // 5.5 Create Licenses
      const { error: licenseError } = await supabase
        .from('licenses')
        .insert([
          { 
            beat_id: beat.id, 
            type: 'basic', 
            price: Math.round(parseFloat(priceBasic) * 100),
            is_active: true,
            files_included: ['MP3']
          },
          { 
            beat_id: beat.id, 
            type: 'exclusive', 
            price: Math.round(parseFloat(priceExclusive) * 100),
            is_active: true,
            files_included: ['WAV', 'Stems']
          }
        ]);
      
      if (licenseError) throw licenseError;

      // 6. Trigger AI Analysis (async, don't block UI too long)
      handleAIAnalysis(beat.id);

      // 7. Update Store & Navigate
      addBeat({
        id: beat.id,
        title,
        genre: genre || 'Unknown',
        bpm: parseInt(bpm) || 0,
        plays: 0,
        sales: 0,
        earnings: '$0',
        status: 'published',
        artwork_url: artworkUrl || undefined
      });

      setStep(3); // Success step
    } catch (err: any) {
      console.error('Upload failed:', err);
      Alert.alert('Upload Error', err.message || 'Failed to upload beat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Text className="text-3xl font-bold text-white mb-2">Upload New Beat</Text>
        <Text className="text-gray-400">Release your next hit to the marketplace</Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <View 
            key={s} 
            className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-white/10'}`} 
          />
        ))}
      </View>

      {step === 1 && (
        <View className="space-y-6">
          <Card className="p-8 bg-dark-900 border-dashed border-white/10 items-center justify-center">
            <TouchableOpacity 
              onPress={pickAudio}
              className="items-center justify-center w-full"
            >
              <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${audioFile ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Music size={32} color={audioFile ? '#005CB9' : '#374151'} />
              </View>
              <Text className="text-white font-bold text-lg">
                {audioFile ? audioFile.name : 'Select Audio File'}
              </Text>
              <Text className="text-gray-500 text-sm mt-2">
                {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB • WAV or MP3` : 'Highest quality WAV preferred'}
              </Text>
              {audioFile && (
                <TouchableOpacity 
                  onPress={() => setAudioFile(null)}
                  className="mt-4 px-4 py-2 bg-red-500/10 rounded-lg"
                >
                  <Text className="text-red-500 text-xs font-bold uppercase">Remove File</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </Card>

          <View className="flex-row items-center gap-4">
             <TouchableOpacity 
              onPress={pickArtwork}
              className="w-32 h-32 rounded-2xl bg-dark-900 border border-white/10 overflow-hidden items-center justify-center"
             >
                {artworkPreview ? (
                  <Image source={{ uri: artworkPreview }} className="w-full h-full object-cover" />
                ) : (
                  <View className="items-center">
                    <ImageIcon size={24} color="#374151" />
                    <Text className="text-[10px] text-gray-500 font-bold uppercase mt-2">Artwork</Text>
                  </View>
                )}
             </TouchableOpacity>
             <View className="flex-1 space-y-4">
                <Input 
                  label="Beat Title" 
                  value={title} 
                  onChangeText={setTitle} 
                  placeholder="e.g. Moonlight Sonata" 
                />
                <Input 
                  label="Genre" 
                  value={genre} 
                  onChangeText={setGenre} 
                  placeholder="e.g. Trap, Lo-fi" 
                />
             </View>
          </View>

          <Button 
            onPress={() => setStep(2)} 
            disabled={!audioFile || !title}
            className="w-full py-4 bg-primary"
          >
            <Text className="text-black font-black uppercase tracking-widest text-base">Next: Metadata</Text>
          </Button>
        </View>
      )}

      {step === 2 && (
        <View className="space-y-6">
          <Card className="p-6 bg-dark-900 border-white/5 space-y-6">
             <View className="flex-row gap-4">
                <View className="flex-1">
                  <Input 
                    label="BPM" 
                    value={bpm} 
                    onChangeText={setBpm} 
                    keyboardType="numeric" 
                    placeholder="140" 
                  />
                </View>
                <View className="flex-1">
                  <Input 
                    label="Key" 
                    value={key} 
                    onChangeText={setKey} 
                    placeholder="C Minor" 
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
                label="Mood Tags" 
                value={tags} 
                onChangeText={setTags} 
                placeholder="Dark, Aggressive, Fast (comma separated)" 
             />
             <Input 
                label="Description" 
                value={description} 
                onChangeText={setDescription} 
                multiline 
                numberOfLines={4}
                placeholder="Tell users more about this track..." 
             />
          </Card>

          <View className="flex-row gap-4">
            <Button 
              variant="outline" 
              onPress={() => setStep(1)} 
              disabled={loading}
              className="flex-1"
            >
              <Text className="text-white font-bold uppercase tracking-widest">Back</Text>
            </Button>
            <Button 
              onPress={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-primary"
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <View className="flex-row items-center gap-2">
                   <Sparkles size={18} color="#000" />
                   <Text className="text-black font-black uppercase tracking-widest">Publish Track</Text>
                </View>
              )}
            </Button>
          </View>
        </View>
      )}

      {step === 3 && (
        <View className="items-center py-12">
            <View className="w-24 h-24 rounded-full bg-green-500/20 items-center justify-center mb-6">
                <CheckCircle2 size={48} color="#22C55E" />
            </View>
            <Text className="text-2xl font-bold text-white mb-2">Beat Published!</Text>
            <Text className="text-gray-400 text-center px-8 mb-8">
              Your beat "{title}" is now live on the marketplace. AI is currently analyzing the track to generate granular engagement data.
            </Text>
            <Button 
              onPress={() => router.push('/dashboard/producer/beats')}
              className="w-full bg-primary py-4"
            >
              <Text className="text-black font-black uppercase tracking-widest">Return to Catalog</Text>
            </Button>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
}
