import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  ShieldCheck,
  Zap,
  TrendingUp 
} from 'lucide-react-native';

interface SplitParty {
  name: string;
  role: string;
  percentage: number;
  amount?: string;
  status: 'pending' | 'settled';
}

interface SplitTreeProps {
  totalAmount: string;
  parties: SplitParty[];
}

export function SplitTree({ totalAmount, parties }: SplitTreeProps) {
  return (
    <View className="space-y-8 py-4">
      {/* Total Source */}
      <View className="items-center">
        <View className="bg-primary/10 border border-primary/20 p-6 rounded-3xl items-center relative z-10">
          <Badge className="mb-2 bg-primary">
            <Text className="text-black font-bold">Revenue Source</Text>
          </Badge>
          <Text className="text-3xl font-bold text-white">${totalAmount}</Text>
          <Text className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold text-center">Gross Sale</Text>
        </View>
        
        {/* Connector Line (Vertical) */}
        <View className="w-[1px] h-12 bg-primary/30" />
      </View>

      {/* Distribution List/Grid */}
      <View className="flex-row flex-wrap justify-center gap-6">
        {parties.map((party, index) => (
          <View key={index} className="w-full md:w-[250px] items-center">
            {/* Vertical Connector Line */}
            <View className="w-[1px] h-8 bg-primary/20" />
            
            <Card className="p-4 bg-dark-900 border-white/5 w-full overflow-hidden">
               <View className="flex-row items-center gap-3 mb-3">
                 <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/5">
                    <User size={20} color="#005CB9" />
                 </View>
                 <View className="flex-1">
                    <Text className="font-bold text-white text-sm" numberOfLines={1}>{party.name}</Text>
                    <Text className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{party.role}</Text>
                 </View>
               </View>

               <View className="flex-row items-end justify-between border-t border-white/5 pt-3">
                 <View>
                    <Text className="text-[10px] text-gray-600 mb-0.5 uppercase font-bold">Earnings</Text>
                    <Text className="text-lg font-bold text-white">{party.percentage}%</Text>
                 </View>
                 <View className="items-end">
                    <Text className="text-primary text-sm font-bold">${party.amount || '0.00'}</Text>
                    <Badge variant={party.status === 'settled' ? 'secondary' : 'default'} className="mt-1">
                      <Text className="text-[9px] h-4">{party.status}</Text>
                    </Badge>
                 </View>
               </View>
            </Card>
          </View>
        ))}
      </View>

      {/* Workflow Legend */}
      <View className="flex-row flex-wrap justify-center gap-8 pt-8 border-t border-white/5">
         <View className="flex-row items-center gap-2">
            <ShieldCheck size={12} color="#005CB9" />
            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rights Protected</Text>
         </View>
         <View className="flex-row items-center gap-2">
            <Zap size={12} color="#005CB9" />
            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Automated Split</Text>
         </View>
         <View className="flex-row items-center gap-2">
            <TrendingUp size={12} color="#005CB9" />
            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time Settlement</Text>
         </View>
      </View>
    </View>
  );
}
