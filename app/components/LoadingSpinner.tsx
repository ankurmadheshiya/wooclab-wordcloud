"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  hideLabel?: boolean;
  color?: string;
}

export default function LoadingSpinner({ 
  size = "medium", 
  hideLabel = false,
  color = "bg-blue-600"
}: LoadingSpinnerProps) {
  const dotSize = size === "small" ? "w-2 h-2" : size === "large" ? "w-6 h-6" : "w-4 h-4";
  const containerMinHeight = size === "small" ? "min-h-0" : "min-h-[100px]";

  return (
    <div className={`flex items-center justify-center ${containerMinHeight}`}>
      <div className="relative flex items-center justify-center">
        {/* Main Pulsing Dot */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`${dotSize} ${color} rounded-full z-10 shadow-lg shadow-blue-500/30`}
        />

        {/* Inner Pulsing Ring */}
        <motion.div
          animate={{
            scale: [1, 2.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className={`absolute ${dotSize} border-2 border-blue-500 rounded-full`}
        />

        {/* Outer Pulsing Ring */}
        {size !== "small" && (
          <motion.div
            animate={{
              scale: [1, 4],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeOut",
            }}
            className={`absolute ${dotSize} border border-blue-400 rounded-full`}
          />
        )}
        
        {/* Label */}
        {!hideLabel && size !== "small" && (
          <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap"
          >
              Preparing Experience
          </motion.div>
        )}
      </div>
    </div>
  );
}
