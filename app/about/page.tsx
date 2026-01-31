import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-primary selection:text-black">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 text-transparent bg-clip-text bg-linear-to-r from-white to-gray-500">
            About AudioGenes
          </h1>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-black uppercase tracking-widest text-primary mb-4">Our Mission</h2>
              <p className="text-xl text-gray-300 leading-relaxed font-light">
                AudioGenes is built on a simple premise: <span className="text-white font-bold">The future of music is encoded in collaboration.</span> We exist to bridge the gap between visionary producers and recording artists, creating a seamless ecosystem where rights are protected, creativity flows, and careers are launched.
              </p>
            </section>

            <section className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-dark-900/50 border border-white/5 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-2">For Producers</h3>
                <p className="text-gray-400">
                  Total control over your catalog. Advanced analytics to understand your audience. Automated splits and instant sync licensing opportunities. We handle the business so you can focus on the sound.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-dark-900/50 border border-white/5 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-2">For Artists</h3>
                <p className="text-gray-400">
                  Access to a curated library of elite production. Transparent pricing and clear licensing terms. A platform designed to help you find that perfect sound that defines your next hit.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase tracking-widest text-primary mb-4">The DNA</h2>
              <p className="text-gray-300 mb-6">
                Founded by producers for producers, AudioGenes understands the nuances of the industry. We believe in:
              </p>
              <ul className="space-y-4">
                {[
                  "Transparency in every transaction",
                  "Quality over quantity curation",
                  "Empowering independent creators",
                  "Innovation in rights management"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <span className="w-2 h-2 bg-primary rounded-full mr-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="pt-8 border-t border-white/10">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6">Join the Movement</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                    <Button className="h-14 px-8 text-lg font-black uppercase tracking-wider bg-primary text-black hover:bg-white transition-all">
                        Get Started
                    </Button>
                </Link>
                <Link href="/contact">
                    <Button variant="outline" className="h-14 px-8 text-lg font-black uppercase tracking-wider border-white/20 hover:border-white transition-all">
                        Contact Us
                    </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
