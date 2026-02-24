import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
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
  Activity,
  Headphones
} from 'lucide-react-native';
import { usePlayer } from '@/stores/player';
import { Link } from 'expo-router';

export function AudioPlayer() {
  const audioRef = useRef<any>(null);
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
    playNext,
    playPrevious,
    reset
  } = usePlayer();

  // Audio Event Listeners
  useEffect(() => {
    if (Platform.OS !== 'web' || !audioRef.current) return;
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => playNext();
    const onPlay = () => play();
    const onPause = () => pause();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [setCurrentTime, setDuration, playNext, play, pause]);

  // Sync play/pause state
  useEffect(() => {
    if (Platform.OS !== 'web' || !audioRef.current) return;
    
    if (isPlaying && audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e: any) => console.warn('Play failed:', e));
      }
    } else if (!isPlaying && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (Platform.OS !== 'web' || !audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
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
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const audioSrc = currentBeat?.preview_url || currentBeat?.audio_url;
  const artworkSrc = currentBeat?.artwork_url || null;

  // Sync audio source when it changes
  useEffect(() => {
    if (Platform.OS !== 'web' || !audioRef.current || !audioSrc) return;
    
    // Check if the source is already the same to branch out unnecessary reloads
    if (audioRef.current.src !== audioSrc && audioRef.current.src !== window.location.origin + audioSrc) {
      audioRef.current.src = audioSrc;
      audioRef.current.load();
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e: any) => console.warn('Play failed:', e));
        }
      }
    }
  }, [audioSrc, isPlaying]);

  if (!currentBeat) return null;

  return (
    <View className="fixed bottom-0 left-0 right-0 z-50 bg-dark-950/90 border-t border-white/10" style={{ position: 'fixed' as any, bottom: 0, left: 0, right: 0 }}>
      {/* Hidden Audio Element */}
      {Platform.OS === 'web' && (
          <audio 
            ref={audioRef} 
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

          {/* Controls & Progress */}
          <View className="flex-1 gap-1">
            <View className="flex-row items-center justify-center gap-4 md:gap-6">
              <TouchableOpacity><Shuffle size={16} color="#9CA3AF" /></TouchableOpacity>
              <TouchableOpacity onPress={playPrevious}><SkipBack size={20} color="#9CA3AF" /></TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
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
              <View className="flex-1 relative h-6 justify-center">
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime || 0}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      setCurrentTime(time);
                      if (audioRef.current) {
                        audioRef.current.currentTime = time;
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      accentColor: '#005CB9', 
                      height: 4, 
                      cursor: 'pointer' 
                    }}
                  />
                ) : (
                  <View className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-blue-500" 
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} 
                    />
                  </View>
                )}
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
              <TouchableOpacity onPress={toggleMute} className="relative items-center justify-center">
                <View className="opacity-40">
                  <Headphones size={32} color="#0066cc" />
                </View>
                <View className="absolute inset-0 items-center justify-center">
                  {isMuted || volume === 0 ? (
                    <VolumeX size={16} color="#fff" />
                  ) : (
                    <Volume2 size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
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
                  style={{ width: 80, accentColor: '#005CB9', height: 4, cursor: 'pointer' }}
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
