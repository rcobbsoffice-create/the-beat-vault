import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Music, 
  Plus, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Search
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function DistributionPage() {
  const [releases] = useState([
    {
      id: '1',
      title: 'Neon Nights',
      artist: 'AudioGenes Artist',
      status: 'live',
      releaseDate: '2026-01-15',
      isrc: 'US-TF1-26-00001',
      upc: '190000000001',
      artwork: null
    },
    {
      id: '2',
      title: 'Midnight Shadows',
      artist: 'AudioGenes Artist',
      status: 'processing',
      releaseDate: '2026-02-01',
      isrc: 'US-TF1-26-00002',
      upc: '190000000002',
      artwork: null
    }
  ]);

  const statusIcons: Record<string, any> = {
    draft: <Clock size={14} color="#9CA3AF" />,
    pending: <Clock size={14} color="#F59E0B" />,
    processing: <Globe size={14} color="#D4AF37" />,
    live: <CheckCircle size={14} color="#10B981" />,
    rejected: <AlertCircle size={14} color="#EF4444" />
  };

  const statusColors: Record<string, 'default' | 'primary' | 'outline' | 'secondary' | 'success' | 'destructive'> = {
    draft: 'outline',
    pending: 'secondary',
    processing: 'primary',
    live: 'success',
    rejected: 'destructive'
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending Review',
    processing: 'Distributing',
    live: 'Live on DSPs',
    rejected: 'Action Required'
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Music Distribution</Text>
          <Text className="text-gray-400">Manage your releases and distribution to global DSPs</Text>
        </View>
        <Button onPress={() => router.push('/dashboard/artist/distribution/new')} className="flex-row gap-2 bg-primary self-start">
           <Plus size={20} color="#000" />
           <Text className="text-black font-bold">New Release</Text>
        </Button>
      </View>

      {/* Stats Summary */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        <Card className="p-6 border-white/5 bg-dark-900/50 flex-1 min-w-[150px]">
          <Text className="text-sm text-gray-400 font-medium mb-1">Total Releases</Text>
          <Text className="text-2xl font-bold text-white">{releases.length}</Text>
        </Card>
        <Card className="p-6 border-white/5 bg-dark-900/50 flex-1 min-w-[150px]">
          <Text className="text-sm text-gray-400 font-medium mb-1">Live on DSPs</Text>
          <Text className="text-2xl font-bold text-green-500">{releases.filter(r => r.status === 'live').length}</Text>
        </Card>
        <Card className="p-6 border-white/5 bg-dark-900/50 flex-1 min-w-[150px]">
          <Text className="text-sm text-gray-400 font-medium mb-1">Marketplace Reach</Text>
          <Text className="text-2xl font-bold text-primary">150+ Platforms</Text>
        </Card>
      </View>

      {/* Search & Filters */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 relative justify-center bg-dark-800 rounded-lg border border-white/10">
          <View className="absolute left-3 z-10">
             <Search size={16} color="#6B7280" />
          </View>
          <TextInput 
            className="w-full pl-10 pr-4 py-3 text-white h-12"
            placeholder="Search releases..." 
            placeholderTextColor="#6B7280"
          />
        </View>
        <Button variant="outline" className="h-12 justify-center">
            <Text className="text-white">Filter</Text>
        </Button>
      </View>

      {/* Release List */}
      <View className="gap-4">
        {releases.length > 0 ? (
          releases.map((release) => (
            <Card key={release.id} className="p-4 bg-dark-900 border-white/5">
              <View className="flex-col md:flex-row items-center gap-6">
                <View className="w-16 h-16 rounded-lg bg-dark-800 items-center justify-center overflow-hidden shrink-0">
                  <Music size={32} color="#4B5563" />
                </View>
                
                <View className="flex-1 items-center md:items-start">
                  <View className="flex-row items-center gap-3 mb-1">
                    <Text className="font-bold text-white text-lg" numberOfLines={1}>{release.title}</Text>
                    <Badge 
                      variant={(statusColors[release.status] as any)}
                    >
                       <View className="flex-row gap-1 items-center">
                          {statusIcons[release.status]}
                          <Text className={`text-[10px] font-bold ${release.status==='live' || release.status==='processing' ? 'text-black' : 'text-white'}`}>
                              {statusLabels[release.status]}
                          </Text>
                       </View>
                    </Badge>
                  </View>
                  <View className="flex-row flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-500 mt-1">
                    <Text className="text-gray-500 text-xs flex-row items-center gap-1">
                         <Clock size={12} color="#6B7280" /> {release.releaseDate}
                    </Text>
                    <Text className="font-mono text-gray-600 text-xs">{release.isrc}</Text>
                    <Text className="font-mono text-gray-600 text-xs">{release.upc}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 w-full md:w-auto mt-4 md:mt-0 justify-center">
                  <Button variant="ghost" size="sm">
                    <Text className="text-gray-400">Edit</Text>
                  </Button>
                  {release.status === 'live' && (
                    <Button variant="outline" size="sm" className="flex-row gap-2">
                      <ExternalLink size={12} color="#fff" />
                      <Text className="text-white text-xs">Links</Text>
                    </Button>
                  )}
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View className="items-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
            <Globe size={48} color="#4B5563" className="mb-4" />
            <Text className="text-xl font-bold text-white mb-2">No Releases Yet</Text>
            <Text className="text-gray-400 mb-8 max-w-xs text-center">
              Start distributing your music to Spotify, Apple Music, and 150+ other platforms for free.
            </Text>
            <Button onPress={() => router.push('/dashboard/artist/distribution/new')} className="bg-primary">
                <Text className="text-black font-bold">Create Your First Release</Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
