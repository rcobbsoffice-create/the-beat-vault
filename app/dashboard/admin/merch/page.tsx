'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ShoppingBag, 
  Settings, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Box, 
  Truck,
  CreditCard,
  Loader2,
  AlertTriangle,
  Package,
  CheckCircle2,
  Users,
  Store,
  ArrowRight
} from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

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
      toast.error(error.message);
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
    const toastId = toast.loading(`Creating Printful store for ${store.profiles?.display_name}...`);
    try {
      const { data, error } = await supabase.functions.invoke('create-printful-store', {
        body: { 
          profile_id: store.profile_id, 
          role: store.role,
          display_name: store.profiles?.display_name 
        }
      });

      if (error) throw error;
      
      toast.success('Store Created Successfully!', { id: toastId });
      fetchStores();
    } catch (error: any) {
      console.error('Create store error:', error);
      toast.error('Failed to create store: ' + error.message, { id: toastId });
    }
  };

  const handleSyncPrintful = async () => {
    setSyncing(true);
    const toastId = toast.loading('Syncing products from Printful...');
    try {
      const response = await fetch('/api/admin/merch/sync', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Sync failed');

      setPrintfulStatus('connected');
      toast.success(`Successfully synced ${result.count} products!`, { id: toastId });
      fetchProducts();
    } catch (error: any) {
      console.error('Sync error:', error);
      setPrintfulStatus('error');
      toast.error('Sync Failed: ' + error.message, { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('merch_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product: ' + error.message);
    }
  };

  const handleEditProduct = (product: any) => {
    toast('Edit functionality coming soon!', { icon: '⚙️' });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Adding custom product...');
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
      toast.success('Product added successfully!', { id: toastId });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', category: 'Apparel', image_url: '' });
      fetchProducts();
    } catch (error: any) {
      console.error('Add error:', error);
      toast.error('Failed to add product: ' + error.message, { id: toastId });
    }
  };



  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Merch Command Center</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs italic">Global logistics and dropshipping oversight</p>
        </div>

        <div className="flex flex-wrap gap-4">
           <Card className="flex items-center gap-4 px-6 py-3 bg-white/5 border-white/10">
              <div className={`w-3 h-3 rounded-full animate-pulse ${printfulStatus === 'connected' ? 'bg-success' : 'bg-dark-600'}`} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Service Status</p>
                <p className="text-sm font-bold text-white uppercase tracking-tighter italic">Printful: {printfulStatus}</p>
              </div>
           </Card>
           
           <Button 
             className="bg-primary text-black font-black uppercase tracking-widest h-14 px-8 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95"
             onClick={handleSyncPrintful}
             disabled={syncing}
           >
             {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
             Sync Partner API
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Logistics Stats */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5 space-y-8">
              <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                 <Truck className="w-5 h-5 text-primary" /> Fulfillment Stats
              </h3>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Orders</span>
                    <span className="text-2xl font-black italic">12</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg. Shipping</span>
                    <span className="text-2xl font-black italic">4.2 Days</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Logistics Health</span>
                    <Badge className="bg-success text-black font-black italic">OPTIMAL</Badge>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Supported Partners</p>
                <div className="flex gap-4 opacity-30 grayscale">
                   <div className="w-10 h-10 bg-white rounded-lg p-2" />
                   <div className="w-10 h-10 bg-white rounded-lg p-2" />
                   <div className="w-10 h-10 bg-white rounded-lg p-2" />
                </div>
              </div>
           </Card>

           <Card className="p-8 border-primary/20 bg-primary/5">
              <h4 className="text-sm font-black uppercase italic tracking-widest text-primary mb-2">Automated Inventory</h4>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Your Printful catalog is currently managed automatically. New items added to Printful will appear in your 'Drafts' section within 5 minutes of syncing.
              </p>
           </Card>
        </div>

        {/* Right Column: Product Management & Stores */}
        <div className="lg:col-span-2 space-y-12">
           {/* Section 1: Partner Stores */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                   <Store className="w-6 h-6 text-primary" /> Partner Stores
                 </h2>
                 <Badge variant="outline" className="font-bold border-white/10">{stores.length} Accounts</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {stores.map((store) => (
                    <Card key={store.id} className="p-4 bg-dark-900/30 border-white/5 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                             <Users className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-black italic uppercase tracking-tighter">{store.profiles?.display_name}</h4>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                               {store.role} • {store.profiles?.email}
                             </p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4">
                          {store.printful_store_id ? (
                             <div className="flex items-center gap-2 px-4 py-2 bg-success/5 border border-success/10 rounded-xl">
                                <span className="text-[10px] font-black text-success uppercase tracking-widest">ID: {store.printful_store_id}</span>
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                             </div>
                          ) : (
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black"
                               onClick={() => handleCreateStore(store)}
                             >
                               Provision Store
                             </Button>
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                       </div>
                    </Card>
                 ))}
              </div>
           </div>

           {/* Section 2: Product Catalog */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                   <Package className="w-6 h-6 text-primary" /> Product Catalog
                 </h2>
                 <Button 
                   variant="outline" 
                   className="gap-2 border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all"
                   onClick={() => setIsAddModalOpen(true)}
                 >
                   <Plus className="w-4 h-4" /> Add Custom Product
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {products.length === 0 ? (
                   <div className="col-span-full py-20 text-center bg-dark-900/10 border border-dashed border-white/5 rounded-[4rem]">
                      <Package className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-black uppercase tracking-widest text-[10px] italic">Warehouse Empty</p>
                   </div>
                 ) : (
                   products.map((product) => (
                     <Card key={product.id} className="p-6 bg-dark-900/30 border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-bl-2xl">
                           <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                                className="p-2 text-gray-400 hover:text-white transition-colors relative z-10"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                className="p-2 text-gray-400 hover:text-error transition-colors relative z-10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>


                        <div className="flex gap-6 items-center">
                           <div className="w-24 h-24 bg-dark-950 rounded-2xl border border-white/5 overflow-hidden">
                              <img 
                                src={product.image_url || 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?q=80&w=1000&auto=format&fit=crop'} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?q=80&w=1000&auto=format&fit=crop';
                                }}
                              />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <h3 className="font-black italic uppercase tracking-tighter text-lg leading-tight">{product.name}</h3>
                                 {product.source === 'printful' && <Badge className="bg-blue-500/10 text-blue-500 text-[8px] border-blue-500/20">PRINTFUL</Badge>}
                              </div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.category || 'Apparel'}</p>
                              <p className="text-xl font-black italic text-primary mt-2">${product.price}</p>
                           </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest italic">
                              <CheckCircle2 className="w-3 h-3 text-success" /> {product.inventory || '∞'} In Stock
                           </div>
                           <Badge variant="outline" className="bg-success/5 text-success border-success/10 text-[9px] px-2">LIVE</Badge>
                        </div>
                     </Card>
                   ))
                 )}
              </div>
           </div>
        </div>

      </div>

      {/* Add Custom Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <Card className="relative w-full max-w-md p-8 bg-dark-900 border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              <Plus className="text-primary w-6 h-6" /> Add Custom Product
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Product Name</label>
                <input 
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                  placeholder="e.g. Signature Tee"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                    placeholder="29.99"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image URL (Optional)</label>
                <input 
                  value={newProduct.image_url}
                  onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-white/5 text-gray-500"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-black font-black uppercase tracking-widest"
                >
                  Save Product
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
