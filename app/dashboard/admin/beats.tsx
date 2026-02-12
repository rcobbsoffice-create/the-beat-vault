import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { 
  Music, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Upload,
  FileAudio,
  Image as ImageIcon,
  FolderArchive,
  Tag
} from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToR2 } from '@/lib/r2';
import { usePlayer } from '@/stores/player';
import { Play, Pause } from 'lucide-react-native';

const GENRES = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeat', 'Dance', 'Electronic', 'Rock'];
const KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor',
  'D Major', 'D Minor', 'D# Major', 'D# Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor', 'F# Major', 'F# Minor',
  'G Major', 'G Minor', 'G# Major', 'G# Minor',
  'A Major', 'A Minor', 'A# Major', 'A# Minor',
  'B Major', 'B Minor'
];

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<any[]>([]);
  const [producers, setProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Player State
  const { setCurrentBeat, togglePlayPause, currentBeat, isPlaying } = usePlayer();
  
  // Genres Logic
  const [availableGenres, setAvailableGenres] = useState<string[]>(GENRES);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // File State
  const [audioFile, setAudioFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [artworkFile, setArtworkFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [stemsFile, setStemsFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [form, setForm] = useState({
    title: '',
    producer_id: '',
    bpm: '',
    key: '',
    genre: 'Hip Hop',
    genres: [] as string[],
    mood_tags: [] as string[],
    price: '29.99',
    audio_url: '',
    artwork_url: '',
    stems_url: '',
    description: '',
    tags: [] as string[]
  });

  useEffect(() => {
    checkUserRole();
    fetchData();
  }, []);

  async function checkUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      console.log('Current User Profile:', profile);
      if (profile?.role !== 'admin') {
         Alert.alert('Warning', 'You are not logged in as an admin. You may not be able to save beats.');
      }
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [beatsRes, profilesRes] = await Promise.all([
        supabase
          .from('beats')
          .select(`*, producer:profiles(id, display_name)`)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, display_name')
          .in('role', ['producer', 'artist', 'admin'])
          .order('display_name')
      ]);

      if (beatsRes.error) throw beatsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setBeats(beatsRes.data || []);
      setProducers(profilesRes.data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableGenres() {
    try {
      const { data, error } = await supabase
        .from('genre_settings')
        .select('name')
        .eq('status', 'approved')
        .order('name');
      
      if (error) throw error;
      if (data && data.length > 0) {
        setAvailableGenres(data.map(g => g.name));
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  }

  useEffect(() => {
    fetchAvailableGenres();
  }, []);

  const handleEdit = (beat: any) => {
    setEditingId(beat.id);
    setAudioFile(null);
    setArtworkFile(null);
    setStemsFile(null);
    setForm({
      title: beat.title,
      producer_id: beat.producer_id,
      bpm: beat.bpm?.toString() || '',
      key: beat.key || '',
      genre: beat.genre || 'Hip Hop',
      genres: beat.genres || (beat.genre ? [beat.genre] : []),
      mood_tags: beat.mood_tags || [],
      price: beat.price?.toString() || '29.99',
      audio_url: beat.audio_url || '',
      artwork_url: beat.artwork_url || '',
      stems_url: beat.stems_url || '',
      description: beat.description || '',
      tags: beat.tags || []
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setAudioFile(null);
    setArtworkFile(null);
    setStemsFile(null);
    setForm({
      title: '',
      producer_id: producers[0]?.id || '',
      bpm: '',
      key: '',
      genre: 'Hip Hop',
      genres: [],
      mood_tags: [],
      price: '29.99',
      audio_url: '',
      artwork_url: '',
      stems_url: '',
      description: '',
      tags: []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Beat",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from('beats').delete().eq('id', id);
              if (error) throw error;
              setBeats(beats.filter(b => b.id !== id));
              Alert.alert('Success', 'Beat deleted.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  // File Pickers
  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/mpeg', 'audio/x-wav', 'audio/mp3'],
        copyToCacheDirectory: true
      });
      if (!result.canceled) {
        setAudioFile(result.assets[0]);
        // Auto-fill title if empty
        if (!form.title) {
          const name = result.assets[0].name.replace(/\.[^/.]+$/, "");
          setForm(prev => ({ ...prev, title: name }));
        }
      }
    } catch (err) {
      console.error('Pick audio error:', err);
    }
  };

  const pickArtwork = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
      if (!result.canceled) setArtworkFile(result.assets[0]);
    } catch (err) {
      console.error('Pick artwork error:', err);
    }
  };

  const pickStems = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/zip', copyToCacheDirectory: true });
      if (!result.canceled) setStemsFile(result.assets[0]);
    } catch (err) {
      console.error('Pick stems error:', err);
    }
  };

  const processFileForUpload = async (file: DocumentPicker.DocumentPickerAsset) => {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  const handleSave = async () => {
    console.log('[AdminBeats] handleSave called');

    // Validation
    const hasAudio = audioFile || form.audio_url;
    if (!form.title || !form.producer_id || !hasAudio) {
      const missing = [];
      if (!form.title) missing.push('Title');
      if (!form.producer_id) missing.push('Producer');
      if (!hasAudio) missing.push('Audio File');
      Alert.alert('Error', `Missing required fields: ${missing.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      // 1. Determine Beat ID (existing or new)
      let currentBeatId = editingId;
      if (!currentBeatId) {
         // Generate a UUID for R2 paths if not editing
         // Since we can't insert DRAFT without RLS error, we'll generate one locally for paths
         currentBeatId = crypto.randomUUID();
      }

      // 2. Upload Files if present
      let uploadedAudioUrl = form.audio_url;
      let uploadedArtworkUrl = form.artwork_url;
      let uploadedStemsUrl = form.stems_url;

      try {
        if (audioFile && currentBeatId) {
          const fileData = await processFileForUpload(audioFile);
          const path = `beats/${currentBeatId}/original.${audioFile.name.split('.').pop()}`;
          uploadedAudioUrl = await uploadToR2(path, fileData as any, audioFile.mimeType || 'audio/wav');
        }

        if (artworkFile && currentBeatId) {
          const fileData = await processFileForUpload(artworkFile);
          const path = `beats/${currentBeatId}/artwork.${artworkFile.name.split('.').pop()}`;
          uploadedArtworkUrl = await uploadToR2(path, fileData as any, artworkFile.mimeType || 'image/jpeg');
        }

        if (stemsFile && currentBeatId) {
          const fileData = await processFileForUpload(stemsFile);
          const path = `beats/${currentBeatId}/stems.zip`;
          uploadedStemsUrl = await uploadToR2(path, fileData as any, stemsFile.mimeType || 'application/zip');
        }
      } catch (uploadErr: any) {
        console.error('Upload Error:', uploadErr);
        Alert.alert('Upload Failed', 'Failed to upload files to R2. Please check CORS settings or try again.');
        setSaving(false);
        return;
      }

      // 3. Prepare Beat Data
      const beatData = {
        title: form.title,
        producer_id: form.producer_id,
        bpm: parseInt(form.bpm) || 0,
        key: form.key,
        genre: form.genres[0] || form.genre,
        genres: form.genres,
        mood_tags: form.mood_tags,
        price: parseFloat(form.price) || 29.99,
        audio_url: uploadedAudioUrl || 'pending',
        preview_url: uploadedAudioUrl || 'pending',
        artwork_url: uploadedArtworkUrl,
        stems_url: uploadedStemsUrl,
        description: form.description,
        tags: form.tags,
        status: 'published'
      };

      // 4. Call Edge Function to Save (Bypassing RLS)
      // If creating new, we pass the generated ID if we want, or let DB generate.
      // But we used currentBeatId for R2 paths, so we should probably use that ID if possible 
      // OR update the R2 paths later? 
      // Better to insert with the ID we used for R2.
      if (!editingId) {
         // @ts-ignore
         beatData.id = currentBeatId;
      }

      console.log('Invoking create-beat-as-admin with:', { action: editingId ? 'update' : 'create', beatId: editingId });
      
      const { data, error } = await supabase.functions.invoke('create-beat-as-admin', {
        body: {
          action: editingId ? 'update' : 'create',
          beatId: editingId,
          beatData
        }
      });

      if (error) throw error;

      console.log('Edge Function Response:', data);

      Alert.alert('Success', 'Beat saved successfully.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('[AdminBeats] Save error:', err);
      Alert.alert('Error', err.message || 'Failed to save beat');
    } finally {
      setSaving(false);
    }
  };

  const filteredBeats = beats.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.producer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="mb-8 flex-row justify-between items-end">
        <View>
          <Text className="text-3xl font-black uppercase tracking-tighter italic text-white flex-row items-center gap-3">
             <Music size={28} color="#005CB9" /> Beat Library
          </Text>
          <Text className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs italic">
            Global Catalog Management
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Button 
            onPress={() => router.push('/dashboard/admin/genres')}
            className="bg-white/5 border border-white/10 flex-row gap-2"
          >
            <Tag size={16} color="#005CB9" />
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Manage Genres</Text>
          </Button>
          <Button 
            onPress={() => router.push('/dashboard/admin/bulk-upload')}
            className="bg-white/5 border border-white/10 flex-row gap-2"
          >
            <FolderArchive size={16} color="#9CA3AF" />
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Bulk Upload</Text>
          </Button>
          <Button 
            onPress={() => router.push('/dashboard/admin/upload')} 
            className="bg-secondary flex-row gap-2 shadow-lg shadow-secondary/20 transition-all active:scale-95"
          >
            <Plus size={16} color="#000" strokeWidth={3} />
            <Text className="text-black font-black uppercase tracking-widest text-xs">Deploy Asset</Text>
          </Button>
        </View>
      </View>

      <View className="mb-6 flex-row gap-4">
        <View className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 flex-row items-center gap-3">
           <Search size={18} color="#6B7280" />
           <TextInput 
             placeholder="Search title, producer..." 
             placeholderTextColor="#6B7280"
             className="flex-1 text-white font-medium"
             value={searchQuery}
             onChangeText={setSearchQuery}
           />
        </View>
      </View>

      {loading ? (
         <View className="py-20 items-center">
           <ActivityIndicator size="large" color="#005CB9" />
         </View>
      ) : (
        <View className="gap-4 pb-20">
          {filteredBeats.map((beat) => {
            const isPlayingBeat = currentBeat?.id === beat.id;
            const isActive = isPlayingBeat && isPlaying;

            return (
            <Card key={beat.id} className={`p-4 bg-dark-900 border-white/5 flex-row items-center gap-4 transition-all ${isActive ? 'border-primary/50 bg-primary/5' : 'hover:border-white/10'}`}>
              <TouchableOpacity 
                onPress={() => {
                  if (isPlayingBeat) {
                    togglePlayPause();
                  } else {
                    setCurrentBeat(beat);
                  }
                }}
                className="w-16 h-16 bg-dark-800 rounded-lg overflow-hidden relative border border-white/10 group"
              >
                 {beat.artwork_url ? (
                   <Image source={{ uri: beat.artwork_url }} className="w-full h-full" resizeMode="cover" />
                 ) : (
                   <View className="flex-1 items-center justify-center bg-dark-800"><Music size={24} color="#374151" /></View>
                 )}
                 
                 {/* Overlay for Play/Pause */}
                 <View className={`absolute inset-0 items-center justify-center bg-black/40 ${isActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                    {isActive ? (
                      <View className="bg-primary rounded-full p-1">
                        <Pause size={20} color="black" fill="black" />
                      </View>
                    ) : (
                      <View className="bg-white/20 backdrop-blur-md rounded-full p-1">
                        <Play size={20} color="white" fill="white" />
                      </View>
                    )}
                 </View>
              </TouchableOpacity>
              
              <View className="flex-1 gap-1">
                <Text className={`font-black text-lg tracking-tight uppercase italic ${isActive ? 'text-primary' : 'text-white'}`} numberOfLines={1}>
                  {beat.title}
                </Text>
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                  {beat.producer?.display_name || 'Unknown'} • {beat.bpm} BPM • {beat.key}
                </Text>
                <View className="flex-row gap-2 mt-1">
                   <Badge variant="outline" className="border-white/10"><Text className="text-[10px] text-gray-400">{beat.genre}</Text></Badge>
                   {beat.price && <Badge className="bg-primary/10 border-none"><Text className="text-[10px] text-primary font-bold">${beat.price}</Text></Badge>}
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <Button variant="ghost" size="icon" onPress={() => handleEdit(beat)}>
                   <Edit2 size={18} color="#9CA3AF" />
                </Button>
                <Button variant="ghost" size="icon" onPress={() => handleDelete(beat.id)}>
                   <Trash2 size={18} color="#EF4444" />
                </Button>
              </View>
            </Card>
            );
          })}

          {filteredBeats.length === 0 && (
             <View className="py-12 items-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Music size={40} color="#374151" className="mb-4" />
                <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">No beats found.</Text>
             </View>
          )}
        </View>
      )}

      {/* Edit/Add Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/90 justify-end sm:justify-center p-0 sm:p-6">
           <View className="bg-dark-900 w-full max-w-2xl self-center rounded-t-3xl sm:rounded-3xl border border-white/10 flex-1 sm:flex-none max-h-[90%] flex flex-col">
              {/* Header */}
              <View className="p-6 border-b border-white/10 flex-row justify-between items-center bg-dark-900 rounded-t-3xl">
                 <Text className="text-xl font-black uppercase italic text-white">
                   {editingId ? 'Edit Beat Metadata' : 'New Beat Upload'}
                 </Text>
                 <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                    <X size={24} color="#6B7280" />
                 </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-6">
                 <View className="gap-6">
                    {/* Basic Info */}
                    <View className="gap-4">
                       <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Primary Details</Text>
                       <TextInput 
                         placeholder="Beat Title"
                         placeholderTextColor="#6B7280"
                         className="bg-dark-950 border border-white/10 p-4 rounded-xl text-white font-bold text-lg"
                         value={form.title}
                         onChangeText={t => setForm({...form, title: t})}
                       />
                       
                       <View className="bg-dark-950 border border-white/10 rounded-xl overflow-hidden">
                          <Picker
                            selectedValue={form.producer_id}
                            onValueChange={(v) => setForm({...form, producer_id: v})}
                            dropdownIconColor="white"
                            style={{ 
                              color: 'white', 
                              backgroundColor: '#0a0a0a',
                              height: 50
                            }}
                          >
                             <Picker.Item label="Select Producer..." value="" color="#6B7280" />
                             {producers.map(p => (
                               <Picker.Item key={p.id} label={p.display_name} value={p.id} color="#fff" />
                             ))}
                          </Picker>
                       </View>
                    </View>

                    {/* Musical Metadata */}
                    <View className="gap-4">
                       <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Sonic Data</Text>
                       <View className="flex-row gap-4">
                          <View className="flex-1 gap-2">
                             <Text className="text-xs text-gray-400 font-bold">BPM</Text>
                             <TextInput 
                               placeholder="140"
                               placeholderTextColor="#6B7280"
                               className="bg-dark-950 border border-white/10 p-3 rounded-xl text-white font-bold"
                               keyboardType="numeric"
                               value={form.bpm}
                               onChangeText={t => setForm({...form, bpm: t})}
                             />
                          </View>
                          <View className="flex-1 gap-2">
                             <Text className="text-xs text-gray-400 font-bold">Key</Text>
                             <View className="bg-dark-950 border border-white/10 rounded-xl overflow-hidden h-[50px] justify-center">
                                <Picker
                                  selectedValue={form.key}
                                  onValueChange={v => setForm({...form, key: v})}
                                  dropdownIconColor="white"
                                  style={{ color: 'white', backgroundColor: '#0A0A0A' }}
                                  itemStyle={{ color: 'white', backgroundColor: '#0A0A0A' }}
                                >
                                   <Picker.Item label="Key..." value="" color="#6B7280" />
                                   {KEYS.map(k => <Picker.Item key={k} label={k} value={k} color="white" />)}
                                </Picker>
                             </View>
                          </View>
                       </View>

                       <View className="gap-2">
                          <Text className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Primary DNA <Text className="text-primary">(Genre 1)</Text></Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 pb-2">
                             {GENRES.map(g => {
                               const isSelected = form.genres.includes(g);
                               return (
                                 <TouchableOpacity 
                                   key={g} 
                                   onPress={() => {
                                     if (isSelected) {
                                       setForm({...form, genres: form.genres.filter(item => item !== g)});
                                     } else {
                                       setForm({...form, genres: [...form.genres, g]});
                                     }
                                   }}
                                   className={`px-4 py-2 rounded-lg border ${isSelected ? 'bg-primary border-primary' : 'bg-dark-950 border-white/10'}`}
                                 >
                                    <Text className={`text-xs font-black uppercase ${isSelected ? 'text-black' : 'text-gray-400'}`}>{g}</Text>
                                 </TouchableOpacity>
                               );
                             })}
                          </ScrollView>
                       </View>
                    </View>

                    {/* Assets - File Uploads */}
                    <View className="gap-4">
                       <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Assets & Files</Text>
                       
                       {/* Audio File */}
                       <View className="gap-2">
                          <Text className="text-xs text-gray-400 font-bold">Audio File (WAV/MP3)</Text>
                          {audioFile || form.audio_url ? (
                             <View className="flex-row items-center gap-2 bg-dark-950 p-2 rounded-xl border border-white/10">
                                <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center">
                                   <FileAudio size={20} color="#005CB9" />
                                </View>
                                <View className="flex-1">
                                   <Text className="text-white text-xs font-bold" numberOfLines={1}>
                                     {audioFile ? audioFile.name : 'Current Audio File'}
                                   </Text>
                                   <Text className="text-gray-500 text-[10px]">
                                     {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                                   </Text>
                                </View>
                                <Button size="sm" variant="ghost" onPress={() => { setAudioFile(null); setForm({...form, audio_url: ''}) }}>
                                   <X size={16} color="#EF4444" />
                                </Button>
                             </View>
                          ) : (
                             <TouchableOpacity onPress={pickAudio} className="border border-dashed border-white/20 p-4 rounded-xl items-center justify-center bg-white/5">
                                <Upload size={20} color="#6B7280" className="mb-2" />
                                <Text className="text-gray-400 text-xs font-bold">Select Audio File</Text>
                             </TouchableOpacity>
                          )}
                       </View>

                       {/* Artwork File */}
                       <View className="gap-2">
                          <Text className="text-xs text-gray-400 font-bold">Artwork (JPG/PNG)</Text>
                          {artworkFile || form.artwork_url ? (
                             <View className="flex-row items-center gap-2 bg-dark-950 p-2 rounded-xl border border-white/10">
                                <View className="w-10 h-10 bg-dark-800 rounded-lg overflow-hidden">
                                  <Image 
                                    source={{ uri: artworkFile?.uri || form.artwork_url }} 
                                    className="w-full h-full"
                                  />
                                </View>
                                <View className="flex-1">
                                   <Text className="text-white text-xs font-bold" numberOfLines={1}>
                                      {artworkFile ? artworkFile.name : 'Current Artwork'}
                                   </Text>
                                </View>
                                <Button size="sm" variant="ghost" onPress={() => { setArtworkFile(null); setForm({...form, artwork_url: ''}) }}>
                                   <X size={16} color="#EF4444" />
                                </Button>
                             </View>
                          ) : (
                             <TouchableOpacity onPress={pickArtwork} className="border border-dashed border-white/20 p-4 rounded-xl items-center justify-center bg-white/5">
                                <ImageIcon size={20} color="#6B7280" className="mb-2" />
                                <Text className="text-gray-400 text-xs font-bold">Select Artwork</Text>
                             </TouchableOpacity>
                          )}
                       </View>

                       {/* Stems File */}
                       <View className="gap-2">
                          <Text className="text-xs text-gray-400 font-bold">Stems / Project (ZIP)</Text>
                          {stemsFile || form.stems_url ? (
                             <View className="flex-row items-center gap-2 bg-dark-950 p-2 rounded-xl border border-white/10">
                                <View className="w-10 h-10 bg-purple-500/20 rounded-lg items-center justify-center">
                                   <FolderArchive size={20} color="#A855F7" />
                                </View>
                                <View className="flex-1">
                                   <Text className="text-white text-xs font-bold" numberOfLines={1}>
                                      {stemsFile ? stemsFile.name : 'Current Stems'}
                                   </Text>
                                   <Text className="text-gray-500 text-[10px]">
                                     {stemsFile ? `${(stemsFile.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                                   </Text>
                                </View>
                                <Button size="sm" variant="ghost" onPress={() => { setStemsFile(null); setForm({...form, stems_url: ''}) }}>
                                   <X size={16} color="#EF4444" />
                                </Button>
                             </View>
                          ) : (
                             <TouchableOpacity onPress={pickStems} className="border border-dashed border-white/20 p-4 rounded-xl items-center justify-center bg-white/5">
                                <FolderArchive size={20} color="#6B7280" className="mb-2" />
                                <Text className="text-gray-400 text-xs font-bold">Select ZIP File</Text>
                             </TouchableOpacity>
                          )}
                       </View>

                    </View>

                    {/* Pricing */}
                    <View className="gap-4">
                       <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Commerce</Text>
                        <View className="flex-row items-center gap-3">
                           <Text className="text-white font-bold">$</Text>
                           <TextInput 
                               placeholder="29.99"
                               placeholderTextColor="#6B7280"
                               className="flex-1 bg-dark-950 border border-white/10 p-4 rounded-xl text-white font-black text-xl"
                               keyboardType="numeric"
                               value={form.price}
                               onChangeText={t => setForm({...form, price: t})}
                             />
                        </View>
                    </View>
                 </View>
              </ScrollView>

              <View className="p-6 border-t border-white/10 bg-dark-900 rounded-b-3xl gap-3">
                 <Button className="bg-primary h-14" onPress={handleSave} disabled={saving}>
                   {saving ? <ActivityIndicator color="black" /> : <Save size={20} color="black" />}
                   <Text className="text-black font-black uppercase tracking-widest">
                     {saving ? 'Uploading & Saving...' : 'Save Changes'}
                   </Text>
                 </Button>
                 <Button variant="ghost" onPress={() => setIsModalOpen(false)} disabled={saving}>
                   <Text className="text-gray-500 font-bold uppercase tracking-widest">Cancel</Text>
                 </Button>
              </View>
           </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
