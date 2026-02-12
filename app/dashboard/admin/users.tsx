import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Users, Search, MoreVertical, Shield, ShieldAlert, Trash2 } from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';

export default function AdminUsersPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator color="#005CB9" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">User Management</Text>
          <Text className="text-gray-400">Total Users: {users.length}</Text>
        </View>
      </View>

      <View className="gap-4">
        {users.map((u) => (
          <View key={u.id} className="bg-dark-900 border border-white/5 p-4 rounded-xl flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-dark-800 items-center justify-center">
                <Users size={20} color="#6B7280" />
              </View>
              <View>
                <Text className="text-white font-bold">{u.display_name || 'Anonymous'}</Text>
                <Text className="text-gray-500 text-xs">{u.email || 'No email'}</Text>
              </View>
            </View>
            
            <View className="flex-row items-center gap-3">
              <Badge variant={u.role === 'admin' ? 'primary' : 'outline'}>{u.role}</Badge>
              <TouchableOpacity>
                <MoreVertical size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
