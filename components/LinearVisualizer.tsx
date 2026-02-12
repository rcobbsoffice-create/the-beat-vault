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
  barColor = '#005CB9',
  barWidth = 2,
  barGap = 2
}: LinearVisualizerProps) {
  const canvasRef = useRef<any>(null); // Use any for web canvas
  const animationRef = useRef<number>(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // In RN web, the ref might be a div or a View component
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
        const y = displayHeight - barHeight;

        const gradient = ctx.createLinearGradient(x, displayHeight, x, y);
        gradient.addColorStop(0, `${barColor}66`);
        gradient.addColorStop(0.5, `${barColor}CC`);
        gradient.addColorStop(1, barColor);

        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
        
        // Symmetrical reflection (bottom)
        const reflectionHeight = barHeight * 0.4;
        const ry = displayHeight;
        const rGradient = ctx.createLinearGradient(x, ry, x, ry + reflectionHeight);
        rGradient.addColorStop(0, `${barColor}33`);
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
