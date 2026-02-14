import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LayoutDashboard, 
  Layout,
  Upload, 
  Music, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Store,
  Users,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  ShoppingBag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Mail,
  History,
  Activity
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/stores/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

/* 
  Adaptation Note: 
  - Using lucide-react-native
  - Handling mobile/desktop responsive logic with useWindowDimensions
  - Replacing web specific elements (div, button, img) with View, TouchableOpacity, Image
*/

export function DashboardSidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  // Auto-collapse logic for smaller screens
  useEffect(() => {
    if (!isLargeScreen) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [width]);

  const links = {
    producer: [
      { name: 'My Catalog', href: '/dashboard/producer/beats', icon: LayoutDashboard },
      { name: 'Upload Beat', href: '/dashboard/producer/upload', icon: Upload, highlight: true },
      { name: 'Sales & Revenue', href: '/dashboard/producer/sales', icon: DollarSign },
      { name: 'Analytics', href: '/dashboard/producer/analytics', icon: BarChart3 },
      { name: 'Rights Shield', href: '/dashboard/settings/whitelist', icon: ShieldCheck },
      { name: 'Storefront', href: '/dashboard/producer/storefront', icon: Store },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    artist: [
      { name: 'My Library', href: '/dashboard/artist/library', icon: LayoutDashboard },
      { name: 'My Insights', href: '/dashboard/artist/insights', icon: BrainCircuit },
      { name: 'Tell Your Story', href: '/dashboard/artist/questionnaire', icon: Sparkles, highlight: true },
      { name: 'Music Distribution', href: '/dashboard/artist/distribution', icon: Music },
      { name: 'Rights Shield', href: '/dashboard/settings/whitelist', icon: ShieldCheck },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    admin: [
      { name: 'Control Room', href: '/dashboard/admin', icon: LayoutDashboard },
      { name: 'Editorial', href: '/dashboard/admin/editorial', icon: Layout },
      { name: 'Story Queue', href: '/dashboard/admin/editorial/questionnaire', icon: History },
      { name: 'Campaigns', href: '/dashboard/admin/newsletters', icon: Mail },
      { name: 'Merch Hub', href: '/dashboard/admin/merch', icon: ShoppingBag },
      { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
      { name: 'Fingerprinting', href: '/dashboard/admin/fingerprinting', icon: Activity },
      { name: 'Artists', href: '/dashboard/admin/artists', icon: ShieldCheck },
      { name: 'Beats', href: '/dashboard/admin/beats', icon: Music },
      { name: 'Users', href: '/dashboard/admin/users', icon: Users },
      { name: 'Revenue', href: '/dashboard/admin/revenue', icon: DollarSign },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  };

  const role = (profile?.role as keyof typeof links) || 'artist';
  // Fallback to artist links if role isn't recognized or links[role] is undefined
  const currentLinks = links[role] || links.artist;

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  // If on mobile and menu is closed, show nothing (except trigger which is handled in Layout usually, 
  // but here we might render it floating if needed, or rely on a parent layout to pass trigger)
  // For this port, we'll include the mobile sticky toggle here or assume layout handles it.
  // We'll mimic the web behavior: Fixed position sidebar on desktop, floating menu on mobile.

  if (!isLargeScreen && !isMobileMenuOpen) {
    return (
      <TouchableOpacity 
        onPress={() => setIsMobileMenuOpen(true)}
        className="absolute bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-2xl items-center justify-center"
      >
        <Menu size={24} color="#000" />
      </TouchableOpacity>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isLargeScreen && isMobileMenuOpen && (
        <TouchableOpacity 
          className="absolute inset-0 bg-black/60 z-30"
          onPress={() => setIsMobileMenuOpen(false)}
          activeOpacity={1}
        />
      )}

      <View className={`bg-dark-900 border-r border-white/5 flex-col absolute top-0 bottom-0 z-40 transition-all duration-300 ${
        isLargeScreen 
          ? (isSidebarCollapsed ? 'w-20' : 'w-64') 
          : 'w-64'
      } ${
        !isLargeScreen && !isMobileMenuOpen ? '-left-64' : 'left-0'
      }`}>
        <SafeAreaView edges={['top', 'bottom']} className="flex-1">
          {/* Toggle Button (Desktop Only) */}
          {isLargeScreen && (
            <TouchableOpacity 
              onPress={toggleSidebar}
              className="absolute -right-3 top-6 w-6 h-6 bg-dark-800 border border-white/10 rounded-full items-center justify-center z-50"
            >
              {isSidebarCollapsed ? <ChevronRight size={12} color="#9CA3AF" /> : <ChevronLeft size={12} color="#9CA3AF" />}
            </TouchableOpacity>
          )}

           {/* Mobile Close Button */}
           {!isLargeScreen && (
            <TouchableOpacity 
              onPress={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 p-2 z-50"
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* User Info */}
          <View className={`p-6 border-b border-white/5 ${isSidebarCollapsed && isLargeScreen ? 'items-center px-0' : ''}`}>
            <View className={`flex-row items-center gap-3 ${isSidebarCollapsed && isLargeScreen ? 'justify-center' : ''}`}>
              <View className="w-10 h-10 rounded-full bg-dark-800 overflow-hidden items-center justify-center border border-white/10">
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                ) : (
                  <View className="w-full h-full bg-primary items-center justify-center">
                    <Text className="font-bold text-black">{profile?.display_name?.charAt(0).toUpperCase() || 'U'}</Text>
                  </View>
                )}
              </View>
              
              {(!isSidebarCollapsed || !isLargeScreen) && (
                <View className="flex-1">
                  <Text className="font-bold text-white text-sm" numberOfLines={1}>
                    {profile?.display_name || 'Loading...'}
                  </Text>
                  <Text className="text-[10px] text-primary uppercase tracking-wider font-bold">
                    {profile?.role || 'Guest'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Navigation */}
          <ScrollView className="flex-1 p-4">
            <View className="gap-2">
              {currentLinks.map((link) => {
                const isActive = pathname === link.href; // Simple exact match for now, maybe use startsWith for sub-routes
                const Icon = link.icon;
                
                return (
                  <Link href={link.href as any} key={link.href} asChild>
                    <TouchableOpacity 
                      className={`flex-row items-center rounded-xl transition-all ${
                        isSidebarCollapsed && isLargeScreen ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                      } ${
                        isActive 
                          ? 'bg-primary' 
                          : link.highlight 
                            ? 'bg-white/5 border border-primary/20' 
                            : ''
                      }`}
                    >
                      <Icon 
                        size={20} 
                        color={isActive ? '#000' : link.highlight ? '#005CB9' : '#9CA3AF'} 
                      />
                      {(!isSidebarCollapsed || !isLargeScreen) && (
                        <Text className={`font-medium ml-2 ${
                          isActive ? 'text-black font-bold' : 'text-gray-400'
                        }`}>
                          {link.name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Link>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-4 border-t border-white/5 bg-dark-900/50">
            <TouchableOpacity 
              onPress={() => signOut()}
              className={`flex-row items-center rounded-xl transition-all hover:bg-red-500/10 ${
                 isSidebarCollapsed && isLargeScreen ? 'justify-center p-3' : 'gap-3 px-4 py-3'
              }`}
            >
              <LogOut size={20} color="#9CA3AF" />
              {(!isSidebarCollapsed || !isLargeScreen) && (
                <Text className="text-gray-400 font-medium ml-2">Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
