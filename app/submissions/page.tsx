'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Mic2, Star, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { magazineService } from '@/lib/supabase/magazine';

export default function SubmissionsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState<'standard' | 'expedited'>('standard');
  
  const [formData, setFormData] = useState({
    artistName: '',
    genre: 'Hip Hop',
    releaseUrl: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await magazineService.submitArtistApplication({
        artist_name: formData.artistName,
        genre: formData.genre,
        release_url: formData.releaseUrl,
        bio: formData.bio,
        tier: tier,
        status: 'pending'
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <CheckCircle2 className="w-24 h-24 text-primary mb-8" />
        </motion.div>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Application Received</h1>
        <p className="text-gray-400 max-w-md text-lg font-medium leading-relaxed">
          Your profile has been sent to our {tier === 'expedited' ? 'priority' : 'standard'} review board. 
          Expect a response within {tier === 'expedited' ? '48 hours' : '5-7 business days'}.
        </p>
        <Button onClick={() => setSubmitted(false)} className="mt-12 font-black uppercase tracking-widest px-12 h-14">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-8">
              SUBMIT FOR <span className="text-primary italic">FEATURE</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Join the elite circle of verified ArtistFlow artists. Apply for profile verification, charts listing, and editorial features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Standard Submission */}
            <div 
              onClick={() => setTier('standard')}
              className={`p-8 bg-dark-900 border cursor-pointer rounded-3xl transition-all ${
                tier === 'standard' ? 'border-primary ring-2 ring-primary/20' : 'border-dark-800 hover:border-dark-600'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Mic2 className="w-6 h-6 text-white" />
                </div>
                {tier === 'standard' && <CheckCircle2 className="w-6 h-6 text-primary" />}
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Standard Review</h3>
              <p className="text-gray-500 font-medium mb-8">
                Basic verification and inclusion in the artist directory.
              </p>
              <ul className="space-y-4 mb-8">
                {['Verified Badge', 'Profile Listing', 'Stats Tracking'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>
              <Button variant={tier === 'standard' ? 'primary' : 'outline'} className="w-full font-black uppercase">
                {tier === 'standard' ? 'Selected' : 'Select Tier'}
              </Button>
            </div>

            {/* Expedited Submission */}
            <div 
              onClick={() => setTier('expedited')}
              className={`p-8 cursor-pointer rounded-3xl shadow-2xl transition-all transform md:-translate-y-4 ${
                tier === 'expedited' 
                  ? 'bg-primary border-primary ring-4 ring-primary/20 scale-105' 
                  : 'bg-dark-900 border-dark-800 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tier === 'expedited' ? 'bg-white/20' : 'bg-white/5'}`}>
                  <Star className={`w-6 h-6 ${tier === 'expedited' ? 'text-white fill-current' : 'text-gray-400'}`} />
                </div>
                {tier === 'expedited' && <CheckCircle2 className="w-6 h-6 text-white" />}
              </div>
              <h3 className={`text-2xl font-black uppercase mb-4 ${tier === 'expedited' ? 'text-white' : 'text-gray-300'}`}>Expedited Review</h3>
              <p className={`font-medium mb-8 ${tier === 'expedited' ? 'text-white/80' : 'text-gray-500'}`}>
                Priority editorial consideration and guaranteed charts placement.
              </p>
              <ul className="space-y-4 mb-8">
                {['48h Turnaround', 'Homepage Carousel', 'Editorial Review', 'Featured On History'].map((item) => (
                  <li key={item} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${tier === 'expedited' ? 'text-white' : 'text-gray-300'}`}>
                    {tier === 'expedited' ? <Zap className="w-4 h-4 text-white fill-current" /> : <CheckCircle2 className="w-4 h-4 text-primary" />} 
                    {item}
                  </li>
                ))}
              </ul>
              <Button className={`w-full font-black uppercase ${tier === 'expedited' ? 'bg-white text-primary hover:bg-white/90' : ''}`}>
                {tier === 'expedited' ? 'Applied for $49.00' : 'Select Tier'}
              </Button>
            </div>
          </div>

          {/* Submission Form */}
          <section className="bg-dark-900/50 border border-dark-800 p-12 rounded-3xl">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 border-b border-dark-800 pb-8">
              Artist Application
            </h2>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Artist Name</label>
                  <input 
                    type="text" 
                    value={formData.artistName}
                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                    className="w-full bg-black border-dark-800 rounded-lg p-4 focus:border-primary transition-colors text-white" 
                    placeholder="e.g. Metro Boomin" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Genre</label>
                  <select 
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full bg-black border-dark-800 rounded-lg p-4 focus:border-primary transition-colors text-white" 
                    required
                  >
                    <option>Hip Hop</option>
                    <option>Trap</option>
                    <option>Production</option>
                    <option>Electronic</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Latest Release URL</label>
                <input 
                  type="url" 
                  value={formData.releaseUrl}
                  onChange={(e) => setFormData({...formData, releaseUrl: e.target.value})}
                  className="w-full bg-black border-dark-800 rounded-lg p-4 focus:border-primary transition-colors text-white" 
                  placeholder="Spotify / SoundCloud link" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Artist Bio / Press Kit</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-black border-dark-800 rounded-lg p-4 h-32 focus:border-primary transition-colors text-white" 
                  placeholder="Tell us your story..." 
                  required
                ></textarea>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Application'}
              </Button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
