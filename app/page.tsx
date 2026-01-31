'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { 
  Play, 
  ArrowRight, 
  BarChart3, 
  Zap, 
  Database, 
  ShieldCheck, 
  Cpu,
  ArrowUpRight,
  Sparkles,
  Search,
  Globe,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BeatCard } from '@/components/BeatCard';

export default function HomePage() {
  const [trendingBeats, setTrendingBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const { data, error } = await supabase
          .from('beats')
          .select('*, producer:profiles(*), licenses(*)')
          .eq('status', 'published')
          .order('play_count', { ascending: false })
          .limit(4);
        
        if (error) throw error;
        setTrendingBeats(data || []);
      } catch (error) {
        console.error('Error fetching trending beats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-primary selection:text-black">
      <Header />
      
      <main className="flex-1">
        {/* SECTION 1: CINEMATIC HERO */}
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
             <Image 
               src="/hero-bg.png"
               alt="Cosmic Studio"
               fill
               className="object-cover opacity-60 grayscale-[20%] brightness-[0.7]"
               priority
             />
             <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black" />
             <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent opacity-80" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
                <Sparkles className="w-3 h-3" />
                <span>The Future of Production</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic mb-6 leading-[0.9]">
                THE DNA OF <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-gradient">MODERN MUSIC</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 font-medium mb-10 max-w-2xl leading-relaxed">
                Empowering Producers with AI-driven analytics. <br className="hidden md:block" /> 
                Connecting Artists with the world's most intelligent sounds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                  <Button className="h-16 px-10 text-lg font-black uppercase tracking-wider rounded-xl group transition-all">
                    Browse Marketplace
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button variant="outline" className="h-16 px-10 text-lg font-black uppercase tracking-wider rounded-xl border-white/20 hover:border-white transition-all">
                    Join as Producer
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent" />
        </section>

        {/* SECTION 2: ECOSYSTEM OVERVIEW */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-primary mb-4">The AudioGenes Ecosystem</h2>
              <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter">TOTAL PRODUCTION INTEGRATION</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-dark-900/50 border border-white/5 rounded-3xl hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-2xl font-black uppercase italic mb-4">Intelligent Search</h4>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Find the perfect "Gene" for your track using AI-driven metadata that understands mood, energy, and musical intent.
                </p>
                <div className="mt-8 flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-dark-900/50 border border-white/5 rounded-3xl hover:border-secondary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-secondary" />
                </div>
                <h4 className="text-2xl font-black uppercase italic mb-4">Secure Licensing</h4>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Automated contracts and instant file delivery via high-security R2 storage ensures your IP is always protected.
                </p>
                <div className="mt-8 flex items-center gap-2 text-secondary font-black uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-dark-900/50 border border-white/5 rounded-3xl hover:border-white/50 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-black uppercase italic mb-4">Live Analytics</h4>
                <p className="text-gray-500 leading-relaxed font-medium">
                  Producers get real-time tracking for every play, view, and favorite, turning data into actionable release strategies.
                </p>
                <div className="mt-8 flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURE SHOWCASE (AI DNA) */}
        <section className="py-32 bg-dark-950 border-y border-white/5 overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="relative aspect-square">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <Image 
                      src="/features-dna.png"
                      alt="AI Audio DNA"
                      width={600}
                      height={600}
                      className="relative z-10 w-full h-full object-cover rounded-3xl"
                    />
                 </div>
                 
                 <div className="space-y-10">
                    <div>
                       <h2 className="text-xs font-black uppercase tracking-[0.5em] text-secondary mb-4">The Intelligent Core</h2>
                       <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-6 uppercase">AI-POWERED METADATA AGENT</h3>
                       <p className="text-lg text-gray-400 leading-relaxed font-medium">
                          Our proprietary AI analysis engine automatically extracts the "Musical Fingerprint" of every upload. Detect BPM, Key, Genre, and Mood without lifting a finger. 
                       </p>
                    </div>

                    <ul className="space-y-6">
                       <li className="flex items-start gap-4 group">
                          <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center mt-1 group-hover:bg-secondary group-hover:text-black transition-colors">
                             <Zap className="w-3 h-3" />
                          </div>
                          <div>
                             <h4 className="font-black uppercase text-sm tracking-widest italic">Instant Extraction</h4>
                             <p className="text-gray-500 text-sm mt-1">Get precise BPM and Key measurements in seconds.</p>
                          </div>
                       </li>
                       <li className="flex items-start gap-4 group">
                          <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center mt-1 group-hover:bg-secondary group-hover:text-black transition-colors">
                             <Cpu className="w-3 h-3" />
                          </div>
                          <div>
                             <h4 className="font-black uppercase text-sm tracking-widest italic">Genre Classification</h4>
                             <p className="text-gray-500 text-sm mt-1">Deep learning models categorize your beats into specific sub-genres.</p>
                          </div>
                       </li>
                    </ul>

                    <Button variant="outline" className="border-secondary/20 hover:border-secondary text-secondary h-14 px-8 uppercase font-black italic tracking-widest">
                       Learn About the Engine
                    </Button>
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION 4: MARKETPLACE TEASER */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-primary mb-4">Trending Genes</h2>
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">EXPLORE THE VAULT</h3>
              </div>
              <Link href="/marketplace">
                <Button variant="outline" className="hidden md:flex items-center gap-2 uppercase font-black italic tracking-widest border-white/10 hover:border-white h-14">
                  View All <Play className="w-3 h-3 fill-current" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-dark-900 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : trendingBeats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingBeats.map((beat) => (
                  <BeatCard key={beat.id} beat={beat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-dark-900/30 rounded-3xl border border-white/5">
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em]">The vault is currently preparing...</p>
              </div>
            )}
            
            <Link href="/marketplace" className="md:hidden mt-10 block">
              <Button fullWidth variant="outline" className="h-14 uppercase font-black italic tracking-widest">
                Browse Full Marketplace
              </Button>
            </Link>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-linear-to-b from-black to-dark-900 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[150px] animate-pulse" />
           </div>
           
           <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-8">Ready to evolve?</h2>
              <p className="text-xl text-gray-400 mb-12 font-medium max-w-2xl mx-auto">
                 Join thousands of producers and artists who have already upgraded their workflow with AudioGenes.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                 <Link href="/signup">
                    <Button className="h-16 px-12 text-lg font-black uppercase tracking-widest rounded-xl">Create Account</Button>
                 </Link>
                 <Link href="/contact">
                    <Button variant="outline" className="h-16 px-12 text-lg font-black uppercase tracking-widest rounded-xl border-white/10 hover:border-white">Contact Sales</Button>
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
