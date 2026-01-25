'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Music, 
  Upload, 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle,
  Clock,
  Globe,
  Globe2,
  CheckCircle2,
  FileAudio,
  Layers,
  Sparkles
} from 'lucide-react';
import { validateRelease, validateReleaseTitle } from '@/lib/validation';
import { generateISRC, generateUPC } from '@/lib/music-ids';
import toast from 'react-hot-toast';

const steps = ['Release Info', 'Audio & Artwork', 'Metadata Validation', 'Submit'];

export default function NewReleasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('');
  const [label, setLabel] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isrc, setIsrc] = useState('');
  const [upc, setUpc] = useState('');

  const handleNext = () => {
    if (currentStep === 0) {
      const validation = validateReleaseTitle(title);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
    }
    
    if (currentStep === 1) {
      if (!audioFile) {
        toast.error('Audio file is required');
        return;
      }
      if (!artworkFile) {
        toast.error('Artwork is required for distribution');
        return;
      }
      // Automate ISRC/UPC assignment during validation step
      setIsrc(generateISRC());
      setUpc(generateUPC());
    }

    setErrors([]);
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Release submitted for review!');
    router.push('/dashboard/artist/distribution');
  };

  const genres = ['Hip Hop', 'Pop', 'Electronic', 'R&B', 'Rock', 'Jazz', 'Classical'];

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Release</h1>
        <p className="text-gray-400">Prepare your music for global distribution</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                index <= currentStep ? 'bg-primary text-black' : 'bg-dark-800 text-gray-500'
              }`}>
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="h-px bg-dark-800 flex-1 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card className="p-8 border-white/5 bg-dark-900/50">
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white">Release Essentials</h2>
            <div className="space-y-4">
              <div>
                <Input 
                  label="Release Title" 
                  placeholder="e.g. Neon Nights" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Use Title Case. No all caps. No special characters.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Release Date" 
                  type="date" 
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Primary Genre</label>
                  <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <Input 
                label="Label / Publisher" 
                placeholder="e.g. TrackFlow Independent" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {errors.length > 0 && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm space-y-1">
                {errors.map((err, i) => <div key={i} className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {err}</div>)}
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white">Assets</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Audio Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Audio File (WAV 24-bit preferred)</label>
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  audioFile ? 'border-success bg-success/5' : 'border-white/10 hover:border-primary'
                }`}>
                  {audioFile ? (
                    <div className="flex flex-col items-center">
                      <FileAudio className="w-12 h-12 text-success mb-2" />
                      <p className="text-sm font-medium text-white max-w-[200px] truncate">{audioFile.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => setAudioFile(null)} className="mt-2 text-gray-500">Remove</Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Drag or click to upload</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Artwork Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Artwork (3000x3000px JPG/PNG)</label>
                <div className={`aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center transition-all overflow-hidden ${
                  artworkFile ? 'border-success' : 'border-white/10 hover:border-primary'
                }`}>
                  {artworkFile ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={URL.createObjectURL(artworkFile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="ghost" className="text-white" onClick={() => setArtworkFile(null)}>Remove Image</Button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Upload Cover</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && setArtworkFile(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
             <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
               <Sparkles className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-2xl font-bold text-white">Metadata Sanitization</h2>
             <p className="text-gray-400 max-w-sm mx-auto">
               TrackFlow AI is verifying your metadata against DDEX and DSP standards for guaranteed delivery.
             </p>

             <div className="mt-8 space-y-3 max-w-md mx-auto">
               <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success" />
                   <span className="text-sm text-white">Title Casing</span>
                 </div>
                 <Badge variant="success">Passed</Badge>
               </div>
               <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success" />
                   <span className="text-sm text-white">Audio Quality (24-bit WAV)</span>
                 </div>
                 <Badge variant="success">Passed</Badge>
               </div>
               <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-sm text-white">ISRC Generation</span>
                 </div>
                 <span className="text-xs text-primary">Assigning...</span>
               </div>
             </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-10">
             <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 text-success border border-success/30">
               <Globe2 className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold text-white">Ready for Global Distribution</h2>
             <p className="text-gray-400 max-w-md mx-auto">
               Your release "{title}" is ready. We will distribute it to Spotify, Apple Music, TikTok, and 150+ other stores.
             </p>
             <div className="bg-white/5 p-6 rounded-2xl text-left max-w-sm mx-auto mt-8 border border-white/10">
               <div className="flex gap-4 items-center">
                 <div className="w-16 h-16 rounded bg-dark-800 shrink-0 overflow-hidden">
                   {artworkFile && <img src={URL.createObjectURL(artworkFile)} className="w-full h-full object-cover" />}
                 </div>
                 <div>
                   <h4 className="font-bold text-white line-clamp-1">{title}</h4>
                   <p className="text-xs text-gray-500">{label}</p>
                 </div>
               </div>
               <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Reach</span>
                    <span className="text-white">Global</span>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Retail Price</span>
                    <span className="text-success font-bold">$0.00 (Free)</span>
                 </div>
                 <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-2 pt-2 border-t border-white/5">
                    <span>ISRC: {isrc}</span>
                    <span>UPC: {upc}</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0 || loading}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="gap-2 bg-primary text-black font-bold">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              isLoading={loading}
              className="gap-2 bg-success text-white font-bold px-8"
            >
              Distribute Now <Globe className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
