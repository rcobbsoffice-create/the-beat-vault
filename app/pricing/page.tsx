import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const LICENSES = [
  {
    name: 'Basic License',
    price: 29.99,
    description: 'Perfect for demos and non-profit projects.',
    features: [
      'MP3 (320kbps) file',
      'Non-Profit Use Only',
      '10,000 Streams Limit',
      'No Radio Airplay',
      'Instant Download'
    ],
    recommended: false
  },
  {
    name: 'Premium License',
    price: 79.99,
    description: 'Standard for professional artists and streaming.',
    features: [
      'WAV + MP3 files',
      'Commercial Use',
      '500,000 Streams Limit',
      'Radio Airplay Allowed',
      'Trackout Stems (Optional)'
    ],
    recommended: true
  },
  {
    name: 'Exclusive Rights',
    price: 499.99,
    description: 'Full ownership and unlimited rights.',
    features: [
      'All File Formats (WAV, MP3, Stems)',
      'Unlimited Commercial Use',
      'Unlimited Streams',
      'Full Ownership Transfer',
      'Beat Removed from Store'
    ],
    recommended: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Header />
      
      <main className="flex-1 py-20 pt-32 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="text-white">Simple, Transparent </span>
              <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the license that fits your needs. 
              Upgrade at any time by paying the difference.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {LICENSES.map((license, index) => (
              <div 
                key={index}
                className={`relative rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${
                  license.recommended 
                    ? 'bg-dark-900/80 border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10' 
                    : 'bg-dark-900/40 border border-white/5 hover:border-white/10'
                }`}
              >
                {license.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-dark text-black font-bold px-6 py-1.5 rounded-full text-sm shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8 border-b border-white/5 pb-8">
                  <h3 className={`text-xl font-bold mb-4 ${license.recommended ? 'text-primary' : 'text-white'}`}>
                    {license.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold text-white">${Math.floor(license.price)}</span>
                    <span className="text-xl text-gray-400">.99</span>
                  </div>
                  <p className="text-gray-500 text-sm">{license.description}</p>
                </div>

                <ul className="space-y-4 mb-10">
                  {license.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className={`p-1 rounded-full shrink-0 ${license.recommended ? 'bg-primary/20' : 'bg-white/5'}`}>
                        <Check className={`w-3 h-3 ${license.recommended ? 'text-primary' : 'text-gray-400'}`} />
                      </div>
                      <span className="flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup?role=artist" className="block w-full">
                  <Button 
                    fullWidth 
                    size="lg"
                    variant={license.recommended ? 'primary' : 'outline'}
                    className={license.recommended ? 'shadow-lg shadow-primary/20' : 'border-white/10 hover:bg-white/5'}
                  >
                    Choose {license.name.split(' ')[0]}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm max-w-3xl mx-auto">
              <div className="p-3 bg-primary/10 rounded-full">
                 <Info className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-lg mb-1">How Licensing Works</h4>
                <p className="text-gray-400 leading-relaxed text-sm">
                  When you purchase a license, you are buying the rights to use the beat for a specific purpose (like recording a song). 
                  You do not own the beat unless you purchase "Exclusive Rights". 
                  Most licenses are non-exclusive, meaning other artists can lease the same beat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
