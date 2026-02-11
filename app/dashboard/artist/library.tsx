import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  Music, 
  Lock,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import * as Linking from 'expo-linking';

export default function ArtistLibraryPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            beat:beats(*, producer:profiles(*)),
            license:licenses(*)
          `)
          .eq('buyer_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPurchases(data || []);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, [user]);

  const handleDownload = (purchase: any) => {
    // Generate a temporary download link logic would go here
    const urls = purchase.download_urls;
    if (!urls) {
      Alert.alert('Error', 'Download link not found');
      return;
    }
    
    // For now, redirect to the first available URL
    const downloadUrl = urls.wav || urls.mp3 || (urls.stems && Object.values(urls.stems)[0]);
    if (downloadUrl) {
      Linking.openURL(downloadUrl as string);
    } else {
      Alert.alert('Error', 'No download URL available');
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">My Library</Text>
          <Text className="text-gray-400">Access and download your licensed beat collection</Text>
        </View>
        <View className="flex-row bg-dark-900 border border-white/5 rounded-xl p-1 gap-1 self-start">
          <Button size="sm" className="bg-primary h-8"><Text className="text-black font-bold text-xs">All Purchases</Text></Button>
          <Button size="sm" variant="ghost" className="h-8"><Text className="text-gray-500 text-xs">Stems</Text></Button>
        </View>
      </View>

      {/* Grid */}
      <View className="gap-4">
        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" />
        ) : purchases.length === 0 ? (
          <View className="items-center py-12">
            <Music size={48} color="#374151" />
            <Text className="text-gray-500 mt-4">You haven't purchased any beats yet.</Text>
          </View>
        ) : purchases.map((purchase) => (
          <Card key={purchase.id} className="p-4 bg-dark-900/40 border-white/5">
            <View className="flex-col md:flex-row items-center gap-6">
              {/* Box */}
              <View className="w-16 h-16 rounded-xl bg-dark-800 shrink-0 items-center justify-center overflow-hidden">
                {purchase.beat?.artwork_url ? (
                  <Image source={{ uri: purchase.beat.artwork_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Music size={24} color="#D4AF37" />
                )}
              </View>

              {/* Info */}
              <View className="flex-1 items-center md:items-start text-center md:text-left">
                <Text className="text-lg font-bold text-white mb-1">{purchase.beat?.title || 'Unknown Beat'}</Text>
                <Text className="text-sm text-gray-400 mb-2">Produced by <Text className="text-white">{purchase.beat?.producer?.display_name || 'Producer'}</Text></Text>
                <View className="flex-row gap-2">
                  <Badge variant="outline"><Text className="text-[10px] text-white uppercase">{purchase.license?.type} License</Text></Badge>
                </View>
              </View>

              {/* Actions */}
              <View className="w-full md:w-auto">
                 <Button 
                   onPress={() => handleDownload(purchase)}
                   className="flex-row items-center justify-center gap-2 bg-white h-10"
                 >
                    <Download size={16} color="#000" />
                    <Text className="text-black font-bold">Download Files</Text>
                 </Button>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Locked Content Hint */}
      <View className="p-8 border border-dashed border-white/5 rounded-2xl items-center mt-8">
         <View className="mb-4 w-12 h-12 rounded-full bg-white/5 items-center justify-center">
            <Lock size={24} color="#4B5563" />
         </View>
         <Text className="text-white font-bold mb-1">Unreleased Purchases</Text>
         <Text className="text-gray-500 text-sm text-center">
           Any beats marked as "Coming Soon" by the producer will appear here once ready.
         </Text>
      </View>
    </ScrollView>
  );
}
