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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Find Your </span>
              <span className="gradient-text">Perfect Beat</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              The premium marketplace for beats and instrumentals. 
              Browse thousands of professionally crafted beats from top producers.
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
            <div className="flex items-center justify-center gap-12 mt-16">
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
        <section className="py-24 bg-dark-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="group p-8 bg-dark-800 border border-dark-700 rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Genres Section */}
        <section className="py-24 bg-dark-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Button variant="ghost" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {genres.map((genre, index) => (
                <Link
                  key={index}
                  href={`/marketplace?genre=${genre.name.toLowerCase()}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient}`} />
                  <div className="absolute inset-0 bg-dark-950/40 group-hover:bg-dark-950/20 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-lg font-bold text-white">{genre.name}</p>
                    <p className="text-sm text-white/70">{genre.count} beats</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary/20 to-secondary/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Music className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of artists and producers already using The Beat Vault.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Create Free Account</Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg">Browse Beats</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
