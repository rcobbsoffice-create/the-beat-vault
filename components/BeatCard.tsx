import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { Play, Music } from 'lucide-react-native';
import { usePlayer } from '@/stores/player';
import { Badge } from '@/components/ui/Badge';

interface BeatCardProps {
  beat: any;
}

export function BeatCard({ beat }: BeatCardProps) {
  const { setCurrentBeat } = usePlayer();

  return (
    <View className="bg-dark-900/50 border border-white/5 rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-500">
      <TouchableOpacity 
        onPress={() => setCurrentBeat(beat)}
        className="aspect-square relative flex items-center justify-center bg-dark-800"
      >
        {beat.artwork_url ? (
          <Image 
            source={{ uri: beat.artwork_url }} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          />
        ) : (
          <Music size={48} color="#374151" />
        )}
        <View className="absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <View className="w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
            <Play size={32} color="black" fill="black" />
          </View>
        </View>
      </TouchableOpacity>
      
      <View className="p-6">
        <Link href={`/beats/${beat.id}`} asChild>
          <TouchableOpacity>
            <Text className="text-xl font-black uppercase italic tracking-tighter truncate text-white">
              {beat.title}
            </Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-gray-500 font-bold text-sm mb-4">
          {beat.producer?.display_name || 'Anonymous'}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 border-none">
            <Text className="text-[10px] font-black uppercase text-primary">
              {beat.genre}
            </Text>
          </Badge>
          <Text className="text-white font-black">
            ${((beat.licenses?.[0]?.price || 2999) / 100).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
