import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ShoppingBag, 
  Settings, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Truck,
  Package,
  CheckCircle,
  Users,
  Store,
  ArrowRight,
  Loader2
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function AdminMerchPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [printfulStatus, setPrintfulStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Apparel',
    image_url: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('merch_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const { data: producers, error: pError } = await supabase
        .from('producers')
        .select('id, profile_id, printful_store_id, store_slug, profiles(display_name, email)');
      
      const { data: artists, error: aError } = await supabase
        .from('artists')
        .select('id, profile_id, printful_store_id, profiles(display_name, email)');

      if (pError) throw pError;
      if (aError) throw aError;

      const allStores = [
        ...(producers || []).map(p => ({ ...p, role: 'producer' })),
        ...(artists || []).map(a => ({ ...a, role: 'artist' }))
      ];
      setStores(allStores);
    } catch (error: any) {
      console.error('Fetch stores error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const handleCreateStore = async (store: any) => {
    // In a real app, this would call an Edge Function
    Alert.alert('Info', `Provisioning store for ${store.profiles?.display_name}... (Mocked)`);
    // Mock success
    setTimeout(() => {
        Alert.alert('Success', 'Store Created Successfully (Mocked)');
        fetchStores();
    }, 1000);
  };

  const handleSyncPrintful = async () => {
    setSyncing(true);
    // Mocking sync since we don't have the API route
    setTimeout(() => {
        setPrintfulStatus('connected');
        Alert.alert('Success', 'Successfully synced products! (Mocked)');
        setSyncing(false);
        fetchProducts();
    }, 2000);
  };

  const handleDeleteProduct = async (id: string) => {
    Alert.alert(
        "Delete Product",
        "Are you sure you want to delete this product?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: 'destructive', onPress: async () => {
                try {
                  const { error } = await supabase
                    .from('merch_products')
                    .delete()
                    .eq('id', id);

                  if (error) throw error;
                  fetchProducts();
                } catch (error: any) {
                  Alert.alert('Error', 'Failed to delete product: ' + error.message);
                }
            }}
        ]
    );
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
        Alert.alert('Error', 'Name and Price are required.');
        return;
    }
    
    try {
      const { error } = await supabase
        .from('merch_products')
        .insert([{
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?q=80&w=1000&auto=format&fit=crop',
          source: 'custom',
          inventory: 100
        }]);

      if (error) throw error;
      Alert.alert('Success', 'Product added successfully!');
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', category: 'Apparel', image_url: '' });
      fetchProducts();
    } catch (error: any) {
      console.error('Add error:', error);
      Alert.alert('Error', 'Failed to add product: ' + error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      <View className="mb-8">
        <Text className="text-3xl font-black uppercase tracking-tighter italic text-white">Merch Command Center</Text>
        <Text className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs italic">Global logistics and dropshipping oversight</Text>
      </View>

      <View className="flex-row gap-4 mb-8 flex-wrap">
         <Card className="flex-row items-center gap-4 px-6 py-3 bg-white/5 border-white/10 flex-1 min-w-[200px]">
            <View className={`w-3 h-3 rounded-full ${printfulStatus === 'connected' ? 'bg-green-500' : 'bg-dark-600'}`} />
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500">Service Status</Text>
              <Text className="text-sm font-bold text-white uppercase tracking-tighter italic">Printful: {printfulStatus}</Text>
            </View>
         </Card>
         
         <Button 
           className="bg-primary flex-row gap-2 h-14"
           onPress={handleSyncPrintful}
           disabled={syncing}
         >
           {syncing ? <ActivityIndicator size="small" color="#000" /> : <RefreshCw size={16} color="#000" />}
           <Text className="text-black font-black uppercase tracking-widest">Sync Partner API</Text>
         </Button>
      </View>

      <View className="gap-8">
         {/* Logistics Stats */}
         <View className="gap-6">
            <Card className="p-6 bg-dark-900 border-white/5 gap-6">
               <Text className="text-xl font-black uppercase italic tracking-tighter flex-row items-center gap-3 text-white">
                  <Truck size={20} color="#D4AF37" /> Fulfillment Stats
               </Text>
               
               <View className="gap-4">
                  <View className="flex-row items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                     <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Orders</Text>
                     <Text className="text-2xl font-black italic text-white">12</Text>
                  </View>
                  <View className="flex-row items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                     <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg. Shipping</Text>
                     <Text className="text-2xl font-black italic text-white">4.2 Days</Text>
                  </View>
                  <View className="flex-row items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                     <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Logistics Health</Text>
                     <Badge className="bg-green-500 text-black font-black italic"><Text>OPTIMAL</Text></Badge>
                  </View>
               </View>
            </Card>

            <Card className="p-6 border-primary/20 bg-primary/5">
               <Text className="text-sm font-black uppercase italic tracking-widest text-primary mb-2">Automated Inventory</Text>
               <Text className="text-xs text-gray-400 font-medium leading-relaxed">
                 Your Printful catalog is currently managed automatically. New items added to Printful will appear here after syncing.
               </Text>
            </Card>
         </View>

         {/* Partner Stores */}
         <View className="gap-6">
            <View className="flex-row items-center justify-between">
               <Text className="text-2xl font-black uppercase italic tracking-tighter flex-row items-center gap-3 text-white">
                 <Store size={24} color="#D4AF37" /> Partner Stores
               </Text>
               <Badge variant="outline" className="font-bold border-white/10"><Text className="text-white">{stores.length} Accounts</Text></Badge>
            </View>

            <View className="gap-4">
               {stores.map((store) => (
                  <Card key={store.id} className="p-4 bg-dark-900/30 border-white/5 flex-row items-center justify-between">
                     <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                           <Users size={24} color="#D4AF37" />
                        </View>
                        <View>
                           <Text className="font-black italic uppercase tracking-tighter text-white">{store.profiles?.display_name}</Text>
                           <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                             {store.role} • {store.profiles?.email}
                           </Text>
                        </View>
                     </View>

                     <View className="flex-row items-center gap-4">
                        {store.printful_store_id ? (
                           <View className="flex-row items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-xl">
                              <Text className="text-[10px] font-black text-green-500 uppercase tracking-widest">Linked</Text>
                              <View className="w-2 h-2 rounded-full bg-green-500" />
                           </View>
                        ) : (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="border-primary/20"
                             onPress={() => handleCreateStore(store)}
                           >
                             <Text className="text-primary font-black uppercase tracking-widest text-[10px]">Provision</Text>
                           </Button>
                        )}
                     </View>
                  </Card>
               ))}
            </View>
         </View>

         {/* Product Catalog */}
         <View className="gap-6">
            <View className="flex-row items-center justify-between">
               <Text className="text-2xl font-black uppercase italic tracking-tighter flex-row items-center gap-3 text-white">
                 <Package size={24} color="#D4AF37" /> Product Catalog
               </Text>
               <Button 
                 variant="outline" 
                 className="flex-row gap-2 border-white/10"
                 onPress={() => setIsAddModalOpen(true)}
               >
                 <Plus size={16} color="#9CA3AF" /> 
                 <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Add Custom</Text>
               </Button>
            </View>

            <View className="gap-6">
               {products.length === 0 ? (
                 <View className="py-20 items-center bg-dark-900/10 border border-dashed border-white/5 rounded-3xl">
                    <Package size={48} color="#4B5563" className="mb-4" />
                    <Text className="text-gray-600 font-black uppercase tracking-widest text-[10px] italic">Warehouse Empty</Text>
                 </View>
               ) : (
                 products.map((product) => (
                   <Card key={product.id} className="p-6 bg-dark-900/30 border-white/5 overflow-hidden">
                      <View className="flex-row gap-6 items-center">
                         <View className="w-24 h-24 bg-dark-950 rounded-2xl border border-white/5 overflow-hidden">
                            <Image 
                              source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?q=80&w=1000&auto=format&fit=crop' }} 
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                         </View>
                         <View className="flex-1 space-y-1">
                            <View className="flex-row items-center gap-2">
                               <Text className="font-black italic uppercase tracking-tighter text-lg leading-tight text-white mb-1">{product.name}</Text>
                               {product.source === 'printful' && <Badge className="bg-blue-500/10 border-blue-500/20"><Text className="text-blue-500 text-[8px]">PRINTFUL</Text></Badge>}
                            </View>
                            <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.category || 'Apparel'}</Text>
                            <Text className="text-xl font-black italic text-primary mt-2">${product.price}</Text>
                         </View>
                         <Button variant="ghost" onPress={() => handleDeleteProduct(product.id)}>
                            <Trash2 size={20} color="#EF4444" />
                         </Button>
                      </View>

                      <View className="mt-6 pt-6 border-t border-white/5 flex-row items-center justify-between">
                         <View className="flex-row items-center gap-2">
                            <CheckCircle size={12} color="#10B981" />
                            <Text className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">{product.inventory || '∞'} In Stock</Text>
                         </View>
                         <Badge variant="outline" className="bg-green-500/5 border-green-500/10 px-2"><Text className="text-green-500 text-[9px]">LIVE</Text></Badge>
                      </View>
                   </Card>
                 ))
               )}
            </View>
         </View>
      </View>

      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 bg-dark-900 border-white/10 gap-6">
            <Text className="text-2xl font-black uppercase italic tracking-tighter text-white">Add Custom Product</Text>
            
            <View className="gap-4">
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Product Name</Text>
                <TextInput 
                  value={newProduct.name}
                  onChangeText={text => setNewProduct({...newProduct, name: text})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="e.g. Signature Tee"
                  placeholderTextColor="#6B7280"
                />
              </View>
              
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Price ($)</Text>
                  <TextInput 
                    value={newProduct.price}
                    onChangeText={text => setNewProduct({...newProduct, price: text})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    placeholder="29.99"
                    keyboardType="numeric"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Category</Text>
                  <View className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                     <Picker
                        selectedValue={newProduct.category}
                        onValueChange={(itemValue) => setNewProduct({...newProduct, category: itemValue})}
                        style={{ color: 'white' }}
                        dropdownIconColor="white"
                      >
                        <Picker.Item label="Apparel" value="Apparel" />
                        <Picker.Item label="Audio" value="Audio" />
                        <Picker.Item label="Accessories" value="Accessories" />
                        <Picker.Item label="Digital" value="Digital" />
                     </Picker>
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Image URL</Text>
                <TextInput 
                  value={newProduct.image_url}
                  onChangeText={text => setNewProduct({...newProduct, image_url: text})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="https://..."
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            <View className="flex-row gap-4 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-white/5"
                onPress={() => setIsAddModalOpen(false)}
              >
                <Text className="text-gray-500 font-bold uppercase">Cancel</Text>
              </Button>
              <Button 
                className="flex-1 bg-primary"
                onPress={handleAddProduct}
              >
                <Text className="text-black font-black uppercase tracking-widest">Save Product</Text>
              </Button>
            </View>
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
}
