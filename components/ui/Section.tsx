import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
  className?: string;
}

export function Section({ title, subtitle, children, onSeeAll, className = "" }: SectionProps) {
  return (
    <View className={`mb-10 ${className}`}>
      <View className="flex-row items-center justify-between mb-4 px-1">
        <View>
          <Text className="text-xl font-bold text-white tracking-tight">{title}</Text>
          {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
        </View>
        {onSeeAll && (
          <TouchableOpacity 
            onPress={onSeeAll}
            className="flex-row items-center"
          >
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mr-1">See All</Text>
            <ChevronRight size={14} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        className="flex-row"
      >
        {children}
      </ScrollView>
    </View>
  );
}
