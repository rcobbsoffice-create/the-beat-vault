'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Sub-component for individual particles to handle their own hooks
function GeneticParticle({ p, i, springX, springY }: { p: any, i: number, springX: any, springY: any }) {
  const xTransform = useTransform(springX, [-0.5, 0.5], [-(10 + i * 5), 10 + i * 5]);
  const yTransform = useTransform(springY, [-0.5, 0.5], [-(10 + i * 5), 10 + i * 5]);

  return (
    <motion.div
      key={p.id}
      className="absolute w-2 h-2 rounded-full bg-primary/40 blur-sm flex items-center justify-center"
      initial={{
        x: p.x + "%",
        y: p.y + "%",
        scale: p.scale,
      }}
      animate={{
        y: ["0%", "-20%", "0%"],
        x: ["0%", p.driftX + "%", "0%"],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: p.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: p.delay,
      }}
      style={{
        x: xTransform,
        y: yTransform,
      }}
    >
      {/* Genetic Linkage Line */}
      <div className="w-px h-12 bg-linear-to-b from-primary/0 via-primary/20 to-primary/0 rotate-45" />
    </motion.div>
  );
}

export function SonicPulse() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Generate stable random particles on client side only
    const newParticles = [...Array(12)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 1.5 + 0.5,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 5,
      driftX: Math.random() > 0.5 ? 5 : -5
    }));
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Responsive spring values for mouse parallax
  const springX = useSpring(mousePos.x, { stiffness: 50, damping: 20 });
  const springY = useSpring(mousePos.y, { stiffness: 50, damping: 20 });

  const moveX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const moveY = useTransform(springY, [-0.5, 0.5], [-30, 30]);
  
  // Define constant transforms for background paths to avoid hook violation
  const moveXSlow = useTransform(moveX, (v) => v * -0.5);
  const moveYSlow = useTransform(moveY, (v) => v * -0.5);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
      {/* Animated Waveforms */}
      <div className="absolute inset-0 opacity-40">
        <svg
          viewBox="0 0 1440 800"
          className="w-full h-full preserve-3d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            style={{ x: moveX, y: moveY }}
            initial={{ d: "M0 400C240 320 480 480 720 400C960 320 1200 480 1440 400V800H0V400Z" }}
            animate={{
              d: [
                "M0 400C240 320 480 480 720 400C960 320 1200 480 1440 400V800H0V400Z",
                "M0 400C240 480 480 320 720 400C960 480 1200 320 1440 400V800H0V400Z",
                "M0 400C240 320 480 480 720 400C960 320 1200 480 1440 400V800H0V400Z",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="url(#gradient-blue)"
            fillOpacity="0.15"
          />
          <motion.path
            style={{ x: moveXSlow, y: moveYSlow }}
            initial={{ d: "M0 500C360 400 720 600 1080 500C1440 400 1800 600 2160 500V800H0V500Z" }}
            animate={{
              d: [
                "M0 500C360 400 720 600 1080 500C1440 400 1800 600 2160 500V800H0V500Z",
                "M0 500C360 600 720 400 1080 500C1440 600 1800 400 2160 500V800H0V500Z",
                "M0 500C360 400 720 600 1080 500C1440 400 1800 600 2160 500V800H0V500Z",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="url(#gradient-blue-2)"
            fillOpacity="0.1"
          />
          <defs>
            <linearGradient id="gradient-blue" x1="720" y1="400" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0066cc" />
              <stop offset="1" stopColor="#0066cc" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-blue-2" x1="1080" y1="500" x2="1080" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Genetic Particles */}
      {particles.map((p, i) => (
        <GeneticParticle 
          key={p.id} 
          p={p} 
          i={i} 
          springX={springX} 
          springY={springY} 
        />
      ))}

      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
}
