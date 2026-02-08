import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Music, MapPin, Star, Users } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';

export default async function ProducersPage() {
  const supabase = createServiceClient();
  
  // Fetch real Top Producers from database
  const { data: producers, error } = await supabase
    .from('profiles')
    .select(`
      *,
      beats:beats(count)
    `)
    .eq('role', 'producer')
    .eq('is_top_producer', true)
    .order('display_name', { ascending: true });

  if (error) {
    console.error('Error fetching producers:', error);
  }

  const topProducers = producers || [];

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 py-12 pt-24 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-4">
              <span className="text-white">Top </span>
              <span className="gradient-text">Producers</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover the elite talent behind the beats. Hand-selected producers delivering professional sound.
            </p>
          </div>

          {topProducers.length === 0 ? (
            <div className="text-center py-20 bg-dark-900/50 rounded-3xl border border-white/5">
               <Users className="w-16 h-16 text-dark-700 mx-auto mb-4" />
               <p className="text-gray-500 font-medium">No producers have been featured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {topProducers.map((producer) => (
                <Link 
                  key={producer.id} 
                  href={`/producers/${producer.id}`}
                  className="group block"
                >
                  <div className="glass border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                    {/* Cover/Avatar Area */}
                    <div className="aspect-square w-full bg-dark-800 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        {producer.avatar_url ? (
                          <img src={producer.avatar_url} alt={producer.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center shadow-lg">
                            <Music className="w-10 h-10 text-dark-500 group-hover:text-primary transition-colors" />
                          </div>
                        )}
                      </div>
                      {/* Golden Sheen on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                    </div>

                    <div className="p-6 relative">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {producer.display_name || 'Anonymous Producer'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 text-primary/60" />
                        Platform Artist
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed h-10">
                        {producer.bio || 'New producer on AudioGenes.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Catalog</span>
                          <span className="text-white font-medium">{(producer as any).beats?.[0]?.count || 0} Beats</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-xs text-gray-500 uppercase tracking-wider">Rating</span>
                           <div className="flex items-center gap-1 text-accent">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold text-white">5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
