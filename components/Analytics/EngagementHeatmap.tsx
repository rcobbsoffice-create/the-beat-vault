import React, { useEffect, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Zap } from 'lucide-react-native';

import { Svg, Path, Circle, G } from 'react-native-svg';

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
  const canvasRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current || dimensions.width === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    const { width, height } = dimensions;
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

  }, [data, dimensions]);

  // Generate SVG path for Native
  const generatePath = () => {
    if (dimensions.width === 0) return '';
    const { width, height } = dimensions;
    let path = `M 0 ${height}`;
    
    data.forEach((p, i) => {
      const x = p.position * width;
      const y = height - (p.intensity * height * 0.8) - (height * 0.1);
      
      if (i === 0) path += ` L ${x} ${y}`;
      else {
        const prevX = data[i-1].position * width;
        const prevY = height - (data[i-1].intensity * height * 0.8) - (height * 0.1);
        const cpX = (prevX + x) / 2;
        path += ` Q ${prevX} ${prevY}, ${cpX} ${(prevY + y) / 2}`;
      }
    });
    
    path += ` L ${width} ${height} Z`;
    return path;
  };

  return (
    <Card className="p-6 bg-dark-950 border-white/5 relative overflow-hidden">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold text-white">{title}</Text>
            <Badge variant="outline" className="border-primary/30 bg-primary/5">
              <Text className="text-[10px] text-primary uppercase tracking-widest font-bold">
                AI Engagement Analysis
              </Text>
            </Badge>
          </View>
          <Text className="text-xs text-gray-400 mt-1">Granular listening density across track duration.</Text>
        </View>
        <View className="flex-row items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <TrendingUp size={12} color="#D4AF37" />
          <Text className="text-[10px] text-primary font-bold">92% Retention</Text>
        </View>
      </View>

      <View 
        className="relative h-48 w-full mt-4 bg-black/40 rounded-2xl border border-white/5 overflow-hidden"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setDimensions({ width, height });
        }}
      >
        {Platform.OS === 'web' ? (
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ width: '100%', height: '100%' }}>
            {dimensions.width > 0 && (
              <Svg width={dimensions.width} height={dimensions.height}>
                <Path
                  d={generatePath()}
                  fill="rgba(0, 102, 204, 0.4)"
                  stroke="#0066cc"
                  strokeWidth="2"
                />
                {data.map((p, i) => {
                  if (p.isDropoff || p.isPeak) {
                    const x = p.position * dimensions.width;
                    const y = dimensions.height - (p.intensity * dimensions.height * 0.8) - (dimensions.height * 0.1);
                    return (
                      <Circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={p.isPeak ? "#0066cc" : "#ef4444"}
                        stroke="#000"
                        strokeWidth="1"
                      />
                    );
                  }
                  return null;
                })}
              </Svg>
            )}
          </View>
        )}
      </View>

      <View className="flex-row justify-between mt-4 px-1">
        <Text className="text-[10px] text-gray-500 font-mono">0:00</Text>
        <View className="flex-row gap-4">
           <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Hook</Text>
           </View>
           <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <Text className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Dropoff</Text>
           </View>
        </View>
        <Text className="text-[10px] text-gray-500 font-mono">
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      <View className="mt-6 pt-4 border-t border-white/5 flex-row items-start gap-3">
         <Zap size={16} color="#D4AF37" className="shrink-0 mt-0.5" />
         <Text className="text-[11px] text-gray-400 leading-relaxed flex-1">
           <Text className="text-white font-bold">AI Suggestion: </Text>
           Users are dropping off slightly before the first chorus bridge. Consider shortening the intro by 4 bars or adding an automation sweep at 00:45 to maintain tension.
         </Text>
      </View>
    </Card>
  );
}
