import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Instagram, Twitter, Youtube } from 'lucide-react-native';

export function Footer() {
  return (
    <View className="relative z-10 bg-dark-950 border-t border-white/10 py-12 mt-auto">
      <View className="max-w-7xl mx-auto px-4 w-full">
        <View className="flex-col md:flex-row flex-wrap gap-8 justify-between">
          
          {/* Brand */}
          <View className="flex-1 min-w-[200px] space-y-4">
            <Link href="/" asChild>
              <TouchableOpacity className="flex-row items-center">
                 <Text className="text-primary font-bold text-xl tracking-wider">AUDIO</Text>
                 <Text className="text-white font-bold text-xl tracking-wider">GENES</Text>
              </TouchableOpacity>
            </Link>
            <Text className="text-gray-400 text-sm mt-4">
              The premier marketplace for rights-locked music assets.
              Empowering creators with secure distribution and licensing solutions.
            </Text>
            <View className="flex-row items-center gap-4 mt-4">
              <TouchableOpacity><Instagram size={20} color="#9CA3AF" /></TouchableOpacity>
              <TouchableOpacity><Twitter size={20} color="#9CA3AF" /></TouchableOpacity>
              <TouchableOpacity><Youtube size={20} color="#9CA3AF" /></TouchableOpacity>
            </View>
          </View>

          {/* Marketplace */}
          <View className="min-w-[150px]">
            <h4 className="font-semibold text-white mb-4">Marketplace</h4>
            <View className="gap-2">
              <Link href="/marketplace" asChild>
                <TouchableOpacity><Text className="text-gray-400 text-sm">Browse Beats</Text></TouchableOpacity>
              </Link>
              <Link href="/producers" asChild>
                <TouchableOpacity><Text className="text-gray-400 text-sm">Find Producers</Text></TouchableOpacity>
              </Link>
              <Link href="/pricing" asChild>
                <TouchableOpacity><Text className="text-gray-400 text-sm">Licensing Info</Text></TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* For Producers */}
          <View className="min-w-[150px]">
             <h4 className="font-semibold text-white mb-4">For Producers</h4>
             <View className="gap-2">
               <Link href="/sell" asChild>
                 <TouchableOpacity><Text className="text-gray-400 text-sm">Sell Your Beats</Text></TouchableOpacity>
               </Link>
               <Link href="/signup?role=producer" asChild>
                 <TouchableOpacity><Text className="text-gray-400 text-sm">Become a Seller</Text></TouchableOpacity>
               </Link>
               <Link href="/support" asChild>
                 <TouchableOpacity><Text className="text-gray-400 text-sm">Help Center</Text></TouchableOpacity>
               </Link>
             </View>
          </View>

          {/* Company */}
          <View className="min-w-[150px]">
             <h4 className="font-semibold text-white mb-4">Company</h4>
             <View className="gap-2">
               <Link href="/about" asChild>
                 <TouchableOpacity><Text className="text-gray-400 text-sm">About Us</Text></TouchableOpacity>
               </Link>
               <Link href="/terms" asChild>
                 <TouchableOpacity><Text className="text-gray-400 text-sm">Terms of Service</Text></TouchableOpacity>
               </Link>
               <Link href="/privacy" asChild>
                 <TouchableOpacity><Text className="text-gray-400 text-sm">Privacy Policy</Text></TouchableOpacity>
               </Link>
             </View>
          </View>
        </View>

        {/* Bottom */}
        <View className="mt-12 pt-8 border-t border-white/5 flex-col md:flex-row items-center justify-between gap-4">
          <Text className="text-gray-500 text-xs">
            © {new Date().getFullYear()} AudioGenes. All rights reserved.
          </Text>
          <Text className="text-gray-500 text-xs">
            Made with 💜 for music creators
          </Text>
        </View>
      </View>
    </View>
  );
}
