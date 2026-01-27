'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Send, Music, Mic2, Globe, History, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ArtistQuestionnairePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState({
    musical_journey: '',
    major_influences: '',
    creative_process: '',
    upcoming_projects: '',
    message_to_fans: '',
    external_links: ''
  });

  const totalSteps = 6;

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('artist_questionnaires')
        .insert({
          artist_id: user.id,
          responses: responses,
          status: 'pending'
        });

      if (error) throw error;
      setSubmitted(true);
      toast.success('Questionnaire submitted! Our editors will review it soon.');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-success/30">
          <CheckCircle className="w-12 h-12 text-success" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-4">You're in the Queue!</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">
          Our AI-powered editorial system and human curators are analyzing your story. 
          You'll be notified if an article is generated.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
      </div>
    );
  }

  const steps = [
    {
      id: 1,
      title: "Your Journey",
      label: "Tell us how you started in music. What was the spark?",
      field: "musical_journey",
      icon: History
    },
    {
      id: 2,
      title: "The Sound",
      label: "Who are your major influences? What defines your sonic palette?",
      field: "major_influences",
      icon: Music
    },
    {
      id: 3,
      title: "The Process",
      label: "How do you approach a new track? Take us into the studio.",
      field: "creative_process",
      icon: Mic2
    },
    {
      id: 4,
      title: "The Vision",
      label: "What's next? Any upcoming releases or collaborations?",
      field: "upcoming_projects",
      icon: Sparkles
    },
    {
      id: 5,
      title: "The Legacy",
      label: "What's your ultimate message to your listeners?",
      field: "message_to_fans",
      icon: Globe
    },
    {
      id: 6,
      title: "Connections",
      label: "Drop your links (Spotify, Instagram, etc) for our research.",
      field: "external_links",
      icon: Send
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      {/* Header */}
      <div className="mb-12 text-center lg:text-left">
        <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
          Editorial Submission
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter italic leading-none">
          TELL YOUR <span className="text-primary">STORY</span>
        </h1>
        <div className="flex items-center gap-4 mt-8">
           {steps.map((s) => (
             <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s.id <= step ? 'bg-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-dark-800'}`} />
           ))}
        </div>
      </div>

      <Card className="p-8 sm:p-12 bg-dark-900/50 backdrop-blur-2xl border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <currentStep.icon className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{currentStep.title}</p>
            <h3 className="text-3xl font-black italic tracking-tight">{currentStep.label}</h3>
          </div>

          <textarea 
            className="w-full h-48 bg-dark-950 border border-white/10 rounded-2xl p-6 text-xl font-medium text-gray-300 placeholder:text-dark-700 focus:ring-1 focus:ring-primary focus:border-primary transition-all leading-relaxed shadow-inner"
            placeholder="Write from the heart..."
            value={(responses as any)[currentStep.field]}
            onChange={(e) => setResponses({...responses, [currentStep.field]: e.target.value})}
          />

          <div className="flex items-center justify-between pt-8">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className="font-black uppercase tracking-widest text-xs text-gray-500"
            >
              Back
            </Button>
            
            {step === totalSteps ? (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-primary text-black font-black uppercase tracking-widest px-12 py-6 rounded-2xl shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Story'}
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="bg-white/5 border border-white/10 hover:bg-white/10 font-black uppercase tracking-widest px-12 py-6 rounded-2xl transition-all"
              >
                Next Section
              </Button>
            )}
          </div>
        </div>
      </Card>

      <p className="text-center mt-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        Integrated Editorial System v2.1 • TrackFlow Exclusive
      </p>
    </div>
  );
}
