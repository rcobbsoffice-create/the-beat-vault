'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VisualizerPreviewProps {
  pulseData: number[];
  albumArtUrl?: string;
}

export const VisualizerPreview: React.FC<VisualizerPreviewProps> = ({ 
  pulseData, 
  albumArtUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&auto=format&fit=crop' 
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (pulseData.length === 0) return;
    
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % pulseData.length);
    }, 1000 / 30); // 30fps

    return () => clearInterval(interval);
  }, [pulseData]);

  const pulse = pulseData[frame] || 0;

  return (
    <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Background Pulse */}
      <div 
        className="absolute inset-0 transition-transform duration-100"
        style={{
          background: `radial-gradient(circle, rgba(212, 175, 55, ${pulse * 0.2}) 0%, transparent 70%)`,
          transform: `scale(${1 + pulse * 0.1})`,
        }}
      />

      {/* Album Art */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <motion.div
          animate={{
            scale: 1 + pulse * 0.08,
            boxShadow: `0 0 ${pulse * 40}px rgba(212, 175, 55, 0.4)`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          className="w-full aspect-square rounded-xl overflow-hidden shadow-lg border-2 border-white/5"
        >
          <img 
            src={albumArtUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Bass Glow Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-75"
        style={{
          opacity: pulse * 0.3,
          boxShadow: 'inset 0 0 100px rgba(212, 175, 55, 0.2)',
        }}
      />
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
            Motion Engine Active • Pulse Sync: {Math.round(pulse * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
