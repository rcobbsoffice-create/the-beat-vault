'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
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

const steps = ['Files', 'Details', 'Licenses', 'Review'];

const genres = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeat', 'Dance', 'Electronic', 'Rock'];
const moods = ['Dark', 'Energetic', 'Chill', 'Aggressive', 'Melodic', 'Emotional', 'Happy', 'Sad', 'Motivational'];
const keys = ['C Major', 'C Minor', 'D Major', 'D Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 'G Major', 'G Minor', 'A Major', 'A Minor', 'B Major', 'B Minor'];

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  
  // Single beat metadata (for single upload)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [useAiMastering, setUseAiMastering] = useState(false);

  // License pricing
  const [licenses, setLicenses] = useState({
    basic: { enabled: true, price: 29.99 },
    premium: { enabled: true, price: 49.99 },
    exclusive: { enabled: false, price: 199.99 },
  });

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.includes('audio') || file.name.endsWith('.wav') || file.name.endsWith('.mp3')
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
    // Simulate AI analysis delay
    setTimeout(() => {
      // Mock AI suggestions based on filename
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      setBpm(Math.floor(Math.random() * (160 - 80) + 80).toString());
      setKey(keys[Math.floor(Math.random() * keys.length)]);
      setGenre(genres[Math.floor(Math.random() * genres.length)]);
      setDescription(`Professionally produced ${genres[Math.floor(Math.random() * genres.length)]} beat with ready-to-use stems. Perfect for recording artists looking for a unique sound.`);
      setAiGenerating(false);
      toast.success('AI Metadata Generated!', {
        icon: '✨',
        style: {
          background: '#0A0A0A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        }
      });
    }, 1500);
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
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`${audioFiles.length > 1 ? 'Beats' : 'Beat'} uploaded successfully!`);
    setLoading(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return audioFiles.length > 0;
      case 1: return title && genre && bpm && key; // Validation for single beat flow
      case 2: return Object.values(licenses).some(l => l.enabled && l.price > 0);
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            accept="audio/*"
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
                      <p className="text-sm text-gray-400 mb-4">Supports Batch Upload (WAV, MP3)</p>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                          Browse Files
                        </span>
                        <input
                          type="file"
                          accept="audio/*"
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
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    useAiMastering 
                      ? 'border-primary bg-primary/10' 
                      : 'border-dark-600 hover:border-dark-500 bg-dark-800'
                  }`} 
                  onClick={() => setUseAiMastering(!useAiMastering)}
                >
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
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center relative overflow-hidden">
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
      </main>
    </div>
  );
}
