import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LayoutDashboard, Users, Music, DollarSign, Activity, FileText, Tag } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: '#005CB9' },
    { label: 'Total Beats', value: '567', icon: Music, color: '#60A5FA' },
    { label: 'Revenue', value: '$12.5k', icon: DollarSign, color: '#93C5FD' },
    { label: 'Active Sessions', value: '89', icon: Activity, color: '#9CA3AF' },
  ];

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Control Room</Text>
        <Text className="text-gray-400">Platform overview and management</Text>
      </View>

      <View className="flex-row flex-wrap gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 bg-dark-900/80 border-white/5 flex-1 min-w-[150px]">
            <View className="flex-row items-center gap-3 mb-2">
              <stat.icon size={20} color={stat.color} />
              <Text className="text-gray-400 text-xs font-bold uppercase">{stat.label}</Text>
            </View>
            <Text className="text-2xl font-black text-white">{stat.value}</Text>
          </Card>
        ))}
      </View>

      <Text className="text-xl font-bold text-white mb-4">Quick Actions</Text>
      <View className="gap-3">
        <Link href="/dashboard/admin/users" asChild>
          <TouchableOpacity className="p-4 bg-dark-900/80 rounded-xl border border-white/5 flex-row items-center gap-4">
            <Users size={24} color="#005CB9" />
            <View>
              <Text className="text-white font-bold">Manage Users</Text>
              <Text className="text-gray-400 text-sm">View and edit user profiles and roles</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/dashboard/admin/beats" asChild>
          <TouchableOpacity className="p-4 bg-dark-900/80 rounded-xl border border-white/5 flex-row items-center gap-4">
            <Music size={24} color="#005CB9" />
            <View>
              <Text className="text-white font-bold">Manage Beats</Text>
              <Text className="text-gray-400 text-sm">Review uploaded content and metadata</Text>
            </View>
          </TouchableOpacity>
        </Link>
         <Link href="/dashboard/admin/editorial" asChild>
          <TouchableOpacity className="p-4 bg-dark-900/80 rounded-xl border border-white/5 flex-row items-center gap-4">
            <FileText size={24} color="#005CB9" />
            <View>
              <Text className="text-white font-bold">Editorial Content</Text>
              <Text className="text-gray-400 text-sm">Manage blog posts and newsletters</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/dashboard/admin/genres" asChild>
          <TouchableOpacity className="p-4 bg-dark-900/80 rounded-xl border border-white/5 flex-row items-center gap-4">
            <Tag size={24} color="#005CB9" />
            <View>
              <Text className="text-white font-bold">Genre Management</Text>
              <Text className="text-gray-400 text-sm">Review proposals and manage DNA labels</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}
