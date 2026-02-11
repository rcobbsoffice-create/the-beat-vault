import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Target, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Music,
  Headphones,
  Search
} from 'lucide-react-native';

export default function ArtistInsightsPage() {
  const recommendations = [
    { title: 'Cyberpunk Nights', genre: 'Synthwave', match: 98, reason: 'Similar to your recent purchases' },
    { title: 'Golden Hour', genre: 'Lo-Fi', match: 92, reason: 'Trending in your region' },
    { title: 'Drill Sergeant', genre: 'Drill', match: 88, reason: 'Matches your BPM preferences' },
  ];

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="bg-primary/10 border border-primary/20 p-8 rounded-3xl mb-8 relative overflow-hidden">
        {/* Decorative elements behind could go here with absolute positioning if needed */}
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center border border-primary/30 shrink-0">
            <Target size={32} color="#D4AF37" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">Artist Insights</Text>
            <Text className="text-gray-400 text-sm">AI-driven suggestions and market trends tailored to your sound.</Text>
          </View>
        </View>
      </View>

      <View className="flex-col lg:flex-row gap-8">
        {/* Recommended for You */}
        <View className="flex-1 gap-4">
           <Text className="text-lg font-bold text-white flex-row items-center gap-2">
             <Zap size={20} color="#D4AF37" /> Top AI Matches
           </Text>
           <View className="gap-4">
              {recommendations.map((rec, i) => (
                <Card key={i} className="p-5 bg-dark-900/50 border-white/5 flex-row items-center justify-between">
                   <View className="flex-row items-center gap-4 flex-1">
                      <View className="w-12 h-12 rounded-xl bg-dark-800 items-center justify-center border border-white/5">
                         <Music size={24} color="#D4AF37" />
                      </View>
                      <View>
                         <View className="flex-row items-center gap-2">
                            <Text className="font-bold text-white">{rec.title}</Text>
                            <Badge variant="primary"><Text className="text-[10px] text-black font-bold">{rec.match}% Match</Text></Badge>
                         </View>
                         <Text className="text-xs text-gray-500 mt-0.5">{rec.reason}</Text>
                      </View>
                   </View>
                   <TouchableOpacity className="p-2">
                      <ArrowRight size={20} color="#D4AF37" />
                   </TouchableOpacity>
                </Card>
              ))}
           </View>

           {/* Trend Discovery */}
           <View className="pt-4">
              <Text className="text-lg font-bold text-white flex-row items-center gap-2 mb-4">
                <Search size={20} color="#D4AF37" /> Market Shift Prediction
              </Text>
              <Card className="p-6 bg-black/40 border-white/5">
                 <View className="flex-row justify-between flex-wrap gap-4">
                    {[
                      { label: 'Tempo Trend', value: '140 BPM', status: 'Rising', color: 'primary' },
                      { label: 'Key Vibe', value: 'F Minor', status: 'Stable', color: 'secondary' },
                      { label: 'Style Shift', value: 'Melodic Trap', status: 'Peaking', color: 'success' },
                    ].map((trend, i) => (
                      <View key={i} className="items-center flex-1 min-w-[30%]">
                         <Text className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{trend.label}</Text>
                         <Text className="text-xl font-black text-white mt-1">{trend.value}</Text>
                         <Badge variant="outline" className="mt-2 text-xs"><Text className="text-white">{trend.status}</Text></Badge>
                      </View>
                    ))}
                 </View>
              </Card>
           </View>
        </View>

        {/* Listening Habits */}
        <View className="flex-1 gap-6">
           <Card className="p-6 bg-dark-950 border-white/5">
              <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex-row items-center gap-2">
                 <Headphones size={16} color="#6B7280" /> Sound Profile
              </Text>
              <View className="gap-6">
                 <View>
                    <View className="flex-row justify-between mb-2">
                       <Text className="text-[10px] font-bold uppercase text-gray-400">Aggressive</Text>
                       <Text className="text-[10px] font-bold uppercase text-white">74%</Text>
                    </View>
                    <View className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <View className="h-full bg-secondary w-[74%]" />
                    </View>
                 </View>
                 <View>
                    <View className="flex-row justify-between mb-2">
                       <Text className="text-[10px] font-bold uppercase text-gray-400">Melodic</Text>
                       <Text className="text-[10px] font-bold uppercase text-white">42%</Text>
                    </View>
                    <View className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <View className="h-full bg-primary w-[42%]" />
                    </View>
                 </View>
              </View>
           </Card>

           <Card className="p-6 bg-dark-900 border-white/10">
              <View className="flex-row items-center gap-2 mb-2">
                  <TrendingUp size={24} color="#D4AF37" />
                  <Text className="font-bold text-white">Growth Opportunity</Text>
              </View>
              <Text className="text-xs text-gray-400 leading-relaxed">
                Tracks with <Text className="text-white font-bold">"Cinematic Brass"</Text> are seeing 3x higher license conversion this week. Update your search filters to find these gems first.
              </Text>
           </Card>
        </View>
      </View>
    </ScrollView>
  );
}
