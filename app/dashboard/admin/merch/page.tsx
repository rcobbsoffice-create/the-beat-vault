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
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function AdminMerchPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [printfulStatus, setPrintfulStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSyncPrintful = async () => {
    setSyncing(true);
    const toastId = toast.loading('Connecting to Printful API...');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock data sync
      setPrintfulStatus('connected');
      toast.success('Printful Catalog Synced Successfully!', { id: toastId });
    } catch (error: any) {
      setPrintfulStatus('error');
      toast.error('Printful Sync Failed: Invalid API Key', { id: toastId });
    } finally {
      setSyncing(false);
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

        {/* Right Column: Product Management */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Product Catalog</h2>
              <Button variant="outline" className="gap-2 border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                <Plus className="w-4 h-4" /> Add Custom Product
              </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-dark-900/10 border border-dashed border-white/5 rounded-[4rem]">
                   <Package className="w-16 h-16 text-dark-500 mx-auto mb-6" />
                   <p className="text-gray-600 font-black uppercase tracking-widest text-xs italic">Warehouse Empty</p>
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="p-6 bg-dark-900/30 border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-4 translate-x-12 group-hover:translate-x-0 transition-transform bg-white/5 rounded-bl-2xl">
                        <div className="flex gap-2">
                           <button className="p-2 text-gray-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                           <button className="p-2 text-gray-500 hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </div>

                     <div className="flex gap-6 items-center">
                        <div className="w-24 h-24 bg-dark-950 rounded-2xl border border-white/5 overflow-hidden">
                           {product.image_url ? (
                             <img src={product.image_url} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-dark-800"><Box className="w-8 h-8" /></div>
                           )}
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h3 className="font-black italic uppercase tracking-tighter text-lg">{product.name}</h3>
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
  );
}
