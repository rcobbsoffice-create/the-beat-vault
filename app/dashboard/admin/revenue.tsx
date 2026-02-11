import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react-native';

export default function AdminRevenuePage() {
  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Platform Revenue</Text>
          <Text className="text-gray-400">Financial overview and commission tracking</Text>
        </View>
        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-row gap-2">
            <Calendar size={16} color="#fff" />
            <Text className="text-white font-bold text-xs">Last 30 Days</Text>
          </Button>
          <Button className="bg-primary flex-row gap-2">
            <Download size={16} color="#000" />
            <Text className="text-black font-bold text-xs">Export CSV</Text>
          </Button>
        </View>
      </View>

      {/* Financial Stats */}
      <View className="gap-6 mb-8">
        <Card className="p-8 bg-dark-900 border-white/5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="p-3 rounded-2xl bg-green-500/10">
              <DollarSign size={24} color="#10B981" />
            </View>
            <Badge variant="outline" className="bg-green-500/20"><Text className="text-green-500 font-bold text-xs">+12.5%</Text></Badge>
          </View>
          <Text className="text-sm text-gray-500 uppercase tracking-wider font-bold">Gross Volume</Text>
          <Text className="text-4xl font-black text-white mt-1">$428,950.40</Text>
          <View className="mt-4 flex-row items-center gap-2">
            <TrendingUp size={12} color="#10B981" />
            <Text className="text-xs text-gray-400">Up from $381,240 last month</Text>
          </View>
        </Card>

        <Card className="p-8 bg-dark-900 border-white/5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="p-3 rounded-2xl bg-primary/10">
              <Activity size={24} color="#D4AF37" />
            </View>
            <Badge variant="outline" className="bg-primary/20"><Text className="text-primary font-bold text-xs">15% Fee</Text></Badge>
          </View>
          <Text className="text-sm text-gray-500 uppercase tracking-wider font-bold">Platform Earnings</Text>
          <Text className="text-4xl font-black text-white mt-1">$64,342.56</Text>
          <View className="mt-4 flex-row items-center gap-2">
            <ArrowUpRight size={12} color="#D4AF37" />
            <Text className="text-xs text-gray-400">Net profit after processing</Text>
          </View>
        </Card>

        <Card className="p-8 bg-dark-900 border-white/5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="p-3 rounded-2xl bg-blue-500/10">
              <BarChart3 size={24} color="#3B82F6" />
            </View>
            <Badge variant="outline" className="bg-white/5"><Text className="text-gray-400 font-bold text-xs">Daily Avg</Text></Badge>
          </View>
          <Text className="text-sm text-gray-500 uppercase tracking-wider font-bold">Average Transaction</Text>
          <Text className="text-4xl font-black text-white mt-1">$42.50</Text>
          <View className="mt-4 flex-row items-center gap-2">
            <ArrowDownRight size={12} color="#EF4444" />
            <Text className="text-xs text-gray-400">Down 2% from last week</Text>
          </View>
        </Card>
      </View>

      {/* Transaction History Placeholder */}
      <Card className="p-12 items-center justify-center border-dashed border-white/10 bg-transparent">
        <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
          <TrendingUp size={32} color="#4B5563" />
        </View>
        <Text className="text-xl font-bold text-white mb-2">Detailed Reports</Text>
        <Text className="text-gray-500 text-center max-w-sm">
          Transaction history and detailed breakdown are being calculated. Check back in a few minutes for real-time data.
        </Text>
      </Card>
    </ScrollView>
  );
}
