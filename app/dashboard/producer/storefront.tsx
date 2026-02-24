import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, useWindowDimensions } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Store, Palette, Layout, Type, Eye, Save, 
  Grid as GridIcon, List as ListIcon, 
  Shirt, Link as LinkIcon, Trash2, Plus, 
  ArrowRight, X, Check, MousePointer2 
} from 'lucide-react-native';
import { useAuth } from '@/components/providers/AuthProvider';
import { useMerchStore } from '@/stores/merch';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

export default function ProducerStorefrontPage() {
  const { profile } = useAuth();
  const { items: merchItems, isIntegrationConnected, connectedService, setIntegration, addItem } = useMerchStore();
  
  // Storefront Settings State
  const [settings, setSettings] = useState({
    displayName: profile?.display_name || 'Producer Storefront',
    tagline: 'atlanta, ga • trap producer',
    accentColor: '#005CB9', // Gold
    theme: 'midnight-onyx',
    layout: 'grid' as 'grid' | 'list',
    showMerch: true,
    whiteLabel: false,
  });

  const [activeTab, setActiveTab] = useState<'beats' | 'merch'>('beats');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddMerchModalOpen, setIsAddMerchModalOpen] = useState(false);
  
  // New Merch State
  const [newMerchName, setNewMerchName] = useState('');
  const [newMerchPrice, setNewMerchPrice] = useState('');

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  useEffect(() => {
    if (profile?.display_name) {
      setSettings(prev => ({ ...prev, displayName: profile.display_name! }));
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Success', 'Storefront settings saved!');
    }, 1500);
  };

  const handleApplyTheme = (themeId: string) => {
    setSettings(s => ({ ...s, theme: themeId }));
  };

  const handleAddManualMerch = () => {
    if (!newMerchName || !newMerchPrice) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    addItem({
      id: 'm-' + Math.random().toString(36).substr(2, 9),
      name: newMerchName,
      description: 'Hand-crafted merchandise for your fans.',
      price: parseFloat(newMerchPrice),
      category: 'Apparel',
      image_url: 'https://images.unsplash.com/photo-1576566582418-413469b6bde1?w=800&auto=format&fit=crop&q=60',
      on_sale: true,
      source: 'Manual'
    });

    setIsAddMerchModalOpen(false);
    setNewMerchName('');
    setNewMerchPrice('');
    setActiveTab('merch');
    Alert.alert('Success', 'Product added to your store!');
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {/* Header */}
      <View className="mb-8 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Storefront Editor</Text>
          <Text className="text-gray-400">Customize your public marketplace appearance</Text>
        </View>
        <Button onPress={handleSave} isLoading={isSaving} className="flex-row gap-2">
            <Save size={16} color="#000" />
            <Text className="text-black font-bold">Save</Text>
        </Button>
      </View>

      <View className={`flex-col ${isLargeScreen ? 'lg:flex-row' : ''} gap-8`}>
        
        {/* Editor Sidebar */}
        <View className="flex-1 gap-6">
           
           {/* Section: Branding */}
           <Card className="p-6 bg-dark-900/50 border-white/5 space-y-4">
              <Text className="font-bold text-white mb-2 flex-row items-center gap-2">
                 <Type size={16} color="#005CB9" /> Branding
              </Text>
              <Input 
                label="Display Name" 
                value={settings.displayName}
                onChangeText={(val) => setSettings(s => ({ ...s, displayName: val }))}
              />
              <Input 
                label="Tagline / Bio" 
                value={settings.tagline}
                onChangeText={(val) => setSettings(s => ({ ...s, tagline: val }))}
              />
           </Card>

           {/* Section: Visuals */}
           <Card className="p-6 bg-dark-900/50 border-white/5">
              <Text className="font-bold text-white mb-6 flex-row items-center gap-2">
                 <Palette size={16} color="#005CB9" /> Theme & Colors
              </Text>
              
              <View className="gap-4">
                  {[
                    { id: 'midnight-onyx', name: 'Midnight Onyx' },
                    { id: 'solar-gold', name: 'Solar Gold', premium: true }
                  ].map((theme) => (
                    <TouchableOpacity 
                      key={theme.id}
                      onPress={() => !theme.premium && handleApplyTheme(theme.id)}
                      className={`p-4 rounded-xl flex-row items-center justify-between border-2 ${
                        settings.theme === theme.id 
                          ? 'bg-dark-950 border-primary' 
                          : 'bg-dark-800 border-white/5'
                      } ${theme.premium ? 'opacity-50' : ''}`}
                    >
                      <View>
                         <Text className={`font-bold ${settings.theme === theme.id ? 'text-white' : 'text-gray-400'}`}>
                           {theme.name}
                         </Text>
                         {theme.premium && <Text className="text-[10px] text-primary font-bold uppercase">Premium Only</Text>}
                      </View>
                      {settings.theme === theme.id && <Check size={20} color="#005CB9" />}
                    </TouchableOpacity>
                  ))}
              </View>
           </Card>

            {/* Section: Layout */}
            <Card className="p-6 bg-dark-900/50 border-white/5">
               <Text className="font-bold text-white mb-6 flex-row items-center gap-2">
                  <Layout size={16} color="#005CB9" /> Catalog Layout
               </Text>
               <View className="flex-row gap-4">
                  <TouchableOpacity 
                   onPress={() => setSettings(s => ({ ...s, layout: 'grid' }))}
                   className={`flex-1 items-center gap-3 p-4 rounded-xl border-2 ${
                     settings.layout === 'grid' ? 'border-primary bg-primary/5' : 'border-dark-700'
                   }`}
                  >
                     <GridIcon size={24} color={settings.layout === 'grid' ? '#005CB9' : '#6B7280'} />
                     <Text className={`text-xs font-bold uppercase ${settings.layout === 'grid' ? 'text-primary' : 'text-gray-500'}`}>Grid</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                   onPress={() => setSettings(s => ({ ...s, layout: 'list' }))}
                   className={`flex-1 items-center gap-3 p-4 rounded-xl border-2 ${
                     settings.layout === 'list' ? 'border-primary bg-primary/5' : 'border-dark-700'
                   }`}
                  >
                     <ListIcon size={24} color={settings.layout === 'list' ? '#005CB9' : '#6B7280'} />
                     <Text className={`text-xs font-bold uppercase ${settings.layout === 'list' ? 'text-primary' : 'text-gray-500'}`}>List</Text>
                  </TouchableOpacity>
               </View>
            </Card>

            {/* Section: Merchandise Integration */}
            <Card className="p-6 bg-dark-900/50 border-white/5 gap-6">
               <View className="flex-row items-center justify-between">
                 <Text className="font-bold text-white flex-row items-center gap-2">
                    <Shirt size={16} color="#005CB9" /> Merchandise
                 </Text>
                 <TouchableOpacity 
                   onPress={() => setSettings(s => ({ ...s, showMerch: !s.showMerch }))}
                   className={`w-10 h-6 rounded-full ${settings.showMerch ? 'bg-primary' : 'bg-dark-700'} items-center justify-center`}
                 >
                    <View className={`w-4 h-4 bg-white rounded-full absolute ${settings.showMerch ? 'right-1' : 'left-1'}`} />
                 </TouchableOpacity>
               </View>

               {settings.showMerch && (
                  <View className="gap-4">
                    <Text className="text-xs text-gray-500">Sell apparel and accessories directly to your fans.</Text>
                    
                    <Button 
                      variant="ghost" 
                      className="border border-dashed border-dark-700"
                      onPress={() => setIsAddMerchModalOpen(true)}
                    >
                       <Plus size={16} color="#9CA3AF" />
                       <Text className="text-gray-400 ml-2">Add Manual Product</Text>
                    </Button>

                    {merchItems.length > 0 && (
                       <View className="flex-row gap-2 flex-wrap">
                          {merchItems.map(item => (
                             <Badge key={item.id} variant="outline" className="flex-row gap-1">
                                <Text className="text-xs text-white">{item.name}</Text>
                             </Badge>
                          ))}
                       </View>
                    )}
                  </View>
               )}
            </Card>
        </View>

        {/* Live Preview Emulator */}
        {isLargeScreen && (
            <View className="flex-[1.5]">
               <View className="bg-black rounded-[32px] border-4 border-dark-800 overflow-hidden shadow-2xl" style={{ aspectRatio: 9/16, maxHeight: 800 }}>
                  <ScrollView className="flex-1 bg-black">
                     {/* Mock Header */}
                     <View className="h-48 bg-dark-900 justify-end p-6 border-b border-white/10">
                        <View className="w-20 h-20 rounded-full items-center justify-center bg-[#005CB9] mb-4">
                           <Text className="text-3xl font-black text-black">{settings.displayName.charAt(0)}</Text>
                        </View>
                        <Text className="text-2xl font-black text-white">{settings.displayName}</Text>
                        <Text className="text-sm font-medium text-[#005CB9] opacity-80">{settings.tagline}</Text>
                     </View>

                     {/* Mock Tabs */}
                     <View className="flex-row gap-6 px-6 py-4 border-b border-white/10">
                        <Text className={`font-bold ${activeTab === 'beats' ? 'text-white' : 'text-gray-500'}`}>Beats</Text>
                        {settings.showMerch && (
                           <Text className={`font-bold ${activeTab === 'merch' ? 'text-white' : 'text-gray-500'}`}>Merch</Text>
                        )}
                     </View>

                     {/* Mock Content */}
                     <View className="p-4 gap-4">
                        {[1, 2, 3].map(i => (
                           <View key={i} className="bg-dark-900/50 p-3 rounded-xl flex-row gap-3 border border-white/5">
                              <View className="w-12 h-12 bg-dark-800 rounded-lg" />
                              <View className="flex-1 justify-center gap-1">
                                 <View className="w-3/4 h-3 bg-white/10 rounded" />
                                 <View className="w-1/2 h-2 bg-white/5 rounded" />
                              </View>
                           </View>
                        ))}
                     </View>
                  </ScrollView>
               </View>
            </View>
        )}
      </View>

      {/* Add Merch Modal */}
      <Modal visible={isAddMerchModalOpen} transparent animationType="fade">
         <View className="flex-1 bg-black/80 items-center justify-center p-6">
            <Card className="w-full max-w-md bg-dark-900 border-dark-700 p-6">
               <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-white">Add Product</Text>
                  <TouchableOpacity onPress={() => setIsAddMerchModalOpen(false)}>
                     <X size={24} color="#9CA3AF" />
                  </TouchableOpacity>
               </View>
               <View className="gap-4">
                  <Input 
                     label="Product Name" 
                     placeholder="e.g. Vault Logo Tee" 
                     value={newMerchName}
                     onChangeText={setNewMerchName}
                  />
                  <Input 
                     label="Price ($)" 
                     placeholder="29.99" 
                     keyboardType="numeric"
                     value={newMerchPrice}
                     onChangeText={setNewMerchPrice}
                  />
                  <Button onPress={handleAddManualMerch} className="mt-2">
                     Add Product
                  </Button>
               </View>
            </Card>
         </View>
      </Modal>

    </ScrollView>
  );
}
