'use client';

import React, { useEffect, useRef } from 'react';

interface CircularVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  size?: number;
  barColor?: string;
}

export function CircularVisualizer({ 
  analyser, 
  isPlaying, 
  size = 120, 
  barColor = '#D4AF37' 
}: CircularVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        // Just clear or draw a static circle? Let's keep it animating slightly or clear
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = (size / 2) * 0.7; // Inner radius
      const bars = 60;
      const barWidth = 2;

      for (let i = 0; i < bars; i++) {
        const index = Math.floor((i / bars) * (bufferLength / 2));
        const val = dataArray[index];
        const barHeight = (val / 255) * (size / 4);

        const angle = (i * (360 / bars) * Math.PI) / 180;
        const xStart = centerX + Math.cos(angle) * radius;
        const yStart = centerY + Math.sin(angle) * radius;
        const xEnd = centerX + Math.cos(angle) * (radius + barHeight);
        const yEnd = centerY + Math.sin(angle) * (radius + barHeight);

        const gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
        gradient.addColorStop(0, `${barColor}33`); // 20% opacity at start
        gradient.addColorStop(0.5, `${barColor}AA`); // 66% opacity middle
        gradient.addColorStop(1, barColor); // 100% opacity at end

        ctx.strokeStyle = gradient;
        ctx.lineWidth = barWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }
      
      // Add a subtle glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = barColor;
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying, size, barColor]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size * 2} 
      height={size * 2} 
      style={{ width: size, height: size }}
      className="pointer-events-none"
    />
  );
}
