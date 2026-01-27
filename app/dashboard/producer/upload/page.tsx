'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Upload,
  Music,
  Image as ImageIcon,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  FileAudio,
  Wand2,
  Sparkles,
  Layers,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SampleAuditor } from '@/components/SampleAuditor';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useCatalogStore } from '@/stores/catalog';

const steps = ['Files', 'Details', 'Licenses', 'Review'];

const genres = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeat', 'Dance', 'Electronic', 'Rock'];
const moods = ['Dark', 'Energetic', 'Chill', 'Aggressive', 'Melodic', 'Emotional', 'Happy', 'Sad', 'Motivational'];
const keys = ['C Major', 'C Minor', 'D Major', 'D Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 'G Major', 'G Minor', 'A Major', 'A Minor', 'B Major', 'B Minor'];

export default function UploadPage() {
  const { fetchBeats } = useCatalogStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null); // New state for ZIP/Stems
  
  // Single beat metadata (for single upload)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [useAiMastering, setUseAiMastering] = useState(false);
  
  // Rights & Distribution
  const [isSyncReady, setIsSyncReady] = useState(false);
  const [label, setLabel] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isrc, setIsrc] = useState('');
  const [upc, setUpc] = useState('');

  // License pricing
  const [licenses, setLicenses] = useState({
    basic: { enabled: true, price: 29.99 },
    premium: { enabled: true, price: 49.99 },
    exclusive: { enabled: false, price: 199.99 },
    sync: { enabled: false, price: 499.99 },
  });

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.includes('audio') || 
              file.name.toLowerCase().endsWith('.wav') || 
              file.name.toLowerCase().endsWith('.mp3')
    );
    if (files.length > 0) {
      setAudioFiles(prev => [...prev, ...files]);
      // If adding first file, simulate AI analysis
      if (audioFiles.length === 0) {
        generateAiMetadata(files[0]);
      }
    }
  };

  const generateAiMetadata = async (file: File) => {
    setAiGenerating(true);
    try {
      // Convert file to base64
      // We limit to ~6MB to respect typical serverless constraints, 
      // but Gemini Flash can handle audio. For speed, we'll slice the first 5MB if it's huge.
      // Slicing audio is risky for encoding integrity (wav headers etc), so let's try full file first 
      // but catch payload too large errors.
      
      const buffer = await file.arrayBuffer();
      // Safety check for payload size (Vercel has 4.5MB limit on hobby, generic Next is larger).
      // We'll fallback to filename only if too big.
      const isTooLarge = buffer.byteLength > 4 * 1024 * 1024;
      
      let body: any = { filename: file.name };
      
      if (!isTooLarge) {
        // Convert to base64
        const base64String = Buffer.from(buffer).toString('base64');
        const mimeType = file.type || 'audio/mpeg';
        body.fileBase64 = `data:${mimeType};base64,${base64String}`;
        body.contentType = mimeType;
      } else {
        toast('File too large for full AI listening. Using filename analysis.', { icon: '⚠️' });
      }

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      }
      const data = await response.json();

      setTitle(data.title);
      setBpm(data.bpm.toString());
      setKey(data.key);
      setGenre(data.genre);
      setDescription(data.description);
      setSelectedMoods(data.moods);
      setLabel(data.suggested_label);
      setPublisher(data.suggested_publisher);

      toast.success('AI Metadata Generated!', {
        icon: '✨',
        style: {
          background: '#0A0A0A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        }
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast.error('AI analysis failed. Using fallback defaults.');
      // Generic fallback
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const token = session.access_token;
      const beatId = crypto.randomUUID();
      
      // 1. Upload Artwork if exists
      let artwork_url = null;
      if (artworkFile) {
        const artRes = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: artworkFile.name, contentType: artworkFile.type, type: 'artwork' }),
        });
        
        if (!artRes.ok) {
          const errorData = await artRes.json();
          throw new Error(`Failed to get presigned URL for artwork: ${errorData.error || artRes.statusText}`);
        }

        const { uploadUrl, key } = await artRes.json();
        
        try {
          await fetch(uploadUrl, { 
            method: 'PUT', 
            body: artworkFile, 
            headers: { 'Content-Type': artworkFile.type } 
          });
        } catch (err: any) {
          if (err.name === 'TypeError') {
            throw new Error('Artwork upload failed (CORS Error). Please follow the guide in docs/R2_CORS_FIX.md.');
          }
          throw err;
        }
        
        artwork_url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
      }

      // 2. Upload Main Audio
      const audioFile = audioFiles[0];
      const audioRes = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ filename: audioFile.name, contentType: audioFile.type, type: 'original' }),
      });

      if (!audioRes.ok) {
        const errorData = await audioRes.json();
        throw new Error(`Failed to get presigned URL: ${errorData.error || audioRes.statusText}`);
      }

      const { uploadUrl: audioUploadUrl, key: audioKey } = await audioRes.json();
      
      console.log('Attempting upload to R2:', { url: audioUploadUrl, key: audioKey });

      try {
        const uploadResponse = await fetch(audioUploadUrl, { 
          method: 'PUT', 
          body: audioFile, 
          headers: { 
            'Content-Type': audioFile.type,
          } 
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload to R2 failed with status: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
      } catch (err: any) {
        console.error('R2 Fetch Error Details:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
          url: audioUploadUrl
        });
        
        if (err.name === 'TypeError') {
          console.error('R2 CORS Error detected. Redirecting user to fix instructions.');
          throw new Error('CRITICAL: R2 CORS Policy Missing. Your browser is blocking the upload. Please follow the "Fixing Cloudflare R2 CORS" guide in docs/R2_CORS_FIX.md to allow http://localhost:3000.');
        }
        throw err;
      }
      const audio_url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${audioKey}`;

      // 2.5. Upload Project ZIP if exists (Issue 2)
      let stems_url = null;
      if (projectFile) {
        const zipRes = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: projectFile.name, contentType: projectFile.type || 'application/zip', type: 'stems' }),
        });
        
        if (!zipRes.ok) {
          const errorData = await zipRes.json();
          throw new Error(`Failed to get presigned URL for project file: ${errorData.error || zipRes.statusText}`);
        }

        const { uploadUrl, key: zipKey } = await zipRes.json();
        
        try {
          await fetch(uploadUrl, { 
            method: 'PUT', 
            body: projectFile, 
            headers: { 'Content-Type': projectFile.type || 'application/zip' } 
          });
        } catch (err: any) {
          if (err.name === 'TypeError') {
            throw new Error('Project file upload failed (CORS Error).');
          }
          throw err;
        }
        
        stems_url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${zipKey}`;
      }

      // 3. Create record in Supabase
      const createRes = await fetch('/api/beats/create', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          beatId,
          title,
          description,
          genre,
          bpm,
          key,
          mood_tags: selectedMoods,
          audio_url,
          preview_url: audio_url,
          artwork_url,
          stems_url,
          licenses
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.ok ? await createRes.json() : { error: createRes.statusText };
        console.error('Beat creation failed:', errorData);
        throw new Error(`Failed to create beat record: ${errorData.error || createRes.statusText}`);
      }

      const { beatId: confirmedBeatId } = await createRes.json();

      // 4. Trigger Audio Analysis (Motion Engine)
      try {
        fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ beat_id: confirmedBeatId }),
        }).catch(err => console.error('Silent failure in audio analysis trigger:', err));
      } catch (e) {
        console.error('Failed to trigger audio analysis:', e);
      }
      
      toast.success('Beat Published Successfully!');
      setIsSuccess(true);
      fetchBeats(); // Refresh catalog in background
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return audioFiles.length > 0;
      case 1: return title && genre && bpm && key; // Validation for single beat flow
      case 2: return Object.values(licenses).some(l => l.enabled && l.price > 0);
      default: return true;
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center text-success shadow-xl shadow-success/10 border-2 border-success/30">
          <Check className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Beat Published!</h1>
          <p className="text-gray-400 max-w-sm mx-auto">
            Your {audioFiles.length > 1 ? 'beats have' : 'beat has'} been successfully uploaded and finalized.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-4">
          <Link href="/dashboard/producer/beats" className="flex-1">
            <Button fullWidth className="bg-primary text-black font-bold h-14">
              View My Catalog
            </Button>
          </Link>
          <Button 
            fullWidth 
            variant="outline" 
            className="flex-1 h-14"
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(0);
              setAudioFiles([]);
              setArtworkFile(null);
            }}
          >
            Upload Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Beat</h1>
            <p className="text-gray-400">Add new beats to your catalog</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    index < currentStep 
                      ? 'bg-success text-white' 
                      : index === currentStep 
                        ? 'bg-primary text-white' 
                        : 'bg-dark-800 text-gray-400'
                  }`}>
                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`text-sm mt-2 ${index === currentStep ? 'text-white' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-success' : 'bg-dark-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card className="p-8">
            {/* Step 1: Files */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Upload Audio Files</h2>
                  {audioFiles.length > 1 && (
                    <Badge variant="primary">Batch Mode Active</Badge>
                  )}
                </div>
                
                {/* Audio Upload */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleAudioDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    audioFiles.length > 0
                      ? 'border-success bg-success/5' 
                      : 'border-dark-600 hover:border-primary'
                  }`}
                >
                  {audioFiles.length > 0 ? (
                    <div className="space-y-3">
                      {audioFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-dark-800 p-3 rounded-lg border border-dark-700">
                          <div className="flex items-center gap-4">
                            <FileAudio className="w-8 h-8 text-success" />
                            <div className="text-left">
                              <p className="font-medium text-white">{file.name}</p>
                              <p className="text-xs text-gray-400">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAudioFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="pt-4">
                        <label className="cursor-pointer text-sm text-primary hover:text-primary-dark">
                          + Add more files
                          <input
                            type="file"
                            accept=".mp3,.wav,audio/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                setAudioFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <Layers className="w-12 h-12 text-gray-400" />
                          <Upload className="w-6 h-6 text-primary absolute -bottom-1 -right-1 bg-dark-950 rounded-full" />
                        </div>
                      </div>
                      <p className="text-white mb-2">Drag & drop your audio files here</p>
                      <p className="text-sm text-gray-400 mb-4">Supports Batch Upload (WAV, MP3, Stems / Zip)</p>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                          Browse Files
                        </span>
                        <input
                          type="file"
                          accept=".mp3,.wav,audio/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = Array.from(e.target.files);
                              setAudioFiles(files);
                              if (files.length > 0) generateAiMetadata(files[0]);
                            }
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* AI Mastering Option */}
                <div 
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden group ${
                    useAiMastering 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' 
                      : 'border-dark-600 hover:border-dark-500 bg-dark-800'
                  }`} 
                  onClick={() => setUseAiMastering(!useAiMastering)}
                >
                  {useAiMastering && (
                    <div className="absolute w-[200%] h-full top-0 -translate-x-full transition-transform duration-1500 bg-linear-to-r from-transparent via-white/5 to-transparent animate-slide-in pointer-events-none" />
                  )}
                  <div className="mt-1">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        useAiMastering ? 'bg-primary border-primary' : 'border-gray-500'
                    }`}>
                      {useAiMastering && <Check className="w-3 h-3 text-black" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">AI Audio Mastering</h3>
                      <Badge variant="primary" className="bg-primary text-black border-primary">New</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Automatically optimize your tracks for generic playback. 
                      Ensures maximum loudness and clarity.
                    </p>
                  </div>
                </div>

                {/* Artwork Upload */}
                <h2 className="text-xl font-semibold text-white pt-4">Artwork (Optional)</h2>
                <div className="flex items-center gap-4">
                  <div className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center ${
                    artworkFile ? 'border-success' : 'border-dark-600'
                  }`}>
                    {artworkFile ? (
                      <img
                        src={URL.createObjectURL(artworkFile)}
                        alt="Artwork"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm">
                        Upload Artwork
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && setArtworkFile(e.target.files[0])}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">500x500 recommended</p>
                  </div>
                </div>

                {/* ZIP/Stems Upload (Issue 2) */}
                <h2 className="text-xl font-semibold text-white pt-4">Project Files / Stems (Optional)</h2>
                <div className="p-6 border-2 border-dashed border-dark-600 rounded-xl hover:border-primary transition-colors bg-dark-900/50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-dark-800 flex items-center justify-center shrink-0 border border-white/5">
                      <Layers className={`w-8 h-8 ${projectFile ? 'text-primary' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold mb-1">{projectFile ? projectFile.name : 'Upload ZIP or Stems'}</p>
                      <p className="text-xs text-gray-400 mb-3">Include trackouts, MIDI, or FLP for Exclusive licenses.</p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors">
                        <Upload className="w-3 h-3" />
                        {projectFile ? 'Change File' : 'Browse Files'}
                        <input
                          type="file"
                          accept=".zip,.rar,.7z"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && setProjectFile(e.target.files[0])}
                        />
                      </label>
                      {projectFile && (
                        <button 
                          onClick={() => setProjectFile(null)}
                          className="ml-4 text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Beat Metadata</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-primary hover:bg-primary/10"
                    onClick={() => audioFiles[0] && generateAiMetadata(audioFiles[0])}
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {aiGenerating ? 'Analyzing...' : 'Regenerate AI Data'}
                  </Button>
                </div>

                {audioFiles.length > 1 && (
                   <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center gap-3 mb-4">
                     <Layers className="w-5 h-5 text-primary" />
                     <p className="text-sm text-primary-light">
                       Batch editing <strong>{audioFiles.length} beats</strong>. Metadata entered here will apply to all files unless edited individually later.
                     </p>
                   </div>
                )}
                
                <Input
                  label="Title"
                  placeholder={audioFiles.length > 1 ? "Use filenames (Default)" : "Enter beat title"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={audioFiles.length > 1}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="AI will generate a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      BPM
                    </label>
                    <Input
                      type="number"
                      placeholder="140"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Key
                    </label>
                    <select
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-foreground"
                    >
                      <option value="">Select key</option>
                      {keys.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Genre
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                          genre === g
                            ? 'bg-primary text-black font-medium'
                            : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mood Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => handleMoodToggle(mood)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                          selectedMoods.includes(mood)
                            ? 'bg-secondary text-black font-medium'
                            : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rights & Distribution */}
                <div className="pt-6 border-t border-dark-700 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Rights & Distribution</h2>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                      <ShieldCheck className="w-3 h-3" /> Rights Aware
                    </Badge>
                  </div>

                  <SampleAuditor onComplete={(cleared) => console.log('Rights cleared:', cleared)} />

                  <div 
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden group ${
                      isSyncReady 
                        ? 'border-success bg-success/10 shadow-lg shadow-success/5' 
                        : 'border-dark-600 hover:border-dark-500 bg-dark-800'
                    }`} 
                    onClick={() => setIsSyncReady(!isSyncReady)}
                  >
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSyncReady ? 'bg-success border-success' : 'border-gray-500'
                      }`}>
                        {isSyncReady && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">Opt-in to Sync Licensing</h3>
                        <Badge variant="success" className="bg-success text-white border-success">Sync Ready</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Make this track available for film, TV, and advertising licensing via ArtistFlow API.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Record Label"
                      placeholder="e.g. Independent"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    />
                    <Input
                      label="Publisher"
                      placeholder="e.g. Self-Published"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ISRC (Optional)"
                      placeholder="e.g. US-ABC-12-34567"
                      value={isrc}
                      onChange={(e) => setIsrc(e.target.value)}
                    />
                    <Input
                      label="UPC (Optional)"
                      placeholder="e.g. 190296991234"
                      value={upc}
                      onChange={(e) => setUpc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Licenses */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">License Pricing</h2>
                <p className="text-gray-400 text-sm">Set your prices for each license tier</p>

                {/* Basic License */}
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  licenses.basic.enabled ? 'border-primary bg-primary/5' : 'border-dark-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={licenses.basic.enabled}
                        onChange={(e) => setLicenses(l => ({ ...l, basic: { ...l.basic, enabled: e.target.checked } }))}
                        className="w-5 h-5 accent-primary"
                      />
                      <div>
                        <h3 className="font-semibold text-white">Basic License</h3>
                        <p className="text-sm text-gray-400">MP3 file, personal use</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={licenses.basic.price}
                          onChange={(e) => setLicenses(l => ({ ...l, basic: { ...l.basic, price: parseFloat(e.target.value) } }))}
                          className="w-full pl-8 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg"
                          disabled={!licenses.basic.enabled}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge>MP3</Badge>
                    <Badge>Non-exclusive</Badge>
                    <Badge>10K streams</Badge>
                  </div>
                </div>

                {/* Premium License */}
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  licenses.premium.enabled ? 'border-secondary bg-secondary/5' : 'border-dark-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={licenses.premium.enabled}
                        onChange={(e) => setLicenses(l => ({ ...l, premium: { ...l.premium, enabled: e.target.checked } }))}
                        className="w-5 h-5 accent-secondary"
                      />
                      <div>
                        <h3 className="font-semibold text-white">Premium License</h3>
                        <p className="text-sm text-gray-400">WAV + MP3 files, commercial use</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={licenses.premium.price}
                          onChange={(e) => setLicenses(l => ({ ...l, premium: { ...l.premium, price: parseFloat(e.target.value) } }))}
                          className="w-full pl-8 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg"
                          disabled={!licenses.premium.enabled}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">WAV + MP3</Badge>
                    <Badge variant="secondary">Non-exclusive</Badge>
                    <Badge variant="secondary">500K streams</Badge>
                  </div>
                </div>

                {/* Exclusive License */}
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  licenses.exclusive.enabled ? 'border-warning bg-warning/5' : 'border-dark-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={licenses.exclusive.enabled}
                        onChange={(e) => setLicenses(l => ({ ...l, exclusive: { ...l.exclusive, enabled: e.target.checked } }))}
                        className="w-5 h-5 accent-warning"
                      />
                      <div>
                        <h3 className="font-semibold text-white">Exclusive License</h3>
                        <p className="text-sm text-gray-400">Full ownership + stems</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={licenses.exclusive.price}
                          onChange={(e) => setLicenses(l => ({ ...l, exclusive: { ...l.exclusive, price: parseFloat(e.target.value) } }))}
                          className="w-full pl-8 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg"
                          disabled={!licenses.exclusive.enabled}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="warning">Full Package</Badge>
                    <Badge variant="warning">Exclusive</Badge>
                    <Badge variant="warning">Unlimited</Badge>
                  </div>
                </div>

                {/* Sync License */}
                <div className={`p-6 rounded-xl border-2 transition-all ${
                  licenses.sync.enabled ? 'border-success bg-success/5' : 'border-dark-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={licenses.sync.enabled}
                        onChange={(e) => setLicenses(l => ({ ...l, sync: { ...l.sync, enabled: e.target.checked } }))}
                        className="w-5 h-5 accent-success"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">Sync Licensing</h3>
                          <Badge variant="success">API Ready</Badge>
                        </div>
                        <p className="text-sm text-gray-400">TV, Film, Ads, and Creator Platform usage</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={licenses.sync.price}
                          onChange={(e) => setLicenses(l => ({ ...l, sync: { ...l.sync, price: parseFloat(e.target.value) } }))}
                          className="w-full pl-8 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg"
                          disabled={!licenses.sync.enabled}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="success">Programmatic</Badge>
                    <Badge variant="success">Standard Sync</Badge>
                    <Badge variant="success">Rights-Locked</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Review & Publish</h2>
                
                {audioFiles.map((file, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-6 bg-dark-900 p-4 rounded-xl border border-dark-700">
                    {/* Preview */}
                    <div className="space-y-4">
                      <div className="aspect-square rounded-xl bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center relative overflow-hidden">
                        {artworkFile ? (
                          <img
                            src={URL.createObjectURL(artworkFile)}
                            alt="Artwork"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-16 h-16 text-gray-400" />
                        )}
                        {useAiMastering && (
                          <div className="absolute top-2 right-2 bg-primary text-black text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Mastered
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FileAudio className="w-4 h-4" />
                        {file.name}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Title</p>
                        <p className="text-lg font-semibold text-white">{idx === 0 && title ? title : file.name.replace(/\.[^/.]+$/, "")}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm text-gray-400">BPM</p>
                          <p className="text-white">{bpm || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Key</p>
                          <p className="text-white">{key || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Genre</p>
                        <Badge variant="primary" className="bg-primary text-black">{genre || 'None'}</Badge>
                      </div>
                      <div>
                         <p className="text-sm text-gray-400">Moods</p>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {selectedMoods.length > 0 ? selectedMoods.map(m => (
                             <Badge key={m}>{m}</Badge>
                           )) : <span className="text-gray-500">None selected</span>}
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={loading}
                  className="gap-2 bg-primary text-black hover:bg-primary-dark"
                >
                  <Upload className="w-4 h-4" />
                  Publish {audioFiles.length > 1 ? `All ${audioFiles.length} Beats` : 'Beat'}
                </Button>
              )}
            </div>
          </Card>
    </div>
  );
}
