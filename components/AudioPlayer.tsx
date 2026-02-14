import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import WaveSurfer from 'wavesurfer.js';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  X,
  Repeat,
  Shuffle,
  ListMusic,
  Activity
} from 'lucide-react-native';
import { usePlayer } from '@/stores/player';
import { LinearVisualizer } from './LinearVisualizer';
import { Link } from 'expo-router';

export function AudioPlayer() {
  const waveformRef = useRef<any>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(0.7);

  const {
    currentBeat,
    isPlaying,
    volume,
    currentTime,
    duration,
    play,
    pause,
    setVolume,
    setCurrentTime,
    setDuration,
    setAnalyser: setGlobalAnalyser,
    playNext,
    playPrevious,
    reset,
    analyser
  } = usePlayer();

  // Initialize WaveSurfer
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!waveformRef.current || !currentBeat || !audioRef.current) return;

    // cleanup old instance
    if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
    }

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      media: audioRef.current,
      waveColor: 'rgba(255, 255, 255, 0.05)',
      progressColor: 'rgba(212, 175, 55, 0.1)',
      cursorColor: '#005CB9',
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 1,
      height: 48,
      barGap: 3,
      normalize: true,
    });

    wavesurfer.on('ready', () => {
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume);
      if (isPlaying) {
        wavesurfer.play().catch(err => {
          console.log('Autoplay blocked:', err);
        });
      }
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('finish', () => {
      playNext();
    });

    wavesurferRef.current = wavesurfer;

    return () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
            wavesurferRef.current = null;
        }
        setIsReady(false);
    };
  }, [currentBeat?.id]);

  // AudioContext setup for visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Unlock audio on first user interaction (mobile requirement)
  useEffect(() => {
    if (Platform.OS !== 'web' || audioUnlocked) return;

    const unlockAudio = async () => {
      try {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        if (audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              audioRef.current?.pause();
              setAudioUnlocked(true);
            }).catch(() => {
              // Autoplay blocked, will work on next user interaction
            });
          }
        }
      } catch (err) {
        console.log('Audio unlock attempted:', err);
      }
    };

    // Listen for first user interaction
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, [audioUnlocked]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!audioRef.current || !isPlaying || analyser) return;

    const setupAnalyser = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        // Always try to resume on mobile
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        if (!sourceNodeRef.current) {
          sourceNodeRef.current = audioContext.createMediaElementSource(audioRef.current);
          const newAnalyser = audioContext.createAnalyser();
          newAnalyser.fftSize = 256;
          
          sourceNodeRef.current.connect(newAnalyser);
          newAnalyser.connect(audioContext.destination);
          setGlobalAnalyser(newAnalyser);
        }
      } catch (err) {
        console.warn('AudioContext setup failed:', err);
      }
    };

    setupAnalyser();
  }, [isPlaying]);

  // Sync play/pause state
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!wavesurferRef.current || !isReady) return;

    const handlePlayback = async () => {
      if (isPlaying) {
        // Resume AudioContext if suspended (critical for mobile)
        if (audioContextRef.current?.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
          } catch (err) {
            console.warn('Failed to resume AudioContext:', err);
          }
        }
        wavesurferRef.current.play().catch(e => console.warn('Play failed:', e));
      } else {
        wavesurferRef.current.pause();
      }
    };

    handlePlayback();
  }, [isPlaying, isReady]);

  // Sync volume
  useEffect(() => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolumeRef.current);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
    }
  }, [isMuted, volume, setVolume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const audioSrc = currentBeat?.preview_url || currentBeat?.audio_url;
  const artworkSrc = currentBeat?.artwork_url || null;

  // Sync play/pause state when src changes
  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.load();
    }
  }, [audioSrc]);

  if (!currentBeat) return null;

  return (
    <View className="fixed bottom-0 left-0 right-0 z-50 bg-dark-950/90 border-t border-white/10" style={{ position: 'fixed' as any, bottom: 0, left: 0, right: 0 }}>
      {/* Hidden Audio Element */}
      {Platform.OS === 'web' && (
          <audio 
            ref={audioRef} 
            src={audioSrc || ''}
            crossOrigin="anonymous"
            playsInline
            preload="metadata"
          />
      )}
      
      <View className="max-w-7xl mx-auto px-4 py-4 w-full">
        <View className="flex-row items-center gap-4">
          
          {/* Beat Info */}
          <View className="flex-row items-center gap-3 w-64 lg:w-80 overflow-hidden">
            <View className="w-16 h-16 rounded-lg overflow-hidden bg-dark-800">
              {artworkSrc ? (
                <Image 
                  source={{ uri: artworkSrc }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Activity size={24} color="#374151" />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Link href={`/beats/${currentBeat.id}`} asChild>
                <TouchableOpacity>
                  <Text className="font-medium text-white text-sm lg:text-base" numberOfLines={1}>
                    {currentBeat.title}
                  </Text>
                </TouchableOpacity>
              </Link>
              <Text className="text-xs text-gray-400" numberOfLines={1}>
                {currentBeat.producer?.display_name || 'Unknown Producer'}
              </Text>
            </View>
          </View>

          {/* Controls & Waveform */}
          <View className="flex-1 gap-1">
            <View className="flex-row items-center justify-center gap-4 md:gap-6">
              <TouchableOpacity><Shuffle size={16} color="#9CA3AF" /></TouchableOpacity>
              <TouchableOpacity onPress={playPrevious}><SkipBack size={20} color="#9CA3AF" /></TouchableOpacity>
              
              <TouchableOpacity
                onPress={async () => {
                  // Critical for mobile: resume AudioContext on user interaction
                  if (audioContextRef.current?.state === 'suspended') {
                    try {
                      await audioContextRef.current.resume();
                    } catch (err) {
                      console.warn('AudioContext resume failed:', err);
                    }
                  }
                  isPlaying ? pause() : play();
                }}
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={20} color="#0A0A0A" fill="#0A0A0A" />
                ) : (
                  <Play size={20} color="#0A0A0A" fill="#0A0A0A" className="ml-1" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={playNext}><SkipForward size={20} color="#9CA3AF" /></TouchableOpacity>
              <TouchableOpacity><Repeat size={16} color="#9CA3AF" /></TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="text-[10px] text-gray-400 w-8 text-right">
                {formatTime(currentTime)}
              </Text>
              <View className="flex-1 relative h-12 justify-center">
                {/* Visualizer Background */}
                <View className="absolute inset-0 opacity-50">
                  <LinearVisualizer 
                     analyser={analyser} 
                     isPlaying={isPlaying} 
                     height={32}
                  />
                </View>
                {/* Waveform Container */}
                <View ref={waveformRef} className="flex-1 z-10" />
              </View>
              <Text className="text-[10px] text-gray-400 w-8">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Volume & Actions */}
          <View className="hidden md:flex flex-row items-center gap-4 w-48 justify-end">
            <TouchableOpacity><ListMusic size={20} color="#9CA3AF" /></TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} color="#9CA3AF" />
                ) : (
                  <Volume2 size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
              {/* Note: Standard HTML range input for now on web */}
              {Platform.OS === 'web' && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  style={{ width: 80, accentColor: '#005CB9' }}
                />
              )}
            </View>
            <TouchableOpacity onPress={reset}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
