'use client';

import React, { useEffect, useRef } from 'react';

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
  barColor = '#D4AF37',
  barWidth = 2,
  barGap = 2
}: LinearVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      const { width: containerWidth } = containerRef.current!.getBoundingClientRect();
      canvas.width = containerWidth * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
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
        // Map bar index to frequency data (skip very high frequencies for better look)
        const index = Math.floor((i / numBars) * (bufferLength / 2.5));
        const val = dataArray[index];
        const barHeight = (val / 255) * displayHeight;

        const x = i * (barWidth + barGap);
        const y = displayHeight - barHeight;

        // Create gradient
        const gradient = ctx.createLinearGradient(x, displayHeight, x, y);
        gradient.addColorStop(0, `${barColor}66`);
        gradient.addColorStop(0.5, `${barColor}CC`);
        gradient.addColorStop(1, barColor);

        ctx.fillStyle = gradient;
        
        // Draw rounded bars
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

  return (
    <div ref={containerRef} style={{ width, height: height * 1.5 }} className="relative overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
