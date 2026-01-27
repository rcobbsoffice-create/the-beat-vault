'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Save,
  Music,
  Image as ImageIcon,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  FileAudio,
  Sparkles,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  DollarSign as PriceIcon,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCatalogStore } from '@/stores/catalog';

const genres = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeat', 'Dance', 'Electronic', 'Rock'];
const moods = ['Dark', 'Energetic', 'Chill', 'Aggressive', 'Melodic', 'Emotional', 'Happy', 'Sad', 'Motivational'];
const keys = ['C Major', 'C Minor', 'D Major', 'D Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 'G Major', 'G Minor', 'A Major', 'A Minor', 'B Major', 'B Minor'];

export default function EditBeatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getBeat, updateBeat } = useCatalogStore();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');

  // AI Assistant state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState(false);
  const [suggestedFields, setSuggestedFields] = useState<string[]>([]);
  const [hasAIArtwork, setHasAIArtwork] = useState(false);

  // Rights & Pricing state
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [basicPrice, setBasicPrice] = useState(29.99);
  const [premiumPrice, setPremiumPrice] = useState(499.99);
  const [isSyncReady, setIsSyncReady] = useState(true);
  const [label, setLabel] = useState('Independent');
  const [publisher, setPublisher] = useState('Self-Published');
  const [isrc, setIsrc] = useState('');
  const [upc, setUpc] = useState('');
  const [status, setStatus] = useState<'published' | 'unpublished'>('published');
  
  // Load data from store
  useEffect(() => {
    const beat = getBeat(id);
    if (beat) {
      setTitle(beat.title);
      setGenre(beat.genre);
      setBpm(beat.bpm.toString());
      setKey(beat.key || '');
      setSelectedMoods(beat.moods || []);
      setDescription(beat.description || '');
      setStatus(beat.status as 'published' | 'unpublished');
      
      if (beat.price_basic) setBasicPrice(beat.price_basic);
      if (beat.price_premium) setPremiumPrice(beat.price_premium);
      if (beat.is_sync_ready !== undefined) setIsSyncReady(beat.is_sync_ready);
      if (beat.label) setLabel(beat.label);
      if (beat.publisher) setPublisher(beat.publisher);
      if (beat.isrc) setIsrc(beat.isrc);
      if (beat.upc) setUpc(beat.upc);
      if (beat.artwork_url) setArtworkUrl(beat.artwork_url);
    }
  }, [id, getBeat]);

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API update
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateBeat(id, {
      title,
      description,
      genre,
      bpm: parseInt(bpm) || 0,
      key,
      moods: selectedMoods,
      status,
      price_basic: basicPrice,
      price_premium: premiumPrice,
      is_sync_ready: isSyncReady,
      label,
      publisher,
      isrc,
      upc,
      artwork_url: artworkUrl,
    });

    setLoading(false);
    toast.success('Beat updated successfully!', {
       style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' }
    });
    router.push('/dashboard/producer/beats');
  };

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    setSuggestedFields([]);
    
    // Simulating deep audio analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setTitle('Cybernetic Horizon');
    setGenre('Electronic');
    setBpm('128');
    setKey('B Minor');
    setSelectedMoods(['Melodic', 'Energetic', 'Dark']);
    setDescription('A futuristic, high-energy electronic track featuring soaring synth leads and driving rhythmic foundations. Optimized for cinematic impact.');
    
    setSuggestedFields(['title', 'genre', 'bpm', 'key', 'moods', 'description']);
    setIsAnalyzing(false);
    toast.success('Audio analysis complete! Metadata optimized.', {
      icon: '✨',
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' }
    });
  };

  const handleAIGenerateArtwork = async () => {
    setIsGeneratingArtwork(true);
    // Simulating generative art AI
    await new Promise(resolve => setTimeout(resolve, 3500));
    const mockArtwork = 'https://picsum.photos/seed/' + id + '/800/800';
    setArtworkUrl(mockArtwork);
    setHasAIArtwork(true);
    setIsGeneratingArtwork(false);
    toast.success('Professional artwork generated and applied!', {
      icon: '🎨',
      style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/producer/beats">
            <Button variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Edit Beat</h1>
            <p className="text-gray-400">Update details for "{title}"</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Link href="/dashboard/producer/beats">
             <Button variant="ghost">Cancel</Button>
           </Link>
           <Button 
            className="bg-primary text-black font-bold gap-2 shadow-lg shadow-primary/20"
            onClick={handleSave}
            isLoading={loading}
           >
             <Save className="w-4 h-4" />
             Save Changes
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Artwork & Quick Info */}
        <div className="md:col-span-1 space-y-6">
           <Card className={`p-6 border-white/5 bg-dark-900/50 transition-all duration-700 ${hasAIArtwork ? 'ring-2 ring-primary/40 shadow-2xl shadow-primary/10' : ''}`}>
             <div className="aspect-square rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center relative overflow-hidden group mb-6">
                {artworkUrl ? (
                   <img src={artworkUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : hasAIArtwork ? (
                   <div className="absolute inset-0 bg-linear-to-br from-indigo-900 via-purple-900 to-black animate-gradient-slow flex items-center justify-center">
                      <div className="relative">
                         <Sparkles className="w-16 h-16 text-primary animate-pulse" />
                         <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                      </div>
                      <Badge className="absolute bottom-4 right-4 bg-primary text-black font-black">AI GENERATED</Badge>
                   </div>
                ) : (
                   <Music className="w-12 h-12 text-gray-700" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                   <Button size="sm" variant="outline">Replace Art</Button>
                </div>

                {isGeneratingArtwork && (
                   <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                      <p className="text-xs font-black uppercase text-primary tracking-tighter animate-pulse">Generative AI in Progress...</p>
                   </div>
                )}
             </div>
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">Audio File</label>
                   <div className="flex items-center gap-2 p-2 rounded bg-dark-950 border border-white/5">
                      <FileAudio className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-400 truncate flex-1">future_hendrix_final.wav</span>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-2">Beat Visibility</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setStatus('published')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-[10px] font-black uppercase transition-all ${
                          status === 'published' 
                            ? 'bg-success/10 border-success/30 text-success shadow-lg shadow-success/5' 
                            : 'bg-dark-950 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                         <div className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-success animate-pulse' : 'bg-gray-600'}`} />
                         Published
                      </button>
                      <button 
                        onClick={() => setStatus('unpublished')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-[10px] font-black uppercase transition-all ${
                          status === 'unpublished' 
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-lg shadow-orange-500/5' 
                            : 'bg-dark-950 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                         <div className={`w-1.5 h-1.5 rounded-full ${status === 'unpublished' ? 'bg-orange-500' : 'bg-gray-600'}`} />
                         Offline
                      </button>
                   </div>
                   <p className="mt-2 text-[10px] text-gray-500 italic">
                     {status === 'published' 
                       ? 'This beat is live in the marketplace.' 
                       : 'This beat is hidden from public view.'}
                   </p>
                </div>
             </div>
           </Card>

           <Card className="p-6 border-white/5 bg-dark-900/50 text-center space-y-4">
              <h3 className="font-bold text-white">Advanced Settings</h3>
              <p className="text-xs text-gray-500">Enable exclusive rights, sync licensing, or download trackouts.</p>
              <Button 
                fullWidth 
                variant="outline" 
                size="sm"
                onClick={() => setShowRightsModal(true)}
              >
                Manage Rights
              </Button>
           </Card>

           {/* AI Assistant Sidebar Section */}
           <Card className="p-6 border-primary/20 bg-linear-to-br from-primary/5 via-dark-900/50 to-secondary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                 <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                       <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-tighter">AI Assistant</h3>
                 </div>
                 
                 <Button 
                   fullWidth 
                   variant="outline" 
                   size="sm" 
                   className="justify-start gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 group/btn"
                   onClick={handleAIAnalyze}
                   disabled={isAnalyzing}
                 >
                    {isAnalyzing ? (
                       <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                       <FileAudio className="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] font-bold text-gray-300 group-hover/btn:text-white transition-colors">
                       {isAnalyzing ? 'Analyzing Audio...' : 'Analyze Audio Metadata'}
                    </span>
                 </Button>

                 <Button 
                   fullWidth 
                   variant="outline" 
                   size="sm" 
                   className="justify-start gap-2 border-secondary/20 hover:bg-secondary/10 hover:border-secondary/40 group/btn"
                   onClick={handleAIGenerateArtwork}
                   disabled={isGeneratingArtwork}
                 >
                    {isGeneratingArtwork ? (
                       <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                    ) : (
                       <ImageIcon className="w-4 h-4 text-secondary group-hover/btn:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] font-bold text-gray-300 group-hover/btn:text-white transition-colors">
                       {isGeneratingArtwork ? 'Generating Art...' : 'Generate AI Artwork'}
                    </span>
                 </Button>

                 <p className="text-[9px] text-gray-500 italic leading-tight">
                    Powered by AudioGenes Intelligence. Analyzes harmonic content and sonic energy.
                 </p>
              </div>
              {isAnalyzing && (
                 <div className="absolute inset-0 bg-black/20 animate-pulse pointer-events-none" />
              )}
           </Card>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2 space-y-6">
           <Card className={`p-8 space-y-6 transition-all duration-1000 ${suggestedFields.length > 0 ? 'border-primary/20 shadow-2xl shadow-primary/5' : ''}`}>
              <div className="relative">
                 <Input
                   label="Beat Title"
                   placeholder="Enter beat title"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className={suggestedFields.includes('title') ? 'ring-1 ring-primary/30 border-primary/20' : ''}
                 />
                 {suggestedFields.includes('title') && (
                    <Sparkles className="absolute right-3 top-9 w-4 h-4 text-primary animate-pulse" />
                 )}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Description
                  {suggestedFields.includes('description') && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                </label>
                <textarea
                  placeholder="Describe your beat..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-foreground placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium ${
                     suggestedFields.includes('description') ? 'border-primary/20 ring-1 ring-primary/10' : ''
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BPM
                  </label>
                  <Input
                    type="number"
                    placeholder="140"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    className={suggestedFields.includes('bpm') ? 'ring-1 ring-primary/30 border-primary/20 text-primary' : ''}
                  />
                  {suggestedFields.includes('bpm') && (
                     <Sparkles className="absolute right-3 top-9 w-4 h-4 text-primary animate-pulse" />
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Key
                  </label>
                  <select
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className={`w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none h-[42px] font-medium ${
                       suggestedFields.includes('key') ? 'border-primary/20 ring-1 ring-primary/10 text-primary' : ''
                    }`}
                  >
                    <option value="">Select key</option>
                    {keys.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  {suggestedFields.includes('key') && (
                     <Sparkles className="absolute right-8 top-9 w-4 h-4 text-primary animate-pulse" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Genre
                  {suggestedFields.includes('genre') && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={`px-4 py-2 text-sm rounded-full transition-all border ${
                        genre === g
                          ? suggestedFields.includes('genre') 
                             ? 'bg-primary border-primary text-black font-bold shadow-lg shadow-primary/40 ring-2 ring-primary/20' 
                             : 'bg-primary border-primary text-black font-bold shadow-lg shadow-primary/20'
                          : 'bg-dark-900 border-dark-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Mood Tags (Select up to 3)
                  {suggestedFields.includes('moods') && <Sparkles className="w-3 h-3 text-secondary animate-pulse" />}
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodToggle(mood)}
                      className={`px-4 py-2 text-sm rounded-full transition-all border ${
                        selectedMoods.includes(mood)
                          ? suggestedFields.includes('moods')
                             ? 'bg-secondary border-secondary text-black font-bold shadow-lg shadow-secondary/40 ring-2 ring-secondary/20'
                             : 'bg-secondary border-secondary text-black font-bold shadow-lg shadow-secondary/20'
                          : 'bg-dark-900 border-dark-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                 <Button 
                  className="bg-primary text-black font-bold gap-2 h-14 px-10 shadow-xl shadow-primary/20"
                  onClick={handleSave}
                  isLoading={loading}
                 >
                   Update Listing
                 </Button>
              </div>
           </Card>
        </div>
      </div>

      {/* Rights Management Modal */}
      {showRightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl bg-dark-900 border-dark-700 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-dark-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Rights</h2>
                  <p className="text-xs text-gray-500">Set pricing and metadata for "{title}"</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRightsModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              {/* License Pricing */}
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">License Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Basic License ($)</label>
                    <div className="relative">
                      <PriceIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="number"
                        value={basicPrice}
                        onChange={(e) => setBasicPrice(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Premium/Exclusive ($)</label>
                    <div className="relative">
                      <PriceIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="number"
                        value={premiumPrice}
                        onChange={(e) => setPremiumPrice(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Sync Licensing */}
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Distribution</h3>
                <div 
                  onClick={() => setIsSyncReady(!isSyncReady)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isSyncReady ? 'border-success/50 bg-success/5' : 'border-dark-700 bg-dark-800'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${
                    isSyncReady ? 'bg-success border-success' : 'border-gray-500'
                  }`}>
                    {isSyncReady && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Sync Licensing Opt-in</span>
                      <Badge className="bg-success text-white text-[10px] py-0 px-2 border-none">Sync Ready</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Make this track available for film, TV, and advertising licensing.</p>
                  </div>
                </div>
              </section>

              {/* Metadata */}
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Metadata (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Record Label" 
                    value={label} 
                    onChange={(e) => setLabel(e.target.value)} 
                    placeholder="e.g. Independent"
                  />
                  <Input 
                    label="Publisher" 
                    value={publisher} 
                    onChange={(e) => setPublisher(e.target.value)} 
                    placeholder="e.g. Self-Published"
                  />
                  <Input 
                    label="ISRC Code" 
                    value={isrc} 
                    onChange={(e) => setIsrc(e.target.value)} 
                    placeholder="e.g. US-ABC-12-34567"
                  />
                  <Input 
                    label="UPC Code" 
                    value={upc} 
                    onChange={(e) => setUpc(e.target.value)} 
                    placeholder="e.g. 190296991234"
                  />
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-white/5 bg-dark-900 sticky bottom-0 z-10">
              <Button 
                fullWidth 
                className="bg-primary text-black font-bold h-12"
                onClick={() => {
                  toast.success('Rights applied to listing');
                  setShowRightsModal(false);
                }}
              >
                Apply Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
