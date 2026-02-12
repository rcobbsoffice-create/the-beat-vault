import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Upload, 
  X, 
  Music, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  Plus,
  Trash2,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCatalogStore } from '@/stores/catalog';
import { uploadToR2, getBeatFilePaths } from '@/lib/r2';

interface BulkBeatItem {
  id: string;
  file: any;
  title: string;
  genres: string[];
  bpm: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const POPULAR_GENRES = [
  'Trap', 'Drill', 'Hip Hop', 'R&B', 'Pop', 'Afrobeats', 
  'Reggaeton', 'Lo-fi', 'Rock', 'EDM', 'Country', 
  'Cinematic', 'Jazz', 'Soul', 'Funk'
];

export default function BulkUploadPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { addBeat } = useCatalogStore();
  
  const [beats, setBeats] = useState<BulkBeatItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalPriceBasic, setGlobalPriceBasic] = useState('29.99');
  const [globalPriceExclusive, setGlobalPriceExclusive] = useState('499.99');

  const pickBeats = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/mpeg', 'audio/x-wav'],
        copyToCacheDirectory: true,
        multiple: true
      });

      if (!result.canceled) {
        const newBeats = result.assets.map(asset => ({
          id: Math.random().toString(36).substr(2, 9),
          file: asset,
          title: asset.name.replace(/\.[^/.]+$/, ""),
          genres: ['Trap'],
          bpm: '140',
          status: 'pending' as const,
          progress: 0
        }));
        setBeats(prev => [...prev, ...newBeats]);
      }
    } catch (err) {
      console.error('Pick beats error:', err);
      Alert.alert('Error', 'Failed to pick files.');
    }
  };

  const removeBeat = (id: string) => {
    setBeats(prev => prev.filter(b => b.id !== id));
  };

  const updateBeat = (id: string, updates: Partial<BulkBeatItem>) => {
    setBeats(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const processUpload = async () => {
    if (beats.length === 0) return;
    if (!profile?.id) {
       Alert.alert('Error', 'Not authenticated');
       return;
    }

    setIsUploading(true);
    
    for (const beatItem of beats) {
      if (beatItem.status === 'completed') continue;

      updateBeat(beatItem.id, { status: 'uploading' });

      try {
        // 1. Create Beat in DB
        const { data: beat, error: beatError } = await supabase
          .from('beats')
          .insert({
            producer_id: profile.id,
            title: beatItem.title,
            genre: beatItem.genres[0] || 'Hip Hop',
            genres: beatItem.genres,
            bpm: parseInt(beatItem.bpm) || null,
            status: 'draft',
            audio_url: 'pending',
            preview_url: 'pending'
          })
          .select()
          .single();

        if (beatError) throw beatError;

        // 2. Upload to R2
        const paths = getBeatFilePaths(beat.id);
        const response = await fetch(beatItem.file.uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        
        const audioUrl = await uploadToR2(paths.original, new Uint8Array(arrayBuffer) as any, beatItem.file.mimeType || 'audio/wav');

        // 3. Update Beat
        const { error: updateError } = await supabase
          .from('beats')
          .update({
            audio_url: audioUrl,
            preview_url: audioUrl,
            status: 'published'
          })
          .eq('id', beat.id);

        if (updateError) throw updateError;

        // 4. Create Licenses
        await supabase.from('licenses').insert([
          { 
            beat_id: beat.id, 
            type: 'basic', 
            price: Math.round(parseFloat(globalPriceBasic) * 100),
            is_active: true,
            files_included: ['MP3']
          },
          { 
            beat_id: beat.id, 
            type: 'exclusive', 
            price: Math.round(parseFloat(globalPriceExclusive) * 100),
            is_active: true,
            files_included: ['WAV', 'Stems']
          }
        ]);

        // 5. Trigger AI Analysis
        supabase.functions.invoke('analyze-audio', {
          body: { beat_id: beat.id }
        }).catch(err => console.error('AI Analysis Trigger Failed:', err));

        // 6. Update local store
        addBeat({
          id: beat.id,
          title: beatItem.title,
          genre: beatItem.genres[0] || 'Hip Hop',
          genres: beatItem.genres,
          bpm: parseInt(beatItem.bpm) || 0,
          plays: 0,
          sales: 0,
          earnings: '$0',
          status: 'published',
          audio_url: audioUrl,
          preview_url: audioUrl
        });

        updateBeat(beatItem.id, { status: 'completed', progress: 100 });
      } catch (err: any) {
        console.error(`Upload failed for ${beatItem.title}:`, err);
        updateBeat(beatItem.id, { status: 'error', error: err.message });
      }
    }
    
    setIsUploading(false);
    Alert.alert('Success', 'Batch processing completed!');
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-dark-950 px-4 py-8">
      <View className="mb-8">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <ChevronLeft size={20} color="#64748b" />
          <Text className="text-slate-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">Back to Catalog</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bulk Upload</Text>
        <Text className="text-slate-500 dark:text-gray-400">Upload multiple tracks and manage metadata in one go</Text>
      </View>

      {/* Global Settings */}
      <Card className="p-6 mb-8 bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-white/5">
        <Text className="text-slate-900 dark:text-white font-bold mb-4 flex-row items-center gap-2">
          <SlidersHorizontal size={18} color="#0066cc" />
          Batch Pricing Settings
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input 
              label="Default Basic Price ($)" 
              value={globalPriceBasic} 
              onChangeText={setGlobalPriceBasic} 
              keyboardType="decimal-pad" 
            />
          </View>
          <View className="flex-1">
            <Input 
              label="Default Exclusive Price ($)" 
              value={globalPriceExclusive} 
              onChangeText={setGlobalPriceExclusive} 
              keyboardType="decimal-pad" 
            />
          </View>
        </View>
      </Card>

      {/* Upload Queue */}
      <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Upload Queue ({beats.length})</Text>
          <Button variant="outline" size="sm" onPress={pickBeats} disabled={isUploading}>
            <Plus size={16} color="#0066cc" className="mr-2" />
            Add More Files
          </Button>
        </View>

        {beats.length === 0 ? (
          <TouchableOpacity 
            onPress={pickBeats}
            className="p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl items-center justify-center bg-slate-50 dark:bg-dark-900/50"
          >
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Upload size={32} color="#0066cc" />
            </View>
            <Text className="text-slate-900 dark:text-white font-bold text-lg mb-2">Select Multiple Audio Files</Text>
            <Text className="text-slate-500 dark:text-gray-400 text-center">WAV or MP3 formats supported</Text>
          </TouchableOpacity>
        ) : (
          <View className="gap-4">
            {beats.map((item) => (
              <Card key={item.id} className="p-4 bg-white dark:bg-dark-900 border-slate-200 dark:border-white/5">
                <View className="flex-row gap-4">
                  <View className="w-12 h-12 bg-slate-100 dark:bg-dark-800 rounded-lg items-center justify-center">
                    <Music size={24} color="#64748b" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                       <TextInput 
                          value={item.title} 
                          onChangeText={(val) => updateBeat(item.id, { title: val })}
                          className="text-slate-900 dark:text-white font-bold text-base flex-1"
                       />
                       <TouchableOpacity onPress={() => removeBeat(item.id)} disabled={isUploading}>
                         <Trash2 size={18} color="#ef4444" />
                       </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row gap-4 mb-3">
                       <View className="flex-1">
                          <Text className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase mb-1">Genres</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                             {POPULAR_GENRES.slice(0, 8).map(g => {
                               const isSelected = item.genres.includes(g);
                               return (
                                 <TouchableOpacity 
                                   key={g} 
                                   onPress={() => {
                                     const newGenres = isSelected 
                                       ? item.genres.filter(x => x !== g)
                                       : [...item.genres, g];
                                     updateBeat(item.id, { genres: newGenres });
                                   }}
                                   className={`px-3 py-1 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-slate-200 dark:border-white/10'}`}
                                 >
                                   <Text className={`text-[10px] font-bold ${isSelected ? 'text-black' : 'text-slate-500 dark:text-gray-400'}`}>{g}</Text>
                                 </TouchableOpacity>
                               );
                             })}
                          </ScrollView>
                       </View>
                       <View className="w-20">
                          <Text className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase mb-1">BPM</Text>
                          <TextInput 
                             value={item.bpm}
                             onChangeText={(val) => updateBeat(item.id, { bpm: val })}
                             keyboardType="numeric"
                             className="bg-slate-50 dark:bg-dark-800 text-slate-900 dark:text-white px-2 py-1 rounded border border-slate-200 dark:border-white/5 text-xs"
                          />
                       </View>
                    </View>

                    {/* Status / Progress */}
                    {item.status === 'uploading' && (
                       <View className="h-1 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                          <View className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                       </View>
                    )}
                    {item.status === 'completed' && (
                      <View className="flex-row items-center gap-1">
                        <CheckCircle2 size={14} color="#22c55e" />
                        <Text className="text-[#22c55e] text-[10px] font-bold uppercase">Ready</Text>
                      </View>
                    )}
                    {item.status === 'error' && (
                      <View className="flex-row items-center gap-1">
                        <AlertCircle size={14} color="#ef4444" />
                        <Text className="text-[#ef4444] text-[10px] font-bold uppercase">{item.error || 'Error'}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {beats.length > 0 && (
        <Button 
          onPress={processUpload} 
          disabled={isUploading}
          className="w-full py-5 bg-primary rounded-2xl mb-20"
        >
          {isUploading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Sparkles size={20} color="#000" />
              <Text className="text-black font-black uppercase tracking-widest text-lg">Process Batch ({beats.length})</Text>
            </View>
          )}
        </Button>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
