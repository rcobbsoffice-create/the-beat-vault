import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Send, Music, Mic2, Globe, History, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { router } from 'expo-router';

export default function ArtistQuestionnairePage() {
  const { user } = useAuth();
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
    if (!user) {
        Alert.alert('Error', 'You must be logged in to submit.');
        return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('artist_questionnaires')
        .insert({
          artist_id: user.id,
          responses: responses,
          status: 'pending'
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center p-8">
        <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-8 border border-green-500/30">
          <CheckCircle size={48} color="#10B981" />
        </View>
        <Text className="text-3xl font-black uppercase text-white mb-4 text-center">You're in the Queue!</Text>
        <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8 text-center leading-relaxed">
          Our AI-powered editorial system and human curators are analyzing your story. 
          You'll be notified if an article is generated.
        </Text>
        <Button onPress={() => router.push('/dashboard')} className="w-full">
           <Text className="text-black font-bold">Go to Dashboard</Text>
        </Button>
      </View>
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
  const Icon = currentStep.icon;

  return (
    <ScrollView className="flex-1 bg-dark-950" contentContainerStyle={{ padding: 24, minHeight: '100%' }}>
      {/* Header */}
      <View className="mb-12 items-center">
        <Badge variant="outline" className="mb-4 bg-primary/20 border-primary/30">
           <Text className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Editorial Submission</Text>
        </Badge>
        <Text className="text-4xl md:text-5xl font-black uppercase text-white italic text-center leading-none mb-8">
          TELL YOUR <Text className="text-primary">STORY</Text>
        </Text>
        
        {/* Progress Bar */}
        <View className="flex-row gap-2 w-full max-w-sm">
           {steps.map((s) => (
             <View 
               key={s.id} 
               className={`h-1.5 flex-1 rounded-full ${s.id <= step ? 'bg-primary' : 'bg-dark-800'}`} 
             />
           ))}
        </View>
      </View>

      <Card className="p-6 md:p-8 bg-dark-900/50 border-white/5 relative overflow-hidden min-h-[400px]">
        {/* Background Icon */}
        <View className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Icon size={120} color="#fff" />
        </View>
        
        <View className="relative z-10 gap-6 flex-1">
          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">{currentStep.title}</Text>
            <Text className="text-2xl font-black italic text-white tracking-tight">{currentStep.label}</Text>
          </View>

          <TextInput 
            className="flex-1 bg-dark-950 border border-white/10 rounded-2xl p-6 text-lg text-white text-base min-h-[200px]"
            placeholder="Write from the heart..."
            placeholderTextColor="#374151"
            value={(responses as any)[currentStep.field]}
            onChangeText={(text) => setResponses({...responses, [currentStep.field]: text})}
            multiline
            textAlignVertical="top"
          />

          <View className="flex-row items-center justify-between mt-auto pt-4">
            <Button 
              variant="ghost" 
              onPress={handleBack} 
              disabled={step === 1}
              className={`${step === 1 ? 'opacity-0' : 'opacity-100'}`}
            >
              <Text className="font-black uppercase tracking-widest text-xs text-gray-500">Back</Text>
            </Button>
            
            {step === totalSteps ? (
              <Button 
                onPress={handleSubmit} 
                isLoading={loading}
                className="px-8 py-3 rounded-xl"
              >
                <Text className="text-black font-black uppercase tracking-widest">Submit Story</Text>
              </Button>
            ) : (
              <Button 
                onPress={handleNext} 
                className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl"
              >
                <Text className="text-white font-black uppercase tracking-widest">Next</Text>
              </Button>
            )}
          </View>
        </View>
      </Card>

      <Text className="text-center mt-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        Integrated Editorial System v2.1 • AudioGenes Exclusive
      </Text>
    </ScrollView>
  );
}
