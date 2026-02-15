import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Layers,
  User as UserIcon,
  Search
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { uploadToR2, getBeatFilePaths } from '@/lib/r2';
import { Picker } from '@react-native-picker/picker';

const MUSICAL_KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor',
  'D Major', 'D Minor', 'D# Major', 'D# Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor', 'F# Major', 'F# Minor',
  'G Major', 'G Minor', 'G# Major', 'G# Minor',
  'A Major', 'A Minor', 'A# Major', 'A# Minor',
  'B Major', 'B Minor'
];

const FALLBACK_GENRES = ['Trap', 'Drill', 'Hip Hop', 'R&B', 'Pop', 'Afrobeats', 'Reggaeton', 'Lo-fi', 'Cinematic', 'Soul'];

export default function AdminBeatUploadPage() {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  
  // Producer State
  const [producers, setProducers] = useState<any[]>([]);
  const [selectedProducerId, setSelectedProducerId] = useState('');
  const [loadingProducers, setLoadingProducers] = useState(true);

  // File States
  const [audioFile, setAudioFile] = useState<any>(null);
  const [artworkFile, setArtworkFile] = useState<any>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  // Metadata States
  const [title, setTitle] = useState('');
  const [primaryGenre, setPrimaryGenre] = useState('');
  const [secondaryGenre, setSecondaryGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [showCustomGenre, setShowCustomGenre] = useState(false);
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [priceBasic, setPriceBasic] = useState('49.99');
  const [priceExclusive, setPriceExclusive] = useState('899.99');

  useEffect(() => {
    fetchProducers();
    fetchGenres();
  }, []);

  async function fetchGenres() {
    try {
      const { data, error } = await supabase
        .from('genre_settings')
        .select('name')
        .eq('status', 'approved')
        .order('name');
      
      if (error) throw error;
      const genreNames = data.map(g => g.name);
      setAvailableGenres(genreNames.length > 0 ? genreNames : FALLBACK_GENRES);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setAvailableGenres(FALLBACK_GENRES);
    }
  }

  async function fetchProducers() {
    setLoadingProducers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('role', ['producer', 'artist', 'admin'])
        .order('display_name');

      if (error) throw error;
      setProducers(data || []);
    } catch (err: any) {
      console.error('Error fetching producers:', err);
    } finally {
      setLoadingProducers(false);
    }
  }

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/mpeg', 'audio/x-wav'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setAudioFile(result.assets[0]);
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

  const handleSubmit = async () => {
    if (!audioFile || !title || !selectedProducerId) {
      Alert.alert('Missing Info', 'Please provide a producer, title, and an audio file.');
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare UUID for R2 consistency
      const tempBeatId = crypto.randomUUID();
      const paths = getBeatFilePaths(tempBeatId);
      
      // 2. Upload Audio
      const response = await fetch(audioFile.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const audioUrl = await uploadToR2(paths.original, new Uint8Array(arrayBuffer) as any, audioFile.mimeType || 'audio/wav');

      // 3. Upload Artwork if present
      let artworkUrl = null;
      if (artworkFile) {
        const artResponse = await fetch(artworkFile.uri);
        const artBlob = await artResponse.blob();
        const artBuffer = await new Response(artBlob).arrayBuffer();
        artworkUrl = await uploadToR2(paths.artwork, new Uint8Array(artBuffer) as any, artworkFile.mimeType || 'image/jpeg');
      }

      // 4. Prepare Beat Data
      const beatData = {
        title,
        producer_id: selectedProducerId,
        genre: primaryGenre || 'Unknown',
        genres: [primaryGenre, secondaryGenre].filter(Boolean),
        bpm: parseInt(bpm) || null,
        key,
        description,
        mood_tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        audio_url: audioUrl,
        preview_url: audioUrl,
        artwork_url: artworkUrl,
        status: 'published'
      };

      // 4.1 Add Genre if new (Directly as Approved for Admin)
      if (customGenre && !availableGenres.includes(customGenre)) {
        await supabase
          .from('genre_settings')
          .insert({
            name: customGenre,
            status: 'approved',
            created_by: profile.id
          });
      }

      // 5. Call Edge Function to Save (Admin Bypass)
      const { error: saveError } = await supabase.functions.invoke('create-beat-as-admin', {
        body: {
          action: 'create',
          beatId: tempBeatId,
          beatData
        }
      });

      if (saveError) throw saveError;

      // 6. Create Licenses
      await supabase.from('licenses').insert([
        { 
          beat_id: tempBeatId, 
          type: 'basic', 
          price: Math.round(parseFloat(priceBasic) * 100),
          is_active: true,
          files_included: ['MP3']
        },
        { 
          beat_id: tempBeatId, 
          type: 'exclusive', 
          price: Math.round(parseFloat(priceExclusive) * 100),
          is_active: true,
          files_included: ['WAV', 'Stems']
        }
      ]);

      // 7. Trigger AI Analysis
      supabase.functions.invoke('analyze-audio', {
        body: { beat_id: tempBeatId }
      }).catch(err => console.error('AI Analysis Trigger Failed:', err));

      setStep(4); // Success step (different indexing for admin due to producer selection)
    } catch (err: any) {
      console.error('Upload failed:', err);
      Alert.alert('Upload Error', err.message || 'Failed to upload beat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 px-4 py-8">
      {/* Cinematic Header */}
      <View className="mb-10 relative overflow-hidden rounded-[40px] p-8 border border-white/5">
        <View className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5" />
        <View className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" />
        
        <View className="relative z-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-6"
          >
            <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
              <ChevronLeft size={18} color="#9CA3AF" />
            </View>
            <Text className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Back to Library</Text>
          </TouchableOpacity>
          
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-5xl font-black text-white mb-2 italic tracking-tighter uppercase">Admin <Text className="text-secondary italic">Upload</Text></Text>
              <Text className="text-gray-500 font-medium text-sm max-w-md">Executive deployment of high-fidelity assets on behalf of platform producers.</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/dashboard/admin/bulk-upload')}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex-row items-center gap-3 backdrop-blur-md"
            >
              <Layers size={18} color="#005CB9" />
              <Text className="text-gray-300 font-black text-[10px] uppercase tracking-[0.2em]">Switch <Text className="text-secondary">Bulk</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modern Progress Stepper */}
      <View className="flex-row gap-4 mb-12 px-2">
        {[1, 2, 3, 4].map((s) => (
          <View key={s} className="flex-1">
            <View className={`h-1.5 rounded-full ${step >= s ? 'bg-secondary' : 'bg-white/5'} ${step === s ? 'shadow-[0_0_15px_rgba(0,92,185,0.6)]' : ''}`} />
            <Text className={`text-[9px] font-black uppercase tracking-widest mt-2 ${step >= s ? 'text-secondary' : 'text-gray-600'}`}>
              Step 0{s} {s === 1 ? 'Owner' : s === 2 ? 'Audio' : s === 3 ? 'Details' : 'Live'}
            </Text>
          </View>
        ))}
      </View>

      {step === 1 && (
        <View className="space-y-8">
           <View className="p-10 rounded-[40px] bg-dark-900/40 border border-white/10">
              <View className="flex-row items-center gap-3 mb-8">
                 <UserIcon size={24} color="#005CB9" />
                 <Text className="text-white font-black text-2xl uppercase italic tracking-tighter">Assign <Text className="text-secondary">Producer</Text></Text>
              </View>
              
              {loadingProducers ? (
                 <ActivityIndicator color="#005CB9" size="large" className="py-10" />
              ) : (
                <View className="space-y-6">
                  <View className="bg-dark-950 border border-white/5 rounded-3xl overflow-hidden">
                    <Picker
                      selectedValue={selectedProducerId}
                      onValueChange={(v) => setSelectedProducerId(v)}
                      dropdownIconColor="#fff"
                      style={{ 
                        color: '#fff', 
                        height: 60,
                        backgroundColor: '#0a0a0a',
                      }}
                    >
                      <Picker.Item label="SEARCH & SELECT PRODUCER..." value="" color="#6B7280" />
                      {producers.map(p => (
                        <Picker.Item key={p.id} label={p.display_name?.toUpperCase()} value={p.id} color="#fff" />
                      ))}
                    </Picker>
                  </View>
                  
                  {selectedProducerId && (
                    <View className="flex-row items-center gap-4 p-6 bg-secondary/5 rounded-[30px] border border-secondary/10">
                        <View className="w-12 h-12 rounded-full bg-secondary/20 items-center justify-center">
                           <CheckCircle2 size={24} color="#005CB9" />
                        </View>
                        <View>
                          <Text className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Selected Account</Text>
                          <Text className="text-white font-bold text-lg">{producers.find(p => p.id === selectedProducerId)?.display_name}</Text>
                        </View>
                    </View>
                  )}
                </View>
              )}
           </View>

           <Button 
            onPress={() => setStep(2)} 
            disabled={!selectedProducerId}
            className="w-full py-6 bg-secondary rounded-[30px] shadow-[0_0_30px_rgba(0,92,185,0.4)]"
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-black font-black uppercase tracking-[0.2em] text-lg italic">Continue to Assets</Text>
              <Sparkles size={24} color="#000" />
            </View>
          </Button>
        </View>
      )}

      {step === 2 && (
        <View className="space-y-8">
          <TouchableOpacity 
            onPress={pickAudio}
            activeOpacity={0.7}
            className={`p-10 rounded-[40px] border-2 border-dashed items-center justify-center bg-dark-900/40 relative overflow-hidden ${audioFile ? 'border-secondary' : 'border-white/10'}`}
          >
            {audioFile && <View className="absolute inset-0 bg-secondary/5" />}
            
            <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${audioFile ? 'bg-secondary' : 'bg-white/5'}`}>
              <Music size={36} color={audioFile ? '#000' : '#4B5563'} strokeWidth={3} />
            </View>
            
            <Text className="text-white font-black text-2xl uppercase italic tracking-tighter text-center">
              {audioFile ? audioFile.name : (
                <>SELECT <Text className="text-secondary">MASTER</Text> TRACK</>
              )}
            </Text>
            
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-3 text-center">
              {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB • WAV Detected` : 'WAV • 44.1kHz • 24-Bit Recommended'}
            </Text>

            {audioFile && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  setAudioFile(null);
                }}
                className="mt-6 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full"
              >
                <Text className="text-red-500 text-[10px] font-black uppercase tracking-widest">Remove File</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View className="flex-col lg:flex-row gap-8">
             <TouchableOpacity 
              onPress={pickArtwork}
              activeOpacity={0.7}
              className="w-full lg:w-64 aspect-square rounded-[40px] bg-dark-900/50 border border-white/10 overflow-hidden items-center justify-center relative"
             >
                {artworkPreview ? (
                  <Image source={{ uri: artworkPreview }} className="w-full h-full object-cover" />
                ) : (
                  <View className="items-center">
                    <View className="w-16 h-16 rounded-3xl bg-white/5 items-center justify-center mb-4">
                      <ImageIcon size={28} color="#4B5563" />
                    </View>
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Cover Artwork</Text>
                  </View>
                )}
             </TouchableOpacity>

             <View className="flex-1 space-y-8">
                <View>
                  <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Core Metadata</Text>
                  <Input 
                    placeholder="ENTER PRODUCTION TITLE..." 
                    value={title} 
                    onChangeText={setTitle} 
                    className="h-16 bg-dark-900 border-none font-black text-xl italic uppercase tracking-tighter"
                  />
                </View>

                <View>
                  <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">Select Primary DNA <Text className="text-secondary">(Genre 1)</Text></Text>
                  <View className="flex-row flex-wrap gap-2 mb-8">
                    {availableGenres.map((g) => (
                      <TouchableOpacity
                        key={`primary-${g}`}
                        onPress={() => setPrimaryGenre(g)}
                        className={`px-5 py-2.5 rounded-xl border transition-all ${
                          primaryGenre === g 
                            ? 'bg-secondary border-secondary shadow-[0_0_15px_rgba(0,102,204,0.4)]' 
                            : 'bg-dark-900/80 border-white/5'
                        }`}
                      >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${primaryGenre === g ? 'text-black' : 'text-gray-400'}`}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">Select Secondary DNA <Text className="text-gray-400">(Genre 2)</Text></Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {availableGenres.map((g) => {
                      const isPrimary = primaryGenre === g;
                      return (
                        <TouchableOpacity
                          key={`secondary-${g}`}
                          onPress={() => !isPrimary && setSecondaryGenre(g)}
                          disabled={isPrimary}
                          className={`px-5 py-2.5 rounded-xl border transition-all ${
                            secondaryGenre === g 
                              ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                              : isPrimary ? 'bg-dark-950/50 border-white/5 opacity-30' : 'bg-dark-900/80 border-white/5'
                          }`}
                        >
                          <Text className={`text-[10px] font-black uppercase tracking-widest ${secondaryGenre === g ? 'text-black' : 'text-gray-400'}`}>
                            {g}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      onPress={() => setShowCustomGenre(true)}
                      className={`px-5 py-2.5 rounded-xl border ${
                        showCustomGenre 
                          ? 'bg-secondary border-secondary shadow-[0_0_15px_rgba(0,102,204,0.4)]' 
                          : 'bg-dark-900/80 border-white/5'
                      }`}
                    >
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${showCustomGenre ? 'text-black' : 'text-gray-400'}`}>
                        Propose +
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {showCustomGenre && (
                    <View className="gap-3">
                      <Input 
                        placeholder="ADD NEW GENRE..." 
                        value={customGenre} 
                        onChangeText={setCustomGenre}
                        className="bg-dark-900 border-none font-bold uppercase tracking-widest italic"
                      />
                      <Text className="text-[10px] text-gray-500 italic px-2">Administrators can add genres directly as approved tags.</Text>
                    </View>
                  )}
                </View>
             </View>
          </View>

          <Button 
            onPress={() => setStep(3)} 
            disabled={!audioFile || !title}
            className="w-full py-6 bg-secondary rounded-[30px] shadow-[0_0_30px_rgba(0,92,185,0.4)]"
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-black font-black uppercase tracking-[0.2em] text-lg italic">Continue to Metadata</Text>
              <Sparkles size={24} color="#000" />
            </View>
          </Button>
        </View>
      )}

      {step === 3 && (
        <View className="space-y-8">
          <View className="relative p-10 bg-dark-900/60 rounded-[40px] border border-white/5 overflow-hidden">
             <View className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
             
             <View className="space-y-10 relative z-10">
               <View className="flex-col md:flex-row gap-8">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Tempo (BPM)</Text>
                    <Input 
                      value={bpm} 
                      onChangeText={setBpm} 
                      keyboardType="numeric" 
                      placeholder="140"
                      className="bg-dark-900/80 border-none h-14 font-black text-xl italic"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">Musical Key</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {MUSICAL_KEYS.map((k) => {
                        const isSelected = key === k;
                        return (
                          <TouchableOpacity
                            key={k}
                            onPress={() => setKey(k)}
                            className={`px-4 py-2 rounded-xl border transition-all ${
                              isSelected 
                                ? 'bg-secondary border-secondary shadow-[0_0_15px_rgba(0,102,204,0.4)]' 
                                : 'bg-dark-900/80 border-white/5'
                            }`}
                          >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                              {k}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
               </View>

               <View className="flex-col md:flex-row gap-8">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">Basic License ($)</Text>
                    <Input 
                      value={priceBasic} 
                      onChangeText={setPriceBasic} 
                      keyboardType="decimal-pad" 
                      placeholder="29.99"
                      className="bg-dark-900/80 border-none h-14 font-black text-xl italic"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">Exclusive ($)</Text>
                    <Input 
                      value={priceExclusive} 
                      onChangeText={setPriceExclusive} 
                      keyboardType="decimal-pad" 
                      placeholder="499.99"
                      className="bg-dark-900/80 border-none h-14 font-black text-xl italic"
                    />
                  </View>
               </View>

               <View>
                 <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Mood Analysis (Tags)</Text>
                 <Input 
                    value={tags} 
                    onChangeText={setTags} 
                    placeholder="DARK, AGGRESSIVE, DRILL (COMMA SEPARATED)"
                    className="bg-dark-900/80 border-none h-14 font-bold tracking-widest uppercase italic"
                 />
               </View>

               <View>
                 <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Project Narrative (Description)</Text>
                 <Input 
                    value={description} 
                    onChangeText={setDescription} 
                    multiline 
                    numberOfLines={4}
                    placeholder="Tell users more about this production..."
                    className="bg-dark-900/80 border-none p-6 rounded-[30px] font-medium text-gray-300"
                 />
               </View>
             </View>
          </View>

          <View className="flex-row gap-6">
            <Button 
              variant="outline" 
              onPress={() => setStep(2)} 
              disabled={loading}
              className="flex-1 py-5 rounded-[25px] border-white/10"
            >
              <Text className="text-gray-400 font-black uppercase tracking-[0.2em] italic">Go Back</Text>
            </Button>
            <Button 
              onPress={handleSubmit} 
              disabled={loading}
              className="flex-[2] py-5 bg-secondary rounded-[25px] shadow-[0_0_30px_rgba(0,92,185,0.4)]"
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <View className="flex-row items-center gap-3">
                   <Upload size={20} color="#000" strokeWidth={3} />
                   <Text className="text-black font-black uppercase tracking-[0.2em] italic text-lg">Finalize & Publish</Text>
                </View>
              )}
            </Button>
          </View>
        </View>
      )}

      {step === 4 && (
        <View className="items-center py-16 px-4">
            <View className="w-40 h-40 rounded-[60px] bg-secondary/10 items-center justify-center mb-10 shadow-[0_0_50px_rgba(0,92,185,0.2)]">
                <View className="w-24 h-24 rounded-[40px] bg-secondary items-center justify-center">
                   <CheckCircle2 size={56} color="#000" strokeWidth={3} />
                </View>
            </View>
            <Text className="text-5xl font-black text-white mb-4 italic tracking-tighter uppercase text-center">Beat <Text className="text-secondary italic">Deployed</Text></Text>
            <Text className="text-gray-400 text-center font-medium italic mb-10 text-lg leading-7">
              Executive deployment successful. <Text className="text-white font-bold">"{title}"</Text> is now live for <Text className="text-secondary font-bold">{producers.find(p => p.id === selectedProducerId)?.display_name}</Text>.
            </Text>
            <Button 
              onPress={() => router.push('/dashboard/admin/beats')}
              className="w-full bg-secondary py-6 rounded-[30px] shadow-[0_0_30px_rgba(0,92,185,0.4)]"
            >
              <Text className="text-black font-black uppercase tracking-[0.2em] text-lg italic">Back to Library</Text>
            </Button>
        </View>
      )}

      <View className="h-20" />
    </ScrollView>
  );
}
