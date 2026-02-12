import { View } from 'react-native';
import { Slot } from 'expo-router';
import { Header } from '@/components/Header';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import "../global.css";

export default function Layout() {
  const { colorScheme } = useColorScheme();
  
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View className="flex-1 bg-white dark:bg-dark-950">
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Header />
          <Slot />
          <AudioPlayer />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
