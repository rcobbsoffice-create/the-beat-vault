import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Music, MapPin, Star } from 'lucide-react';

const MOCK_PRODUCERS = [
  {
    id: '1',
    name: 'Metro Boomin',
    slug: 'metro-boomin',
    role: 'producer',
    location: 'Atlanta, GA',
    bio: 'Multi-platinum producer known for dark, trap beats.',
    image: null,
    stats: { beats: 124, stars: 4.9 }
  },
  {
    id: '2',
    name: 'Pharrell',
    slug: 'pharrell',
    role: 'producer',
    location: 'Virginia Beach, VA',
    bio: 'Innovative production blending funk, rock, and hip hop.',
    image: null,
    stats: { beats: 89, stars: 5.0 }
  },
  {
    id: '3',
    name: 'Pierre Bourne',
    slug: 'pierre-bourne',
    role: 'producer',
    location: 'Queens, NY',
    bio: 'Known for unique 808s and video game sampling.',
    image: null,
    stats: { beats: 56, stars: 4.8 }
  },
  {
    id: '4',
    name: 'Kanye West',
    slug: 'kanye-west',
    role: 'producer',
    location: 'Chicago, IL',
    bio: 'Legendary soulful samples and experimental production.',
    image: null,
    stats: { beats: 210, stars: 4.7 }
  },
];

export default function ProducersPage() {
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
              Discover the talent behind the beats. Browse profiles, listen to catalogs, and connect with world-class producers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_PRODUCERS.map((producer) => (
              <Link 
                key={producer.id} 
                href={`/producers/${producer.slug}`}
                className="group block"
              >
                <div className="glass border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  {/* Cover/Avatar Area */}
                  <div className="aspect-square w-full bg-dark-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <div className="w-24 h-24 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center shadow-lg">
                        <Music className="w-10 h-10 text-dark-500 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    {/* Golden Sheen on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                  </div>

                  <div className="p-6 relative">
                    <div className="absolute -top-12 left-6">
                       {/* Placeholder for real avatar if needed, otherwise using icon above */}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                      {producer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      {producer.location}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                      {producer.bio}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Catalog</span>
                        <span className="text-white font-medium">{producer.stats.beats} Beats</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-xs text-gray-500 uppercase tracking-wider">Rating</span>
                         <div className="flex items-center gap-1 text-accent">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-white">{producer.stats.stars}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
