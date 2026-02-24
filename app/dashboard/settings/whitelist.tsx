import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  ShieldCheck, 
  Youtube, 
  Instagram, 
  Plus, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Video,
  X
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker'; // You might need to install this or use a custom dropdown. 
// For now, I'll build a simple custom selector or just use buttons for platform selection to avoid extra deps if possible.

export default function WhitelistPage() {
  const [handles, setHandles] = useState([
    { id: '1', platform: 'youtube', handle: '@TheBeatVaultArtist', status: 'active' },
    { id: '2', platform: 'instagram', handle: 'vault_vibes', status: 'pending' },
  ]);

  const [newHandle, setNewHandle] = useState('');
  const [newPlatform, setNewPlatform] = useState('youtube');
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);

  const addHandle = () => {
    if (!newHandle) return;
    setHandles([...handles, { id: Date.now().toString(), platform: newPlatform, handle: newHandle, status: 'pending' }]);
    setNewHandle('');
    Alert.alert('Success', 'Handle submitted for whitelisting!');
  };

  const removeHandle = (id: string) => {
    setHandles(handles.filter(h => h.id !== id));
    Alert.alert('Removed', 'Protection removed');
  };

  const platformIcons: Record<string, any> = {
    youtube: <Youtube size={20} color="#EF4444" />,
    instagram: <Instagram size={20} color="#EC4899" />,
    twitch: <Video size={20} color="#A855F7" />,
    tiktok: <Video size={20} color="#FFFFFF" />
  };

  const platforms = [
      { label: 'YouTube', value: 'youtube' },
      { label: 'Twitch', value: 'twitch' },
      { label: 'Instagram', value: 'instagram' },
      { label: 'TikTok', value: 'tiktok' },
  ];

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="flex-row items-center gap-4 bg-primary/10 border border-primary/20 p-6 rounded-3xl mb-8">
        <View className="w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center border border-primary/30">
          <ShieldCheck size={32} color="#005CB9" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white mb-1">Content ID Shield</Text>
          <Text className="text-gray-400 text-sm">Whitelist your channels to prevent automated copyright claims.</Text>
        </View>
      </View>

      {/* Add New */}
      <Card className="p-6 bg-dark-900/40 border-white/5 mb-8">
        <Text className="font-bold text-white mb-4 flex-row items-center gap-2">
          <Plus size={16} color="#005CB9" /> Add Protection
        </Text>
        <View className="gap-4">
            {/* Platform Selector */}
            <View>
                <Text className="text-white text-sm mb-2 font-bold">Platform</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                    {platforms.map(p => (
                        <TouchableOpacity 
                            key={p.value}
                            onPress={() => setNewPlatform(p.value)}
                            className={`px-4 py-2 rounded-lg border ${newPlatform === p.value ? 'bg-primary border-primary' : 'bg-dark-800 border-white/10'}`}
                        >
                            <Text className={`font-bold ${newPlatform === p.value ? 'text-black' : 'text-gray-400'}`}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

          <Input 
            label="Handle / Username"
            placeholder="@yourchannel or username" 
            value={newHandle}
            onChangeText={setNewHandle}
          />
          <Button onPress={addHandle} className="bg-primary">
             <Text className="text-black font-bold">Enable Shield</Text>
          </Button>
        </View>
        <View className="flex-row gap-2 mt-4">
           <HelpCircle size={12} color="#6B7280" className="mt-0.5" />
           <Text className="text-[10px] text-gray-500 leading-relaxed flex-1">
             Whitelisting ensures that AudioGenes AI recognizes your channel as a licensed user, 
             preventing digital fingerprinting engines from flagging your content. Clearance can take up to 24-48 hours.
           </Text>
        </View>
      </Card>

      {/* List */}
      <View className="gap-4 mb-8">
        <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Active Protections</Text>
        {handles.map(h => (
          <Card key={h.id} className="p-4 bg-dark-900 border-white/5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center">
                {platformIcons[h.platform] || <Video size={20} color="white" />}
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-white">{h.handle}</Text>
                  <Badge variant={h.status === 'active' ? 'primary' : 'outline'}>
                    <Text className="text-[10px] text-black font-bold capitalize">{h.status}</Text>
                  </Badge>
                </View>
                <Text className="text-xs text-gray-500 capitalize">{h.platform} Protection</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Button variant="ghost" size="sm" onPress={() => removeHandle(h.id)}>
                <Trash2 size={16} color="#EF4444" />
              </Button>
            </View>
          </Card>
        ))}
      </View>

      {/* Warning */}
      <View className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex-row items-start gap-3">
        <ShieldAlert size={20} color="#EF4444" className="mt-0.5" />
        <Text className="text-xs text-gray-400 leading-relaxed flex-1">
          <Text className="text-white font-bold">Important: </Text>
          Whitelisting is only valid for channels you own or manage. 
          Misuse of the Content ID Shield can result in your account being flagged for rights abuse. 
        </Text>
      </View>
    </ScrollView>
  );
}
