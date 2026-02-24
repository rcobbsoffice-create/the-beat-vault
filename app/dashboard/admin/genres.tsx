import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, X, Trash2, Plus, Filter, Tag } from 'lucide-react-native';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminGenresPage() {
  const { profile } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGenre, setNewGenre] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'proposed'>('all');

  useEffect(() => {
    fetchGenres();
  }, [filter]);

  async function fetchGenres() {
    setLoading(true);
    try {
      let query = supabase.from('genre_settings').select('*, profiles(display_name)').order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setGenres(data || []);
    } catch (err: any) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('genre_settings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      fetchGenres();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message);
    }
  }

  async function deleteGenre(id: string) {
    Alert.alert(
      'Delete Genre',
      'Are you sure? This will remove the genre from the platform settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('genre_settings')
                .delete()
                .eq('id', id);
              if (error) throw error;
              fetchGenres();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message);
            }
          }
        }
      ]
    );
  }

  async function addGenre() {
    if (!newGenre.trim()) return;
    try {
      const { error } = await supabase
        .from('genre_settings')
        .insert({
          name: newGenre.trim(),
          status: 'approved',
          created_by: profile?.id
        });
      
      if (error) throw error;
      setNewGenre('');
      fetchGenres();
    } catch (err: any) {
      Alert.alert('Add Failed', err.message);
    }
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2 italic">Genre Meta Manager</Text>
        <Text className="text-gray-400">Review proposals and manage platform DNA labels</Text>
      </View>

      <Card className="p-4 bg-dark-900 border-white/5 mb-8">
        <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4 italic">Quick Add Approved Genre</Text>
        <View className="flex-row gap-3">
          <TextInput
            placeholder="GENRE NAME..."
            placeholderTextColor="#4B5563"
            value={newGenre}
            onChangeText={setNewGenre}
            className="flex-1 bg-dark-950 border border-white/10 p-4 rounded-xl text-white font-bold"
          />
          <TouchableOpacity 
            onPress={addGenre}
            className="w-14 h-14 bg-primary rounded-xl items-center justify-center"
          >
            <Plus size={24} color="black" />
          </TouchableOpacity>
        </View>
      </Card>

      <View className="flex-row gap-2 mb-6">
        {(['all', 'proposed', 'approved'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl border ${filter === f ? 'bg-primary border-primary' : 'bg-dark-900 border-white/10'}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === f ? 'text-black' : 'text-gray-400'}`}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#005CB9" className="mt-10" />
      ) : (
        <View className="gap-4">
          {genres.length === 0 ? (
            <Text className="text-gray-500 text-center py-10 italic">No genres found matching high-priority filters.</Text>
          ) : genres.map((genre) => (
            <Card key={genre.id} className="p-4 bg-dark-900 border-white/5 flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Tag size={12} color={genre.status === 'proposed' ? '#F59E0B' : '#10B981'} />
                  <Text className="text-white font-bold text-lg">{genre.name}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${genre.status === 'proposed' ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                    <Text className={`text-[8px] font-black uppercase ${genre.status === 'proposed' ? 'text-amber-500' : 'text-green-500'}`}>
                      {genre.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-[10px] italic">
                  Created by {genre.profiles?.display_name || 'System' } on {new Date(genre.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View className="flex-row gap-2">
                {genre.status === 'proposed' && (
                  <>
                    <TouchableOpacity 
                      onPress={() => updateStatus(genre.id, 'approved')}
                      className="w-8 h-8 bg-green-500/20 rounded-lg items-center justify-center border border-green-500/30"
                    >
                      <Check size={16} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => updateStatus(genre.id, 'rejected')}
                      className="w-8 h-8 bg-red-500/20 rounded-lg items-center justify-center border border-red-500/30"
                    >
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity 
                  onPress={() => deleteGenre(genre.id)}
                  className="w-8 h-8 bg-dark-950 rounded-lg items-center justify-center border border-white/5"
                >
                  <Trash2 size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}
      <View className="h-20" />
    </ScrollView>
  );
}
