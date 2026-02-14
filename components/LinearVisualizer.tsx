import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';

interface LinearVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  width?: string | number;
  height?: number;
  barColor?: string;
  barWidth?: number;
  barGap?: number;
}

export function LinearVisualizer({ 
  analyser, 
  isPlaying, 
  width = '100%', 
  height = 40,
  barColor = '#0066cc', // Premium Blue
  barWidth = 3,
  barGap = 2
}: LinearVisualizerProps) {
  const canvasRef = useRef<any>(null); // Use any for web canvas
  const animationRef = useRef<number>(0);
  const containerRef = useRef<View>(null);
  const bgBarColor = '#ff0033'; // Vibrant Red

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const element = canvas.parentElement;
      if (element) {
        const { width: containerWidth } = element.getBoundingClientRect();
        canvas.width = containerWidth * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const displayWidth = canvas.width / window.devicePixelRatio;
      const displayHeight = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const numBars = Math.floor(displayWidth / (barWidth + barGap));
      
      for (let i = 0; i < numBars; i++) {
        const index = Math.floor((i / numBars) * (bufferLength / 2.5));
        const val = dataArray[index];
        const barHeight = (val / 255) * displayHeight;

        const x = i * (barWidth + barGap);
        
        // 1. Draw Background Red "3D" Layer (slightly offset and blurred)
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = bgBarColor;
        ctx.fillStyle = `${bgBarColor}33`; // Faint red background
        
        const bgY = displayHeight - (barHeight * 1.1); // Slightly taller
        const bgX = x + 1; // Slight horizontal offset for 3D effect
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bgX, bgY, barWidth, barHeight * 1.1, [2, 2, 0, 0]);
        } else {
            ctx.rect(bgX, bgY, barWidth, barHeight * 1.1);
        }
        ctx.fill();
        ctx.restore();

        // 2. Draw Main Blue Foreground Layer
        const y = displayHeight - barHeight;
        const gradient = ctx.createLinearGradient(x, displayHeight, x, y);
        gradient.addColorStop(0, '#001122'); // Dark base
        gradient.addColorStop(0.5, '#005CB9');
        gradient.addColorStop(1, '#60A5FA'); // Bright top

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#60A5FA';
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
        
        // Symmetrical reflection (bottom) - muted
        const reflectionHeight = barHeight * 0.3;
        const ry = displayHeight;
        const rGradient = ctx.createLinearGradient(x, ry, x, ry + reflectionHeight);
        rGradient.addColorStop(0, '#005CB933');
        rGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = rGradient;
        
        ctx.beginPath();
        if (ctx.roundRect) {
             ctx.roundRect(x, ry, barWidth, reflectionHeight, [0, 0, 2, 2]);
        } else {
            ctx.rect(x, ry, barWidth, reflectionHeight);
        }
        ctx.fill();
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, height, barColor, barWidth, barGap]);

  if (Platform.OS !== 'web') {
      return <View style={{ width, height: height * 1.5 }} />;
  }

  return (
    <View ref={containerRef} style={{ width, height: height * 1.5, overflow: 'hidden', position: 'relative' }}>
        {/* @ts-ignore - canvas is not a standard RN component but works in RN Web */}
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </View>
  );
}
