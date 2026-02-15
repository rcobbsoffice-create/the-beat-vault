import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Check, Info } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

const LICENSES = [
  {
    name: 'Basic License',
    price: 49.99,
    description: 'Perfect for demos and non-profit projects.',
    features: [
      'MP3 (320kbps) file',
      'Non-Profit Use Only',
      '10,000 Streams Limit',
      'No Radio Airplay',
      'Instant Download'
    ],
    recommended: false
  },
  {
    name: 'Premium License',
    price: 119.99,
    description: 'Standard for professional artists and streaming.',
    features: [
      'WAV + MP3 files',
      'Commercial Use',
      '500,000 Streams Limit',
      'Radio Airplay Allowed',
      'Trackout Stems (Optional)'
    ],
    recommended: true
  },
  {
    name: 'Exclusive Rights',
    price: 899.99,
    description: 'Full ownership and unlimited rights.',
    features: [
      'All File Formats (WAV, MP3, Stems)',
      'Unlimited Commercial Use',
      'Unlimited Streams',
      'Full Ownership Transfer',
      'Beat Removed from Store'
    ],
    recommended: false
  }
];

export default function PricingPage() {
  return (
    <ScrollView className="flex-1 bg-dark-950">
      <View className="py-20 px-4 relative">
        {/* Background Ambience */}
        <View className="absolute top-0 left-0 right-0 h-full bg-primary/5 rounded-full blur-3xl opacity-30" />

        <View className="max-w-7xl mx-auto w-full relative z-10">
          <View className="items-center mb-16">
            <Text className="text-4xl font-bold text-white mb-6 text-center">
              Simple, Transparent <Text className="text-primary">Pricing</Text>
            </Text>
            <Text className="text-lg text-gray-400 max-w-2xl text-center">
              Choose the license that fits your needs. Upgrade at any time by paying the difference.
            </Text>
          </View>

          <View className="flex-col lg:flex-row gap-8 max-w-6xl mx-auto items-center">
            {LICENSES.map((license, index) => (
              <View 
                key={index}
                className={`relative rounded-3xl p-8 bg-dark-900 border transition-all w-full lg:flex-1 ${
                  license.recommended 
                    ? 'border-primary shadow-2xl scale-105 z-10' 
                    : 'border-white/5'
                }`}
              >
                {license.recommended && (
                  <View className="absolute -top-4 left-1/2 -ml-16 bg-primary px-6 py-1.5 rounded-full shadow-lg">
                    <Text className="text-black font-bold text-xs">Most Popular</Text>
                  </View>
                )}

                <View className="items-center mb-8 border-b border-white/5 pb-8">
                  <Text className={`text-xl font-bold mb-4 ${license.recommended ? 'text-primary' : 'text-white'}`}>
                    {license.name}
                  </Text>
                  <View className="flex-row items-baseline justify-center gap-1 mb-2">
                    <Text className="text-5xl font-bold text-white">${Math.floor(license.price)}</Text>
                    <Text className="text-xl text-gray-400">.99</Text>
                  </View>
                  <Text className="text-gray-500 text-sm">{license.description}</Text>
                </View>

                <View className="gap-4 mb-10">
                  {license.features.map((feature, i) => (
                    <View key={i} className="flex-row items-start gap-3">
                      <View className={`p-1 rounded-full shrink-0 ${license.recommended ? 'bg-primary/20' : 'bg-white/5'}`}>
                        <Check size={12} color={license.recommended ? '#005CB9' : '#9CA3AF'} />
                      </View>
                      <Text className="text-gray-300 text-sm flex-1">{feature}</Text>
                    </View>
                  ))}
                </View>

                <Link href="/signup?role=artist" asChild>
                  <Button 
                    fullWidth 
                    size="lg"
                    variant={license.recommended ? 'primary' : 'outline'}
                    className={license.recommended ? '' : 'border-white/10'}
                  >
                    Choose {license.name.split(' ')[0]}
                  </Button>
                </Link>
              </View>
            ))}
          </View>

          <View className="mt-20 items-center">
            <View className="flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 max-w-3xl w-full">
              <View className="p-3 bg-primary/10 rounded-full">
                 <Info size={32} color="#005CB9" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-white text-lg mb-1">How Licensing Works</Text>
                <Text className="text-gray-400 leading-relaxed text-sm">
                  When you purchase a license, you are buying the rights to use the beat for a specific purpose (like recording a song). 
                  You do not own the beat unless you purchase "Exclusive Rights". 
                  Most licenses are non-exclusive, meaning other artists can lease the same beat.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View className="h-20" />
    </ScrollView>
  );
}
