import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Platform, useColorScheme } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Search, 
  User, 
  Menu, 
  X,
  LogOut,
  LayoutDashboard,
  Heart,
  ChevronDown
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <View className="bg-dark-950/80 backdrop-blur-lg border-b border-white/10 z-50">
      <SafeAreaView edges={['top']} className="bg-dark-950/80" />
      <View className="max-w-7xl w-full mx-auto px-4 h-16 flex-row items-center justify-between">
        
        {/* Logo */}
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row items-center mr-8">
             <Image 
               source={require('@/assets/logo.png')} 
               style={{ width: 150, height: 35 }} 
               resizeMode="contain"
             />
          </TouchableOpacity>
        </Link>

        {/* Desktop Nav */}
        <View className="hidden md:flex flex-row items-center gap-6">
          <Link href="/marketplace" asChild>
            <TouchableOpacity><Text className="text-gray-300 hover:text-white font-medium">Marketplace</Text></TouchableOpacity>
          </Link>
          <Link href="/producers" asChild>
            <TouchableOpacity><Text className="text-gray-300 hover:text-white font-medium">Producers</Text></TouchableOpacity>
          </Link>
          <Link href="/pricing" asChild>
            <TouchableOpacity><Text className="text-gray-300 hover:text-white font-medium">Licensing</Text></TouchableOpacity>
          </Link>
        </View>

        {/* Search Bar (Hidden on mobile) */}
        <View className="hidden lg:flex flex-1 max-w-xs mx-4 relative">
          <View className="absolute left-3 top-3 z-10">
            <Search size={16} color="#9CA3AF" />
          </View>
          <TextInput 
            placeholder="Search beats..." 
            placeholderTextColor="#94a3b8"
            className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 pl-9 pr-4 text-white text-sm"
          />
        </View>

        {/* Auth Buttons */}
        <View className="hidden md:flex flex-row items-center gap-3">
          {loading ? (
             <View className="w-8 h-8 rounded-full bg-dark-700" />
          ) : user ? (
            <View className="flex-row items-center gap-3">
               <Link href="/dashboard" asChild>
                  <Button variant="ghost" size="sm">Dashboard</Button>
               </Link>
               <TouchableOpacity onPress={() => signOut()}>
                 <LogOut size={20} color="#9CA3AF" />
               </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Link href="/login" asChild>
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup" asChild>
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </View>
          )}
        </View>

        {/* Mobile Menu Button */}
        <TouchableOpacity 
          className="md:hidden p-2"
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          ) : (
            <Menu size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <View className="md:hidden bg-dark-900 border-t border-dark-700 p-4 absolute top-16 left-0 right-0 z-50">
           <View className="flex-col gap-4">
              <Link href="/marketplace" asChild>
                <TouchableOpacity className="py-2 border-b border-dark-800"><Text className="text-white text-lg">Marketplace</Text></TouchableOpacity>
              </Link>
              <Link href="/producers" asChild>
                <TouchableOpacity className="py-2 border-b border-dark-800"><Text className="text-white text-lg">Producers</Text></TouchableOpacity>
              </Link>
              {!user && (
                 <View className="flex-row gap-4 mt-2">
                    <Link href="/login" asChild>
                       <Button variant="ghost" fullWidth className="flex-1">Log In</Button>
                    </Link>
                    <Link href="/signup" asChild>
                       <Button variant="primary" fullWidth className="flex-1">Sign Up</Button>
                    </Link>
                 </View>
              )}
           </View>
        </View>
      )}
    </View>
  );
}
