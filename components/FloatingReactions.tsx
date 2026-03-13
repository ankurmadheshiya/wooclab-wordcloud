"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['❤️', '👏', '🔥', '👍', '😮', '😂'];

interface Reaction {
    id: number;
    emoji: string;
    left: number;
}

export default function FloatingReactions({ onSend }: { onSend?: (emoji: string) => void }) {
    const [reactions, setReactions] = useState<Reaction[]>([]);

    // Function to add a reaction locally (for testing or if relaying from socket)
    const addReaction = (emoji: string) => {
        const id = Date.now();
        const left = Math.random() * 80 + 10; // 10% to 90%
        setReactions(prev => [...prev.slice(-20), { id, emoji, left }]);

        // Auto-remove after animation
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 4000);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {reactions.map((r) => (
                    <motion.div
                        key={r.id}
                        initial={{ y: '100vh', opacity: 1, scale: 0.5, x: `${r.left}vw` }}
                        animate={{
                            y: '-20vh',
                            opacity: 0,
                            scale: 1.5,
                            x: `${r.left + (Math.random() * 20 - 10)}vw` // Add some drift
                        }}
                        transition={{ duration: 4, ease: "easeOut" }}
                        className="absolute text-4xl"
                    >
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white flex gap-4">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => {
                            addReaction(emoji);
                            onSend?.(emoji);
                        }}
                        className="text-2xl hover:scale-125 transition-transform active:scale-95"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}
