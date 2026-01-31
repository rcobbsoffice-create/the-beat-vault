'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Store, 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Check,
  Save,
  Grid as GridIcon,
  List as ListIcon,
  MousePointer2,
  Shirt,
  Link2,
  Trash2,
  Plus,
  Package,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useMerchStore } from '@/stores/merch';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function ProducerStorefrontPage() {
  const { profile } = useAuth();
  const { items: merchItems, isIntegrationConnected, connectedService, setIntegration, addItem } = useMerchStore();
  
  // Storefront Settings State
  const [settings, setSettings] = useState({
    displayName: profile?.display_name || 'Producer Storefront',
    tagline: 'atlanta, ga • trap producer',
    accentColor: '#D4AF37', // Gold
    theme: 'midnight-onyx',
    layout: 'grid' as 'grid' | 'list',
    showMerch: true,
    whiteLabel: false,
  });

  const [activeTab, setActiveTab] = useState<'beats' | 'merch'>('beats');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [producerData, setProducerData] = useState<any>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  
  // Add Merch Modal State
  const [isAddMerchModalOpen, setIsAddMerchModalOpen] = useState(false);
  const [newMerch, setNewMerch] = useState({
    name: '',
    price: '',
    category: 'Apparel' as any,
    image_url: 'https://images.unsplash.com/photo-1576566582418-413469b6bde1?w=800&auto=format&fit=crop&q=60'
  });

  // Service Connection Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectingService, setConnectingService] = useState<'Printful' | 'Printify' | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync profile name when it loads
  useEffect(() => {
    async function loadStorefrontData() {
      if (!profile?.id) return;
      
      const useMockDataFallback = () => {
         console.log('[Storefront] Falling back to local state visualization.');
         setSettings(prev => ({
            ...prev,
            displayName: profile.display_name || 'Producer Storefront',
         }));
         setIsInitialLoading(false);
      };

      try {
        console.log('[Storefront] Attempting to fetch from Supabase...');
        
        // Check if Supabase is actually configured
        const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== '');
        
        if (!isConfigured) {
           console.warn('[Storefront] Supabase URL is missing. Switching to Prototype Mode.');
           useMockDataFallback();
           return;
        }

        const { data: producer, error: pError } = await supabase
          .from('producers')
          .select('*, stores(*)')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (pError) {
          console.warn('[Storefront] Supabase connection unavailable (switched to local prototype mode).', {
            message: pError.message,
            code: pError.code
          });
          useMockDataFallback();
          return;
        }

        // AUTO-HEAL: If no producer record exists, create one for the prototype
        if (!producer) {
          console.warn('[Storefront] Missing records. Attempting to initialize...');
          
          const slug = profile.display_name?.toLowerCase().replace(/\s+/g, '-') || `store-${profile.id.slice(0, 5)}`;
          
          try {
             const { data: newProducer, error: createError } = await supabase
               .from('producers')
               .insert({
                  profile_id: profile.id,
                  store_slug: slug,
                  status: 'active',
                  branding: { tagline: 'Independent Music Brand' }
               })
               .select()
               .single();

             if (createError) throw createError;

             const { error: storeError } = await supabase
               .from('stores')
               .insert({
                  producer_id: newProducer.id,
                  theme: {
                     id: 'midnight-onyx',
                     accentColor: '#D4AF37',
                     layout: 'grid',
                     showMerch: true,
                     whiteLabel: false
                  }
               });

             if (storeError) throw storeError;
             
             // Directly update state after successful creation
             setProducerData(newProducer);
             setIsInitialLoading(false);
          } catch (initErr) {
             console.error('[Storefront] Auto-initialization failed:', {
                 message: (initErr as any)?.message,
                 code: (initErr as any)?.code,
                 details: (initErr as any)?.details,
                 hint: (initErr as any)?.hint,
                 fullError: initErr
             });
             setSetupError((initErr as any)?.message || 'Automatic setup failed. Database permissions may be missing.');
             useMockDataFallback();
          }
          return;
        }

        setProducerData(producer);

        if (producer.stores && producer.stores.length > 0) {
          const store = producer.stores[0];
          setSettings({
            displayName: profile.display_name || 'Producer Storefront',
            tagline: producer.branding?.tagline || 'atlanta, ga • trap producer',
            accentColor: store.theme?.accentColor || '#D4AF37',
            theme: store.theme?.id || 'midnight-onyx',
            layout: store.theme?.layout || 'grid',
            showMerch: store.theme?.showMerch ?? true,
            whiteLabel: store.theme?.whiteLabel ?? false,
          });
        }
        setIsInitialLoading(false);
      } catch (err: any) {
        console.error('[Storefront] Critical Loading Error:', err.message || 'Unknown Error', err);
        setSetupError(err.message || 'Critical error loading storefront data');
        useMockDataFallback();
      }
    }

    loadStorefrontData();
  }, [profile]);

  const handleViewLive = () => {
    if (!profile?.display_name) {
      toast.error('Profile not loaded yet');
      return;
    }
    const slug = profile.display_name.toLowerCase().replace(/\s+/g, '-');
    window.open(`/producers/${slug}`, '_blank');
  };

  const handleApplyTheme = (themeId: string) => {
    setSettings(s => ({ ...s, theme: themeId }));
    toast(`${themeId.replace('-', ' ')} theme selected!`, { icon: '🎨' });
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      // 1. Get or verify producer ID
      let pId = producerData?.id;
      if (!pId) {
        // Retry fetch
        const { data: p } = await supabase.from('producers').select('id').eq('profile_id', profile.id).maybeSingle();
        pId = p?.id;
      }

      // LAZY INITIALIZATION: If still missing, try to create it now
      if (!pId) {
          console.log('[Storefront] Profile missing while saving. Attempting lazy creation...');
          const slug = profile.display_name?.toLowerCase().replace(/\s+/g, '-') || `store-${profile.id.slice(0, 5)}`;
          
          const { data: newProducer, error: createError } = await supabase
               .from('producers')
               .insert({
                  profile_id: profile.id,
                  store_slug: slug,
                  status: 'active',
                  branding: { tagline: settings.tagline || 'Independent Music Brand' }
               })
               .select()
               .single();
            
           if (createError) {
               console.error('[Storefront] Lazy creation failed:', createError);
               throw new Error('Failed to create producer profile. Please run database migrations to fix permissions.');
           }
           pId = newProducer.id;
           setProducerData(newProducer);
      }

      if (!pId) throw new Error('Storefront profile could not be initialized. Please refresh.');

      const { error: storeError } = await supabase
        .from('stores')
        .upsert({
          producer_id: pId,
          theme: {
            id: settings.theme,
            accentColor: settings.accentColor,
            layout: settings.layout,
            showMerch: settings.showMerch,
          }
        }, { onConflict: 'producer_id' });

      if (storeError) throw storeError;

      const { error: producerError } = await supabase
        .from('producers')
        .update({
          branding: { ...(producerData?.branding || {}), tagline: settings.tagline }
        })
        .eq('id', pId);

      if (producerError) throw producerError;

      toast.success('Storefront settings saved!', {
        id: 'storefront-save',
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #1C1C1C' }
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
      console.error('[Storefront] Save Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectInitiate = (service: 'Printful' | 'Printify') => {
    setConnectingService(service);
    setIsConnectModalOpen(true);
  };

  const handleVerifyAndLink = async () => {
    if (!apiKey) {
      toast.error('Please enter your API key');
      return;
    }
    
    setIsVerifying(true);
    // Simulate API key verification
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsVerifying(false);
    setIsSyncing(true);
    // Simulate initial inventory sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIntegration(connectingService, true);
    
    // Add mock synced items
    const syncedItems = [
      {
        id: 'ps1',
        name: `Premium ${connectingService} Hoodie`,
        description: `High-quality hoodie synced from your ${connectingService} store.`,
        price: 49.99,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=60',
        category: 'Apparel' as any,
        on_sale: false,
        source: connectingService!
      },
      {
        id: 'ps2',
        name: `Signature ${connectingService} Cap`,
        description: `Custom embroidered cap synced from your ${connectingService} store.`,
        price: 24.99,
        image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=60',
        category: 'Accessories' as any,
        on_sale: true,
        source: connectingService!
      }
    ];
    
    syncedItems.forEach(item => addItem(item));
    
    setIsSyncing(false);
    setIsConnectModalOpen(false);
    setApiKey('');
    toast.success(`Successfully connected to ${connectingService} and synced inventory!`, {
      icon: '✨',
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' }
    });
  };

  const handleDisconnect = () => {
    setIntegration(null, false);
    toast('Merchandise integration disconnected', { icon: '🔌' });
  };

  const handleAddManualMerch = () => {
    if (!newMerch.name || !newMerch.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    addItem({
      id: 'm-' + Math.random().toString(36).substr(2, 9),
      name: newMerch.name,
      description: 'Hand-crafted merchandise for your fans.',
      price: parseFloat(newMerch.price),
      category: newMerch.category,
      image_url: newMerch.image_url,
      on_sale: true,
      source: 'Manual'
    });

    setIsAddMerchModalOpen(false);
    setNewMerch({
      name: '',
      price: '',
      category: 'Apparel',
      image_url: 'https://images.unsplash.com/photo-1576566582418-413469b6bde1?w=800&auto=format&fit=crop&q=60'
    });
    setActiveTab('merch');
    toast.success('Product added to your store!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Storefront Editor</h1>
          <p className="text-gray-400">Customize your public marketplace appearance in real-time</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 group" onClick={handleViewLive}>
            <Eye className="w-4 h-4 text-primary" />
            View Live Site
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
           <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleSave} isLoading={isSaving}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {setupError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
           <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
             <X className="w-5 h-5" />
           </div>
           <div className="flex-1">
             <h3 className="font-bold text-sm text-white">Initialization Error</h3>
             <p className="text-xs">{setupError}</p>
             <p className="text-[10px] mt-1 opacity-70">If this persists, please run the latest database migration to fix permissions.</p>
           </div>
           <Button size="sm" variant="outline" className="text-xs h-8 border-red-500/30 hover:bg-red-500/20" onClick={() => window.location.reload()}>
             Retry
           </Button>
        </div>
      )}

      {isInitialLoading ? (
         <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with Supabase...</p>
         </div>
      ) : (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        
        {/* Editor Sidebar */}
        <div className="space-y-6 lg:max-h-[80vh] lg:overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Section: Branding */}
           <Card className="p-6 border-white/5 bg-dark-900/50 space-y-4">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                 <Type className="w-4 h-4 text-primary" />
                 Branding
              </h3>
              <Input 
                label="Display Name" 
                value={settings.displayName}
                onChange={(e) => setSettings(s => ({ ...s, displayName: e.target.value }))}
                placeholder="Your stage name"
              />
              <Input 
                label="Tagline / Bio" 
                value={settings.tagline}
                onChange={(e) => setSettings(s => ({ ...s, tagline: e.target.value }))}
                placeholder="e.g. Atlanta, GA • Trap Producer"
              />
           </Card>

           {/* Section: Visuals */}
           <Card className="p-6 border-white/5 bg-dark-900/50">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                 <Palette className="w-4 h-4 text-primary" />
                 Theme & Colors
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest block mb-3">Active Theme</label>
                  <div className="space-y-3">
                    {[
                      { id: 'midnight-onyx', name: 'Midnight Onyx', desc: 'Sleek dark mode with gold accents' },
                      { id: 'solar-gold', name: 'Solar Gold', desc: 'Premium high-contrast appearance', premium: true }
                    ].map((theme) => (
                      <button 
                        key={theme.id}
                        onClick={() => !theme.premium && handleApplyTheme(theme.id)}
                        className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                          settings.theme === theme.id 
                            ? 'bg-dark-950 border-2 border-primary' 
                            : 'bg-dark-800 border-2 border-transparent hover:border-white/10'
                        } ${theme.premium ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div>
                           <p className={`text-sm font-bold ${settings.theme === theme.id ? 'text-white' : 'text-gray-400'}`}>
                             {theme.name}
                           </p>
                           <p className="text-[10px] text-gray-500 uppercase font-black">
                             {theme.premium ? 'Premium Only' : settings.theme === theme.id ? 'Active Theme' : 'Standard'}
                           </p>
                        </div>
                        {settings.theme === theme.id && <Check className="w-5 h-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest block mb-3">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.accentColor}
                      onChange={(e) => setSettings(s => ({ ...s, accentColor: e.target.value }))}
                      className="w-12 h-12 rounded-lg bg-dark-800 border-2 border-white/5 cursor-pointer overflow-hidden p-0"
                    />
                    <div className="flex-1 px-4 py-3 bg-dark-800 rounded-lg border border-white/5 font-mono text-sm text-gray-400 uppercase">
                      {settings.accentColor}
                    </div>
                  </div>
                </div>
              </div>
           </Card>

            {/* Section: Layout */}
            <Card className="p-6 border-white/5 bg-dark-900/50">
               <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-primary" />
                  Catalog Layout
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                   onClick={() => setSettings(s => ({ ...s, layout: 'grid' }))}
                   className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                     settings.layout === 'grid' ? 'border-primary bg-primary/5 text-primary' : 'border-dark-700 text-gray-500 hover:border-dark-600'
                   }`}
                  >
                     <GridIcon className="w-6 h-6" />
                     <span className="text-xs font-bold uppercase">Grid</span>
                  </button>
                  <button 
                   onClick={() => setSettings(s => ({ ...s, layout: 'list' }))}
                   className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                     settings.layout === 'list' ? 'border-primary bg-primary/5 text-primary' : 'border-dark-700 text-gray-500 hover:border-dark-600'
                   }`}
                  >
                     <ListIcon className="w-6 h-6" />
                     <span className="text-xs font-bold uppercase">List</span>
                  </button>
               </div>
            </Card>

            {/* Section: Merchandise Integration */}
            <Card className="p-6 border-white/5 bg-dark-900/50 space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-primary" />
                    Merchandise
                 </h3>
                 <button 
                   onClick={() => setSettings(s => ({ ...s, showMerch: !s.showMerch }))}
                   className={`w-10 h-5 rounded-full relative transition-colors ${settings.showMerch ? 'bg-primary' : 'bg-dark-700'}`}
                 >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.showMerch ? 'right-1' : 'left-1'}`} />
                 </button>
               </div>

               {settings.showMerch && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-xs text-gray-500">Sell apparel and accessories directly to your fans.</p>
                    
                    {!isIntegrationConnected ? (
                       <div className="grid grid-cols-1 gap-2">
                             <Button 
                               variant="outline" 
                               fullWidth 
                               className="justify-between border-dark-700 hover:border-primary/40 group"
                               onClick={() => handleConnectInitiate('Printful')}
                               isLoading={isConnecting === 'Printful'}
                             >
                                <div className="flex items-center gap-2">
                                   <Link2 className="w-3.5 h-3.5" />
                                   <span className="text-xs font-bold">Connect Printful</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </Button>
                             <Button 
                               variant="outline" 
                               fullWidth 
                               className="justify-between border-dark-700 hover:border-primary/40 group"
                               onClick={() => handleConnectInitiate('Printify')}
                               isLoading={isConnecting === 'Printify'}
                             >
                             <div className="flex items-center gap-2">
                                <Link2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Connect Printify</span>
                             </div>
                             <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                       </div>
                    ) : (
                       <div className="p-4 rounded-xl bg-success/5 border border-success/20 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-success/10">
                                   <Check className="w-3.5 h-3.5 text-success" />
                                </div>
                                <span className="text-xs font-bold text-white">{connectedService} Active</span>
                             </div>
                             <button onClick={handleDisconnect} className="text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase underline">
                                Disconnect
                             </button>
                          </div>
                          <div className="h-px bg-white/5" />
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Products</span>
                             <span className="text-xs font-bold text-white">{merchItems.length} items</span>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black" fullWidth>
                             Sync Inventory
                          </Button>
                       </div>
                    )}

                    <div className="pt-2">
                       <Button 
                         variant="ghost" 
                         fullWidth 
                         className="text-gray-500 hover:text-white group h-10 border border-dashed border-dark-700"
                         onClick={() => setIsAddMerchModalOpen(true)}
                       >
                          <Plus className="w-3.5 h-3.5 mr-2 group-hover:rotate-90 transition-transform" />
                          Add Manual Product
                       </Button>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-xs font-bold text-white">White-label Storefront</p>
                             <p className="text-[10px] text-gray-500">Remove "Powered by Printful" branding.</p>
                          </div>
                          <button 
                            onClick={() => setSettings(s => ({ ...s, whiteLabel: !s.whiteLabel }))}
                            className={`w-8 h-4 rounded-full relative transition-colors ${settings.whiteLabel ? 'bg-primary' : 'bg-dark-700'}`}
                          >
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${settings.whiteLabel ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                       </div>
                    </div>
                  </div>
               )}
            </Card>
        </div>

        {/* Live Preview Emulator */}
        <div className="lg:col-span-2 sticky top-[100px] h-fit">
           <div className="bg-dark-950 rounded-4xl border-12 border-dark-900 aspect-16/10 relative overflow-hidden shadow-2xl scale-[0.98] origin-top">
              {/* Fake Browser Toolbar */}
              <div className="h-10 bg-dark-900 flex items-center px-6 gap-2 border-b border-black/40">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                 </div>
                 <div className="flex-1 mx-4 h-6 bg-black/40 rounded-full flex items-center px-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/20 mr-2" />
                    <p className="text-[10px] text-gray-600 font-mono truncate">thebeatvault.com/producers/{settings.displayName.toLowerCase().replace(/\s+/g, '-')}</p>
                 </div>
              </div>
              
              {/* Preview Content */}
              <div 
                className="p-8 h-full bg-[#0A0A0A] overflow-y-auto relative custom-scrollbar"
                style={{ '--accent-color': settings.accentColor } as any}
              >

                 {/* Mock Header */}
                 <div className="h-32 w-full rounded-3xl bg-dark-900/50 border border-white/5 mb-8 flex items-end p-8 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent" />
                    <div className="flex items-center gap-6 relative z-10">
                       <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center text-black font-black text-2xl shadow-xl"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                       >
                          {settings.displayName.charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-3xl font-black text-white">{settings.displayName}</p>
                          <p className="text-sm font-medium opacity-60 flex items-center gap-2">
                             <MousePointer2 className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />
                             {settings.tagline}
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 {/* Mock Tabs */}
                 <div className="flex gap-8 border-b border-white/5 mb-8">
                    <button 
                      onClick={() => setActiveTab('beats')}
                      className={`pb-4 text-sm font-bold transition-all relative ${
                        activeTab === 'beats' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                       Beats Catalog
                       {activeTab === 'beats' && (
                         <div className="absolute inset-x-0 bottom-0 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                       )}
                    </button>
                    {settings.showMerch && (
                       <button 
                         onClick={() => setActiveTab('merch')}
                         className={`pb-4 text-sm font-bold transition-all relative ${
                           activeTab === 'merch' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                         }`}
                       >
                          Merchandise
                          {activeTab === 'merch' && (
                            <div className="absolute inset-x-0 bottom-0 h-1 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                          )}
                       </button>
                    )}
                 </div>
                 
                 {/* Mock Content */}
                 {activeTab === 'beats' ? (
                    <div className={`grid gap-4 ${settings.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                       {[1, 2, 3, 4].map(i => (
                         <div 
                           key={i} 
                           className={`bg-dark-900/30 rounded-2xl border border-white/5 p-4 flex gap-4 ${
                             settings.layout === 'list' ? 'flex-row items-center' : 'flex-col'
                           }`}
                         >
                            <div className={`aspect-square rounded-xl bg-dark-800 shrink-0 ${
                               settings.layout === 'grid' ? 'w-full' : 'w-16'
                            }`} />
                            <div className="flex-1 space-y-2">
                               <div className="h-3 w-3/4 bg-white/10 rounded" />
                               <div className="h-2 w-1/2 bg-white/5 rounded" />
                               <div className="flex justify-between items-center pt-2">
                                  <div className="h-4 w-12 bg-primary/20 rounded-lg" />
                                  <div 
                                   className="w-8 h-8 rounded-lg opacity-20" 
                                   style={{ backgroundColor: 'var(--accent-color)' }}
                                  />
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                       {merchItems.map(item => (
                         <div key={item.id} className="bg-dark-900/30 rounded-2xl border border-white/5 overflow-hidden group/item">
                            <div className="aspect-square bg-dark-800 relative">
                               <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 transition-opacity" />
                               {item.on_sale && (
                                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary text-[8px] font-black text-black">SALE</div>
                               )}
                            </div>
                            <div className="p-3 space-y-1">
                               <p className="text-[10px] font-bold text-white truncate">{item.name}</p>
                               <div className="flex justify-between items-center">
                                  <p className="text-xs font-black" style={{ color: 'var(--accent-color)' }}>${item.price.toFixed(2)}</p>
                                  <button 
                                    className="p-1 px-2 rounded-lg text-[8px] font-black uppercase transition-all"
                                    style={{ backgroundColor: 'var(--accent-color)', color: 'black' }}
                                  >
                                     Buy
                                  </button>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 )}

                 {/* Active Indicator Overlay */}
                 <div className="absolute top-4 right-4 animate-pulse">
                    <Badge className="bg-success/10 text-success border-success/20 uppercase font-black text-[10px] tracking-tighter">
                       Active Live Edit
                    </Badge>
                 </div>
              </div>

              {/* Interaction Overlay */}
              <div className="absolute inset-0 bg-black/5 pointer-events-none border border-white/5 rounded-3xl" />
              
              {!settings.whiteLabel && (
                 <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Powered by</p>
                    <div className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] font-black text-white italic">PRINTFUL</div>
                 </div>
              )}
           </div>
           <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-gray-500 uppercase font-black tracking-widest">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                 <span>Primary Style</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-800" />
              <span>Mobile Compliant</span>
              <div className="w-1 h-1 rounded-full bg-gray-800" />
              <span>Real-time Rendering</span>
           </div>
        </div>
      </div>

      {/* Add Merchandise Modal */}
      {isAddMerchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-dark-900 border-dark-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add Product</h2>
              <button 
                onClick={() => setIsAddMerchModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input 
                label="Product Name" 
                placeholder="e.g. Vault Logo Tee" 
                value={newMerch.name}
                onChange={(e) => setNewMerch(s => ({ ...s, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Price ($)" 
                  type="number" 
                  placeholder="35.00" 
                  value={newMerch.price}
                  onChange={(e) => setNewMerch(s => ({ ...s, price: e.target.value }))}
                />
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400">Category</label>
                   <select 
                     className="w-full bg-dark-800 border border-dark-700 rounded-lg p-2 text-sm text-white"
                     value={newMerch.category}
                     onChange={(e) => setNewMerch(s => ({ ...s, category: e.target.value as any }))}
                   >
                     <option>Apparel</option>
                     <option>Accessories</option>
                     <option>Physical Media</option>
                     <option>Other</option>
                   </select>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-dark-800 border border-dark-700 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-950">
                    <img src={newMerch.image_url} alt="Preview" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 text-[10px] text-gray-500 italic">
                    Images are currently auto-assigned based on category for this demo.
                 </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-dark-950/50">
               <Button fullWidth className="bg-primary text-black font-black" onClick={handleAddManualMerch}>
                  Save Product
               </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Connect Service Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-dark-900 border-dark-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-primary" />
                 </div>
                 <h2 className="text-xl font-bold text-white">Connect {connectingService}</h2>
              </div>
              <button 
                onClick={() => !isSyncing && setIsConnectModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                disabled={isSyncing}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5">1</div>
                     <p className="text-sm text-gray-400 leading-relaxed">Login to your <span className="text-white font-bold">{connectingService}</span> dashboard and navigate to **Settings &gt; API**.</p>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5">2</div>
                     <p className="text-sm text-gray-400 leading-relaxed">Create a new **Access Token** or copy your existing **Store API Key**.</p>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5">3</div>
                     <p className="text-sm text-gray-400 leading-relaxed">Paste the key below to synchronize your merchandise catalog.</p>
                  </div>
               </div>

               <div className="space-y-2">
                  <Input 
                    label={`${connectingService} API Key`} 
                    placeholder="e.g. pf_a7b2..." 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isVerifying || isSyncing}
                  />
                  <a href="#" className="text-[10px] text-primary uppercase font-black hover:underline">Where do I find my key?</a>
               </div>

               {(isVerifying || isSyncing) && (
                  <div className="p-6 rounded-2xl bg-dark-950 border border-white/5 flex flex-col items-center text-center animate-pulse">
                     <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                     <p className="text-sm font-bold text-white mb-1">
                        {isVerifying ? 'Verifying Credentials...' : 'Syncing Items...'}
                     </p>
                     <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                        {isVerifying ? 'Connecting to secure server' : `Fetching ${connectingService} products`}
                     </p>
                  </div>
               )}
            </div>
            <div className="p-6 border-t border-white/5 bg-dark-950/50">
               <Button 
                fullWidth 
                className="bg-primary text-black font-black" 
                onClick={handleVerifyAndLink}
                isLoading={isVerifying || isSyncing}
                disabled={!apiKey}
               >
                  Verify & Sync Storefront
               </Button>
            </div>
          </Card>
        </div>
      )}
      </>
      )}
    </div>
  );
}
