"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LogoParticle {
  id: number;
  y: number[];
  x: number[];
  duration: number;
  delay: number;
  left: string;
  top: string;
}

export default function WordCloudLogo({ size = 120 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<LogoParticle[]>([]);

  useEffect(() => {
    const newParticles = [...Array(6)].map((_, i) => ({
      id: i,
      y: [0, -30 - Math.random() * 40, 0],
      x: [0, (i % 2 === 0 ? 30 : -30) + Math.random() * 20, 0],
      duration: 3 + Math.random() * 2,
      delay: i * 0.4,
      left: `${(20 + Math.random() * 60).toFixed(2)}%`,
      top: `${(20 + Math.random() * 60).toFixed(2)}%`
    }));
    setParticles(newParticles);
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 1.5,
          ease: "easeOut"
        }}
        className="relative"
      >
        {/* Animated Concentric Rings */}
        {mounted && [1, 2, 3].map((i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                    opacity: [0, 0.4, 0], 
                    scale: [0.8, 1.8 + i * 0.2, 2.2 + i * 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full border-2 border-purple-400/30 -z-10"
            />
        ))}

        {/* Floating Particles Around Logo - Populated in useEffect */}
        {particles.map((p) => (
            <motion.div
                key={`p-${p.id}`}
                animate={{
                    y: p.y,
                    x: p.x,
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.5]
                }}
                transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut"
                }}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 -z-10"
                style={{
                    left: p.left,
                    top: p.top
                }}
            />
        ))}

        <motion.div
            animate={{
                y: [0, -10, 0],
                rotateZ: [-2, 2, -2]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="relative z-10"
        >
            <Image 
              src="/logo.svg" 
              alt="WordCloud Logo" 
              width={size} 
              height={size} 
              className="relative z-10 drop-shadow-2xl"
            />
            
            {/* Animated Glow Effect Around Logo */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(79, 70, 229, 0)",
                  "0 0 40px rgba(79, 70, 229, 0.4)",
                  "0 0 20px rgba(79, 70, 229, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-3xl"
            />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="flex flex-col items-center text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-1">
          Word<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Cloud</span>
        </h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.5em] mt-1 flex items-center gap-4">
             <span className="w-8 h-px bg-slate-100"></span>
             Interactive Experiences
             <span className="w-8 h-px bg-slate-100"></span>
        </p>
      </motion.div>
    </div>
  );
}
