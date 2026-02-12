import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserCheck, UserX, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

export default function AdminArtistsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(submissions.filter(s => s.id !== id));
      
      if (status === 'approved') {
        Alert.alert('Success', 'Artist verified and submission approved.');
      }
    } catch (error) {
      console.error('Action error:', error);
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Control Room / Artists</Text>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Verify and manage artist profiles</Text>
        </View>
        <Badge variant="outline" className="flex-row gap-2 bg-primary/10 border-primary/20">
            <ShieldCheck size={14} color="#005CB9" />
            <Text className="text-primary font-bold text-xs uppercase">Queue: {submissions.length}</Text>
        </Badge>
      </View>

      {loading ? (
        <View className="py-20 items-center">
           <ActivityIndicator size="large" color="#005CB9" />
           <Text className="text-gray-500 mt-4 text-xs font-black uppercase tracking-widest">Loading Queue...</Text>
        </View>
      ) : (
        <View className="gap-6">
          {submissions.map((artist) => (
            <View key={artist.id} className="bg-dark-900 border border-white/5 p-6 rounded-3xl gap-6">
              <View className="flex-row items-center gap-6">
                <View className="w-16 h-16 bg-dark-800 rounded-2xl items-center justify-center border border-white/5">
                  <Text className="font-black text-2xl text-gray-500">{artist.name?.[0] || artist.artist_name?.[0] || '?'}</Text>
                </View>
                <View>
                  <Text className="text-xl font-black italic text-white mb-1 tracking-tight">{artist.name || artist.artist_name}</Text>
                  <View className="flex-row items-center gap-4">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{artist.genre}</Text>
                    <View className="w-1 h-1 rounded-full bg-white/20" />
                    <Text className="text-[10px] text-gray-400 uppercase tracking-widest italic">
                      {artist.tier} Priority Review
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/10"
                  disabled={processingId === artist.id}
                  onPress={() => handleAction(artist.id, 'rejected')}
                >
                  <View className="flex-row items-center gap-2">
                     {processingId === artist.id ? <ActivityIndicator size="small" color="#EF4444" /> : <UserX size={16} color="#EF4444" />}
                     <Text className="text-red-500 font-bold uppercase text-xs">Reject</Text>
                  </View>
                </Button>
                <Button 
                  className="flex-1 bg-primary"
                  disabled={processingId === artist.id}
                  onPress={() => handleAction(artist.id, 'approved')}
                >
                  <View className="flex-row items-center gap-2">
                     {processingId === artist.id ? <ActivityIndicator size="small" color="#000" /> : <UserCheck size={16} color="#000" />}
                     <Text className="text-black font-bold uppercase text-xs">Verify Artist</Text>
                  </View>
                </Button>
                {artist.release_url && (
                  <Button variant="outline" className="w-12 items-center justify-center border-white/10" onPress={() => Linking.openURL(artist.release_url)}>
                    <ExternalLink size={20} color="#fff" />
                  </Button>
                )}
              </View>
            </View>
          ))}

          {submissions.length === 0 && (
            <View className="py-20 items-center bg-dark-900/30 border border-dashed border-white/5 rounded-3xl">
              <ShieldCheck size={48} color="#374151" className="mb-4" />
              <Text className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs italic">Queue is clear • Standards Met</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
