'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent! We\'ll get back to you soon.');
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-primary selection:text-black">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Info Side */}
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 text-white">
                Get In Touch
              </h1>
              <p className="text-xl text-gray-400 mb-12 font-light">
                Have questions about licensing, technical support, or partnership opportunities? We're here to help amplify your sound.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-900 border border-white/10 text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">Email Us</h3>
                    <p className="text-gray-400 mb-1">General: hello@audiogenes.com</p>
                    <p className="text-gray-400">Support: support@audiogenes.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-900 border border-white/10 text-primary">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">Live Chat</h3>
                    <p className="text-gray-400">Available Mon-Fri, 9am - 6pm EST</p>
                    <p className="text-primary/60 text-sm mt-1">Look for the bubble in the bottom right.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-900 border border-white/10 text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">HQ</h3>
                    <p className="text-gray-400">AudioGenes Studios</p>
                    <p className="text-gray-400">Los Angeles, CA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-dark-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
                    <Input required placeholder="Jane" className="bg-black/50 border-white/10 h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                    <Input required placeholder="Doe" className="bg-black/50 border-white/10 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                  <Input required type="email" placeholder="jane@example.com" className="bg-black/50 border-white/10 h-12" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-lg h-12 px-3 text-white focus:ring-1 focus:ring-primary outline-none text-sm">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Licensing Question</option>
                    <option>Billing Issue</option>
                    <option>Partnership Proposal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                  <textarea 
                    required 
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-primary outline-none min-h-[150px] resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 text-lg font-black uppercase tracking-wider bg-primary text-black hover:bg-white transition-all"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
