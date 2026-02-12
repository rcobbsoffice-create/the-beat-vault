import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A] items-center justify-center">
      <View className="p-4">
        <Text className="text-[#005CB9] text-4xl font-bold mb-4">
          The Beat Vault
        </Text>
        <Text className="text-white text-lg mb-8">
          React Native Web Migration
        </Text>
        
        <Link href="/marketplace" asChild>
          <TouchableOpacity className="bg-[#005CB9] p-3 rounded-lg">
            <Text className="text-black text-base font-bold text-center">
              Go to Marketplace
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
