"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordCloudLogo from "./WordCloudLogo";

export default function ClientRootLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ 
                opacity: 0,
                transition: { duration: 1, ease: "easeInOut" } 
            }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
          >
            <WordCloudLogo size={180} />
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="absolute bottom-12 text-slate-300 font-medium text-[10px] tracking-widest uppercase flex items-center gap-3"
            >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                Initializing System
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
