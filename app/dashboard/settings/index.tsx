import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, Platform } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, Bell, Globe, Camera, Loader2 } from 'lucide-react-native';
import { router } from 'expo-router';

export default function DashboardSettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Security State
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setPreviewUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
        })
        .eq('id', profile.id);

      if (error) throw error;
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error: any) {
      console.error('Save settings error:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      Alert.alert('Check your email', 'Confirmation link sent! Please check both your old and new email addresses.');
      setNewEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update email');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      Alert.alert('Success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <Loader2 size={32} color="#D4AF37" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Account Settings</Text>
        <Text className="text-gray-400">Manage your profile information and preferences</Text>
      </View>

      <View className="gap-8 pb-12">
        {/* Profile Card */}
        <Card className="p-6 bg-dark-900/50 border-white/5">
           <View className="flex-col md:flex-row gap-8 items-start">
              <View className="items-center self-center md:self-start">
                 <View className="w-32 h-32 rounded-3xl bg-dark-800 flex items-center justify-center border-2 border-white/5 overflow-hidden relative mb-4">
                    {previewUrl ? (
                      <Image source={{ uri: previewUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <User size={64} color="#374151" />
                    )}
                 </View>
                 <TouchableOpacity 
                   className="bg-primary px-4 py-2 rounded-xl flex-row items-center gap-2"
                   onPress={() => Alert.alert('Info', 'Avatar upload not implemented yet')}
                 >
                   <Camera size={16} color="#000" />
                   <Text className="text-black font-bold text-xs">Change Photo</Text>
                 </TouchableOpacity>
              </View>

              <View className="flex-1 gap-4 w-full">
                   <Input 
                     label="Display Name" 
                     value={displayName} 
                     onChangeText={setDisplayName}
                   />
                   <Input 
                     label="Email Address" 
                     value={profile?.email || ''} 
                     editable={false}
                     className="opacity-50"
                   />
                   <View>
                     <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Bio</Text>
                     <TextInput 
                      className="border border-white/10 w-full bg-dark-950 rounded-xl p-4 text-white text-sm min-h-[100px]" 
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Tell the world about your sound..."
                      placeholderTextColor="#6B7280"
                      multiline
                      textAlignVertical="top"
                     />
                   </View>
              </View>
           </View>
        </Card>

        {/* Account Details */}
        <Card className="p-6 bg-dark-900/50 border-white/5">
           <Text className="font-bold text-white mb-6 text-lg flex-row items-center gap-2">
              <Mail size={20} color="#D4AF37" /> Account Verification
           </Text>
           <View className="gap-6">
              <View>
                 <Input 
                   label="New Email Address" 
                   placeholder="Enter new email..." 
                   value={newEmail}
                   onChangeText={setNewEmail}
                 />
                 <Text className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">A confirmation link will be sent</Text>
              </View>
              <Button 
                variant="outline" 
                onPress={handleUpdateEmail}
                isLoading={isUpdatingEmail}
              >
                Update Email
              </Button>
           </View>
        </Card>

        {/* Security / Password */}
        <Card className="p-6 bg-dark-900/50 border-white/5">
           <Text className="font-bold text-white mb-6 text-lg flex-row items-center gap-2">
              <Lock size={20} color="#D4AF37" /> Security & Password
           </Text>
           <View className="gap-6">
               <Input 
                 label="Current Password" 
                 placeholder="••••••••" 
                 value={currentPassword}
                 onChangeText={setCurrentPassword}
                 secureTextEntry
               />
               <Input 
                 label="New Password" 
                 placeholder="••••••••" 
                 value={newPassword}
                 onChangeText={setNewPassword}
                 secureTextEntry
               />
               <Button 
                 variant="outline" 
                 onPress={handleUpdatePassword}
                 isLoading={isUpdatingPassword}
               >
                 Update Password
               </Button>
           </View>
        </Card>

        {/* Preferences */}
        <View className="flex-col md:flex-row gap-6">
           <Card className="p-6 bg-dark-900/30 border-white/5 flex-1">
              <View className="flex-row items-center gap-3 mb-6">
                 <Bell size={20} color="#6B7280" />
                 <Text className="font-bold text-white">Notifications</Text>
              </View>
              <View className="gap-4">
                 <View className="flex-row items-center justify-between">
                   <Text className="text-gray-400">Transaction Emails</Text>
                   <View className="w-10 h-5 bg-primary rounded-full justify-center px-1 items-end">
                      <View className="w-3 h-3 bg-black rounded-full" />
                   </View>
                 </View>
                 <View className="flex-row items-center justify-between">
                   <Text className="text-gray-400">Marketing & Tips</Text>
                   <View className="w-10 h-5 bg-dark-800 rounded-full justify-center px-1 items-start">
                      <View className="w-3 h-3 bg-gray-600 rounded-full" />
                   </View>
                 </View>
              </View>
           </Card>

           <Card className="p-6 bg-dark-900/30 border-white/5 flex-1">
              <View className="flex-row items-center gap-3 mb-6">
                 <Globe size={20} color="#6B7280" />
                 <Text className="font-bold text-white">Regional Settings</Text>
              </View>
              <View className="gap-4">
                 <View>
                    <Text className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Currency Display</Text>
                    <View className="bg-dark-950 border border-white/10 rounded-lg p-3">
                       <Text className="text-white text-sm">USD ($)</Text>
                    </View>
                 </View>
              </View>
           </Card>
        </View>

        {/* Footer Actions */}
        <View className="flex-col gap-4 pt-8 border-t border-white/5">
           <Button 
              onPress={handleSaveAll}
              isLoading={isSaving}
              className="h-14 rounded-2xl"
            >
              Save All Changes
           </Button>
           <Button variant="ghost" className="text-red-500">Deactivate Account</Button>
        </View>
      </View>
    </ScrollView>
  );
}
