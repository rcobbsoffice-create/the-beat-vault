'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  Music, 
  Play, 
  Search, 
  Filter, 
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import toast from 'react-hot-toast';

export default function ArtistLibraryPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            beat:beats(*, producer:profiles(*)),
            license:licenses(*)
          `)
          .eq('buyer_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPurchases(data || []);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, [user]);

  const handleDownload = (purchase: any) => {
    // Generate a temporary download link
    const urls = purchase.download_urls;
    if (!urls) {
      toast.error('Download link not found');
      return;
    }
    
    // For now, redirect to the first available URL
    const downloadUrl = urls.wav || urls.mp3 || (urls.stems && Object.values(urls.stems)[0]);
    if (downloadUrl) {
      window.open(downloadUrl as string, '_blank');
    } else {
      toast.error('No download URL available');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
          <p className="text-gray-400">Access and download your licensed beat collection</p>
        </div>
        <div className="flex bg-dark-900 border border-white/5 rounded-xl p-1 gap-1">
          <Button size="sm" className="bg-primary text-black font-bold">All Purchases</Button>
          <Button size="sm" variant="ghost" className="text-gray-500">Stems</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-dark-900 animate-pulse rounded-xl" />
          ))
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">You haven't purchased any beats yet.</p>
          </div>
        ) : purchases.map((purchase) => (
          <Card key={purchase.id} className="p-4 bg-dark-900/40 border-white/5 hover:border-white/10 transition-all group">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Box */}
              <div className="w-16 h-16 rounded-xl bg-dark-800 shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                {purchase.beat?.artwork_url ? (
                  <img src={purchase.beat.artwork_url} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Music className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h3 className="text-lg font-bold text-white mb-1">{purchase.beat?.title || 'Unknown Beat'}</h3>
                <p className="text-sm text-gray-400">Produced by <span className="text-white">{purchase.beat?.producer?.display_name || 'Producer'}</span></p>
                <div className="flex justify-center md:justify-start gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] uppercase border-white/10 capitalize">{purchase.license?.type} License</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase border-white/10">{purchase.license?.files_included?.join(' + ')}</Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <Button 
                   onClick={() => handleDownload(purchase)}
                   className="flex-1 md:flex-none bg-white text-black font-bold gap-2 shadow-lg shadow-white/5"
                 >
                    <Download className="w-4 h-4" />
                    Download Files
                 </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Locked Content Hint */}
      <Card className="p-8 border-dashed border-white/5 text-center bg-transparent">
         <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5">
            <Lock className="w-6 h-6 text-gray-600" />
         </div>
         <h3 className="text-white font-bold">Unreleased Purchases</h3>
         <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
           Any beats marked as "Coming Soon" by the producer will appear here once ready.
         </p>
      </Card>
    </div>
  );
}
