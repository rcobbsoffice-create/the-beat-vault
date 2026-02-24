import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Music, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Signup() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'artist' | 'producer'>('artist');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, displayName, role);
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <View className="w-full max-w-md mx-auto">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-8">
            <ArrowLeft size={20} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2 text-base">Back to home</Text>
          </TouchableOpacity>

          <View className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
             <View className="items-center mb-6">
              <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center mb-2">
                <Music size={24} color="#000" />
              </View>
              <Text className="text-2xl font-bold text-white">Create Account</Text>
            </View>

            <View className="gap-4">
              {error ? (
                <View className="p-3 rounded-lg bg-red-900/20 border border-red-900/30">
                  <Text className="text-red-400 text-sm text-center">{error}</Text>
                </View>
              ) : null}

              {/* Role Selection */}
              <View className="flex-row gap-4 mb-2">
                <TouchableOpacity 
                  // @ts-ignore
                  className={`flex-1 p-3 rounded-lg border ${role === 'artist' ? 'bg-primary/10 border-primary' : 'bg-dark-800 border-dark-700'}`}
                  onPress={() => setRole('artist')}
                >
                  <Text className={`text-center font-medium ${role === 'artist' ? 'text-primary' : 'text-gray-400'}`}>Artist</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  // @ts-ignore
                  className={`flex-1 p-3 rounded-lg border ${role === 'producer' ? 'bg-primary/10 border-primary' : 'bg-dark-800 border-dark-700'}`}
                  onPress={() => setRole('producer')}
                >
                   <Text className={`text-center font-medium ${role === 'producer' ? 'text-primary' : 'text-gray-400'}`}>Producer</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Display Name"
                placeholder="Your Name"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button 
                onPress={handleSignUp} 
                fullWidth 
                isLoading={loading}
                className="mt-4"
              >
                Sign Up
              </Button>
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400 text-sm">Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-bold">Log in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
