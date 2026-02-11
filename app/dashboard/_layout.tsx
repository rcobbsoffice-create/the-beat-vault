import React from 'react';
import { View, Platform } from 'react-native';
import { Slot } from 'expo-router';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useUI } from '@/stores/ui';
import { useWindowDimensions } from 'react-native';

export default function DashboardLayout() {
  const { isSidebarCollapsed } = useUI();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  return (
    <View className="flex-1 flex-row bg-dark-950">
      {/* Sidebar - Positioned absolutely on mobile, valid component on desktop */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <View 
        className={`flex-1 transition-all duration-300 ${
          isLargeScreen 
            ? (isSidebarCollapsed ? 'ml-20' : 'ml-64') 
            : ''
        }`}
      >
        <Slot />
      </View>
    </View>
  );
}
