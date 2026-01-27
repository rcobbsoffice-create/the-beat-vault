import { AbsoluteFill, useVideoConfig, interpolate, spring, useCurrentFrame } from 'remotion';
import React from 'react';

export interface MotionArtworkProps {
  pulseData?: number[]; // Array of pulse strengths
  albumArtUrl?: string;
  title?: string;
  producerName?: string;
}

export const MotionArtwork: React.FC<MotionArtworkProps> = ({
  pulseData,
  albumArtUrl,
  title,
  producerName,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get pulse for current frame
  const pulse = pulseData[frame] || 0;

  // Pulse effect (scale and glow)
  const scale = interpolate(pulse, [0, 1], [1, 1.1]);
  const glow = interpolate(pulse, [0, 1], [0, 20]);
  const opacity = interpolate(pulse, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Background with subtle reactive gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle, rgba(212, 175, 55, ${pulse * 0.2}) 0%, #000 70%)`,
          transform: `scale(${1 + pulse * 0.05})`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Album Art Container */}
        <div
          style={{
            width: 600,
            height: 600,
            position: 'relative',
            transform: `scale(${scale})`,
            boxShadow: `0 0 ${glow}px rgba(212, 175, 55, 0.5)`,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <img
            src={albumArtUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Text Details */}
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: 4,
              opacity,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 32,
              color: '#D4AF37',
              marginTop: 10,
              fontWeight: 500,
              letterSpacing: 2,
            }}
          >
            {producerName}
          </p>
        </div>
      </div>
      
      {/* Bass Pulse Bloom */}
      <AbsoluteFill
        style={{
          border: `${pulse * 10}px solid rgba(212, 175, 55, ${pulse * 0.3})`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
