import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Link, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Music, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    
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
          {/* Back Link */}
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-8">
            <ArrowLeft size={20} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2 text-base">Back to home</Text>
          </TouchableOpacity>

          {/* Card */}
          <View className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
            {/* Logo */}
            <View className="items-center mb-8">
              <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center mb-2">
                <Music size={24} color="#000" />
              </View>
              <Text className="text-2xl font-bold text-white">AudioGenes</Text>
            </View>

            <Text className="text-2xl font-bold text-white text-center mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-400 text-center mb-8">
              Sign in to your account
            </Text>

            <View className="gap-4">
              {error ? (
                <View className="p-3 rounded-lg bg-red-900/20 border border-red-900/30">
                  <Text className="text-red-400 text-sm text-center">{error}</Text>
                </View>
              ) : null}

              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View>
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Link href="/forgot-password" asChild>
                  <TouchableOpacity className="self-end mt-2">
                    <Text className="text-sm text-primary">Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <Button 
                onPress={handleSignIn} 
                fullWidth 
                isLoading={loading}
                className="mt-4"
              >
                Sign In
              </Button>
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400 text-sm">Don't have an account? </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-bold">Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
