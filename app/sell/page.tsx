import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Check, DollarSign, Globe, BarChart3 } from 'lucide-react';

export default function SellPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1">
        {/* Anti-Hero Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[0%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
        </div>

        {/* Hero */}
        <section className="relative py-32 lg:py-48 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary-dark">Accepting New Producers</span>
            </div>
            
            <h1 className="text-6xl sm:text-8xl font-bold mb-8 tracking-tight">
              <span className="block text-white mb-2">Sell Your Beats</span>
              <span className="block gradient-text">To The World</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              TrackFlow offers the industry&apos;s most advanced rights-locked distribution and royalty engine. 
              Keep <span className="text-white font-bold">85%</span> of your sales and streaming royalties, always.
            </p>
            
            <Link href="/signup?role=producer">
              <Button size="lg" className="h-16 px-12 text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                Start Selling Today
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefits Cards */}
        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass p-10 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Instant Payouts</h3>
                <p className="text-gray-400 leading-relaxed">
                  Get paid immediately via Stripe Connect. No waiting for monthly thresholds or hidden delays.
                </p>
              </div>
              
              <div className="glass p-10 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Global Reach</h3>
                <p className="text-gray-400 leading-relaxed">
                  Your beats are instantly available to millions of artists worldwide. We handle licensing and legal.
                </p>
              </div>
              
              <div className="glass p-10 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Pro Analytics</h3>
                <p className="text-gray-400 leading-relaxed">
                  Track plays, downloads, and sales in real-time with your advanced TrackFlow Dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
