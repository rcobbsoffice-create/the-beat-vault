import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { 
  LayoutGrid, 
  Music, 
  Box, 
  BookOpen, 
  Heart, 
  Clock, 
  Layers,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react-native';

const NAV_ITEMS = [
  { label: 'Browse', icon: LayoutGrid, href: '/marketplace' },
  { label: 'Instrumentals', icon: Music, href: '/marketplace?tab=beats' },
  { label: 'Sound Packs', icon: Box, href: '/marketplace?tab=packs' },
  { label: 'Clothing', icon: ShoppingBag, href: '/marketplace?tab=clothing' },
  { label: 'Tutorials', icon: BookOpen, href: '/marketplace?tab=tutorials' },
];

const LIBRARY_ITEMS = [
  { label: 'My Sounds', icon: Layers, href: '/dashboard/artist/library' },
  { label: 'Liked Tracks', icon: Heart, href: '/dashboard/artist/favorites' },
  { label: 'Recently Played', icon: Clock, href: '/dashboard/artist/history' },
];

export function MarketplaceSidebar() {
  const pathname = usePathname();

  return (
    <View className="w-64 bg-dark-700 border-r border-white/5 h-full hidden lg:flex">
      <ScrollView className="flex-1 p-6">
        <View className="mb-10 pt-4">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">Explore</Text>
          <View className="gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link href={item.href as any} key={item.label} asChild>
                  <TouchableOpacity 
                    className={`flex-row items-center px-4 py-3 rounded-xl ${
                      isActive ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <Icon size={18} color={isActive ? '#005CB9' : '#9CA3AF'} />
                    <Text className={`ml-3 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Library</Text>
            <TouchableOpacity><Text className="text-primary text-[10px] font-bold">+</Text></TouchableOpacity>
          </View>
          <View className="gap-2">
            {LIBRARY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href as any} key={item.label} asChild>
                  <TouchableOpacity className="flex-row items-center px-4 py-3">
                    <Icon size={18} color="#9CA3AF" />
                    <Text className="ml-3 font-medium text-gray-400">{item.label}</Text>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">Community</Text>
          <TouchableOpacity className="flex-row items-center px-4 py-3">
            <Sparkles size={18} color="#9CA3AF" />
            <Text className="ml-3 font-medium text-gray-400">Collaboration</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-4 py-3">
            <ExternalLink size={18} color="#9CA3AF" />
            <Text className="ml-3 font-medium text-gray-400">Beat Vault Pro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
