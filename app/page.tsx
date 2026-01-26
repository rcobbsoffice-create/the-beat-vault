import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { 
  Music, 
  Zap, 
  Shield, 
  TrendingUp,
  Play,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Downloads',
    description: 'Get your beats immediately after purchase. No waiting, no hassle.',
  },
  {
    icon: Shield,
    title: 'Licensed & Legal',
    description: 'All beats come with proper licensing. Focus on creating, not worrying.',
  },
  {
    icon: TrendingUp,
    title: 'Top Producers',
    description: 'Access beats from verified, professional producers worldwide.',
  },
];

const genres = [
  { name: 'Hip Hop', count: 2400, gradient: 'from-purple-600 to-blue-600' },
  { name: 'Trap', count: 1800, gradient: 'from-red-600 to-orange-500' },
  { name: 'R&B', count: 1200, gradient: 'from-pink-600 to-purple-600' },
  { name: 'Pop', count: 900, gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Lo-Fi', count: 750, gradient: 'from-green-600 to-teal-500' },
  { name: 'Drill', count: 600, gradient: 'from-gray-700 to-gray-900' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
          {/* Background */}
          <div className="absolute inset-0 bg-dark-950">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 border border-dark-600 mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-gray-300">1000+ New Beats Added This Week</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
              <span className="text-white">Secure Your </span>
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent italic">Sonic Legacy</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The premier rights-locked platform for elite music creation. 
              Monetize your sonic assets with automated split contracts and instant licensing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" fill="currentColor" />
                  Browse Beats
                </Button>
              </Link>
              <Link href="/signup?role=producer">
                <Button variant="outline" size="lg" className="gap-2">
                  Start Selling
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-12 mt-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-gray-400">Beats</p>
              </div>
              <div className="w-px h-12 bg-dark-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-gray-400">Producers</p>
              </div>
              <div className="w-px h-12 bg-dark-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-gray-400">Artists</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-dark-900 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose The Beat Vault
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The complete platform for buying and selling beats with everything you need to succeed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl transition-all duration-300 hover:border-primary/50 hover:bg-dark-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Genres Section */}
        <section className="py-24 bg-dark-950 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Explore by Genre
                </h2>
                <p className="text-gray-400">
                  Find beats that match your style
                </p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" className="gap-2 hover:text-primary">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {genres.map((genre, index) => (
                <Link
                  key={index}
                  href={`/marketplace?genre=${genre.name.toLowerCase()}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-dark-700/50 hover:border-primary/50 transition-colors"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-dark-950/20 group-hover:bg-transparent transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 transform group-hover:scale-105 transition-transform duration-300">
                    <p className="text-lg font-bold text-white drop-shadow-lg">{genre.name}</p>
                    <p className="text-xs font-medium text-white/90 bg-black/20 px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">{genre.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 pb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 to-dark-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 border-y border-white/5" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5 mb-8 animate-pulse">
              <Music className="w-12 h-12 text-primary" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-white">Ready to Start </span>
              <span className="gradient-text">Your Journey?</span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of artists and producers already using The Beat Vault to power their sonic careers.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-dark-600 hover:bg-dark-800">
                  Browse Beats
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
