'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  ListMusic
} from 'lucide-react';
import { usePlayer } from '@/stores/player';
import Image from 'next/image';
import Link from 'next/link';
import { sanitizeUrl } from '@/lib/utils/url';

export function AudioPlayer() {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
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
    playNext,
    playPrevious,
    reset,
  } = usePlayer();

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current || !currentBeat) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 255, 255, 0.2)',
      progressColor: '#D4AF37',
      cursorColor: '#D4AF37',
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 1,
      height: 40,
      barGap: 3,
      normalize: true,
    });

    wavesurfer.load(sanitizeUrl(currentBeat.preview_url));

    wavesurfer.on('ready', () => {
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume);
      if (isPlaying) {
        wavesurfer.play();
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
      try {
        wavesurfer.destroy();
      } catch (err) {
        // Ignore AbortError during cleanup
        if (err instanceof Error && err.name !== 'AbortError') {
           console.error('WaveSurfer cleanup error:', err);
        }
      }
      if (wavesurferRef.current === wavesurfer) {
        wavesurferRef.current = null;
      }
    };
  }, [currentBeat?.id]);

  // Sync play/pause state
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;

    if (isPlaying) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
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

  if (!currentBeat) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 backdrop-blur-xl bg-dark-950/80">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Beat Info */}
          <div className="flex items-center gap-3 min-w-0 w-64">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
              {currentBeat.artwork_url ? (
                <Image 
                  src={sanitizeUrl(currentBeat.artwork_url)} 
                  alt={currentBeat.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-xl">
                  🎵
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link href={`/beats/${currentBeat.id}`}>
                <p className="font-medium text-white truncate hover:text-primary transition-colors">
                  {currentBeat.title}
                </p>
              </Link>
              <p className="text-sm text-gray-400 truncate">
                {currentBeat.producer?.display_name || 'Unknown Producer'}
              </p>
            </div>
          </div>

          {/* Controls & Waveform */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Shuffle className="w-4 h-4" />
              </button>
              <button 
                onClick={playPrevious}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (wavesurferRef.current) {
                    const ctx = (wavesurferRef.current as any).backend?.getAudioContext?.();
                    if (ctx?.state === 'suspended') ctx.resume();
                  }
                  isPlaying ? pause() : play();
                }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-dark-950" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 text-dark-950 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button 
                onClick={playNext}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Waveform & Time */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div ref={waveformRef} className="flex-1" />
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center gap-4 w-48 justify-end">
            <button className="text-gray-400 hover:text-white transition-colors">
              <ListMusic className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
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
                className="w-20 accent-primary"
              />
            </div>
            <button 
              onClick={reset}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
