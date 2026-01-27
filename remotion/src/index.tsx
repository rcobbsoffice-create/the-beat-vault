import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { MotionArtwork } from './Composition';

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MotionArtwork"
        component={MotionArtwork as any}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          pulseData: Array.from({ length: 900 }, () => Math.random() * 0.5),
          albumArtUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&auto=format&fit=crop',
          title: 'Sample Beat',
          producerName: 'AudioGenes AI',
        }}
      />
      <Composition
        id="SpotifyCanvas"
        component={MotionArtwork as any}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          pulseData: Array.from({ length: 240 }, () => Math.random() * 0.5),
          albumArtUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&auto=format&fit=crop',
          title: 'Sample Beat',
          producerName: 'AudioGenes AI',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
