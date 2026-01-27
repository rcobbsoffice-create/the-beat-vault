'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Info, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface HeatmapDataPoint {
  position: number; // 0-1 (percentage of duration)
  intensity: number; // 0-1 (listening density)
  isDropoff?: boolean;
  isPeak?: boolean;
}

interface EngagementHeatmapProps {
  title: string;
  data: HeatmapDataPoint[];
  duration: number;
}

export function EngagementHeatmap({ title, data, duration }: EngagementHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw Heatmap
    ctx.clearRect(0, 0, width, height);
    
    // Gradient Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(0, 102, 204, 0.05)');
    bgGradient.addColorStop(1, 'rgba(0, 102, 204, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw intensity curve
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    data.forEach((p, i) => {
      const x = p.position * width;
      const y = height - (p.intensity * height * 0.8) - (height * 0.1);
      
      if (i === 0) ctx.lineTo(x, y);
      else {
        // Smooth curve
        const prevX = data[i-1].position * width;
        const prevY = height - (data[i-1].intensity * height * 0.8) - (height * 0.1);
        const cpX = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
      }
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    
    // Fill with blue glow
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, 'rgba(0, 102, 204, 0.4)');
    fillGradient.addColorStop(0.5, 'rgba(0, 102, 204, 0.2)');
    fillGradient.addColorStop(1, 'rgba(0, 102, 204, 0)');
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Line stroke
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Markers (Dropoffs/Peaks)
    data.forEach(p => {
      if (p.isDropoff || p.isPeak) {
        const x = p.position * width;
        const y = height - (p.intensity * height * 0.8) - (height * 0.1);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.isPeak ? '#0066cc' : '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

  }, [data]);

  return (
    <Card className="p-6 bg-dark-950 border-white/5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {title}
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary uppercase tracking-widest font-bold bg-primary/5">
              AI Engagement Analysis
            </Badge>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Granular listening density across track duration.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-bold">92% Retention</span>
           </div>
        </div>
      </div>

      <div className="relative h-48 w-full mt-4 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Hover info overlay placeholder */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <div className="absolute left-[35%] top-[10%] p-2 bg-dark-900 border border-primary/50 rounded-lg shadow-2xl z-20">
              <p className="text-[9px] text-primary font-black uppercase mb-1">Peak Engagement</p>
              <p className="text-xs text-white">01:12 - Hook Entry</p>
              <p className="text-[9px] text-gray-500">84% Repeat Playback</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between mt-4 px-1">
        <span className="text-[10px] text-gray-500 font-mono">0:00</span>
        <div className="flex gap-4">
           <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Hook
           </div>
           <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" /> Dropoff
           </div>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-3">
         <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
         <p className="text-[11px] text-gray-400 leading-relaxed">
           <strong className="text-white">AI Suggestion:</strong> Users are dropping off slightly before the first chorus bridge. Consider shortening the intro by 4 bars or adding an automation sweep at 00:45 to maintain tension.
         </p>
      </div>
    </Card>
  );
}
