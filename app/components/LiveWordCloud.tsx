"use client";

import { useEffect, useState, useRef } from "react";
import cloud from "d3-cloud";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PALETTE = [
    "text-blue-600",
    "text-teal-600",
    "text-purple-600",
    "text-green-600",
    "text-indigo-600",
    "text-cyan-600",
];

interface CloudWord extends cloud.Word {
    text: string;
    size: number;
    x: number;
    y: number;
    rotate: number;
    color: string;
    id: string;
}

interface LiveWordCloudProps {
    words: { text: string; value: number }[];
    question: string;
    pollCode?: string;
    participantCount?: number;
    isActive?: boolean;
    joinUrl?: string;
}

export default function LiveWordCloud({
    words,
    question,
    pollCode = "DEMO",
    participantCount = 0,
    isActive = true,
    joinUrl = "wooclap.com"
}: LiveWordCloudProps) {
    const [layoutWords, setLayoutWords] = useState<CloudWord[]>([]);
    const [particles, setParticles] = useState<any[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setParticles([...Array(15)].map((_, i) => ({
            id: i,
            x1: (Math.random() * 100).toFixed(2),
            x2: (Math.random() * 100).toFixed(2),
            y1: (Math.random() * 100).toFixed(2),
            y2: (Math.random() * 100).toFixed(2),
            duration: 10 + Math.random() * 20
        })));

        function handleResize() {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;
        if (words.length === 0) {
            setLayoutWords([]);
            return;
        }

        const maxVal = Math.max(...words.map((w) => w.value));
        const minVal = Math.min(...words.map((w) => w.value));

        const wordData = words.map((w) => ({
            text: w.text,
            value: w.value,
            size: 30 + ((w.value - minVal) / (maxVal - minVal + 1)) * 100
        }));

        cloud()
            .size([dimensions.width * 0.8, dimensions.height * 0.8])
            .words(wordData as any[])
            .padding(20)
            .rotate(0)
            .font("Inter")
            .fontSize((d) => d.size as number)
            .spiral("rectangular")
            .on("end", (computedWords) => {
                const finalWords = computedWords.map((w, i) => ({
                    ...w,
                    id: w.text as string,
                    x: w.x ?? 0,
                    y: w.y ?? 0,
                    color: PALETTE[i % PALETTE.length]
                })) as CloudWord[];
                setLayoutWords(finalWords);
            })
            .start();
    }, [words, dimensions]);

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
            
            {/* Dynamic Drifting Particles - Populated in useEffect for hydration safety */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
                {particles.map((p) => (
                    <motion.div
                        key={`particle-${p.id}`}
                        animate={{
                            x: [p.x1 + "%", p.x2 + "%"],
                            y: [p.y1 + "%", p.y2 + "%"],
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[2px]"
                    />
                ))}
            </div>

            {/* Continuous Ambient Aura */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[100px]"
                />
                <motion.div 
                    animate={{ scale: [1.3, 1, 1.3], rotate: [360, 270, 180, 90, 0] }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-100/40 rounded-full blur-[100px]"
                />
            </div>

            <header className="flex-none w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-8 flex justify-between items-center z-10 shadow-sm">
                <div className="flex flex-col gap-2 max-w-[65%]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg text-lg">☁️</div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Live Word Cloud</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">{question}</h1>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                    <div className="bg-slate-900 text-white px-8 py-4 rounded-[24px] shadow-2xl flex items-center gap-6">
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Join Session</span>
                            <strong className="text-2xl font-black tracking-tight">{joinUrl.replace(/^https?:\/\//, '')}</strong>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Code</span>
                            <strong className="text-2xl font-black text-blue-400 tracking-widest">{pollCode}</strong>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
                <div ref={containerRef} className="w-full h-full relative">
                    <AnimatePresence>
                        {layoutWords.map((word) => (
                            <motion.div
                                key={word.text}
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: word.x + dimensions.width / 2,
                                    y: word.y + dimensions.height / 2
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ type: "spring", damping: 15, stiffness: 80 }}
                                className={cn(
                                    "absolute whitespace-nowrap font-black select-none cursor-default transition-all duration-300 hover:z-20",
                                    word.color
                                )}
                                style={{
                                    fontSize: `${word.size}px`,
                                    transform: "translate(-50%, -50%)",
                                    left: 0,
                                    top: 0,
                                    textShadow: "0 10px 30px rgba(0,0,0,0.05)"
                                }}
                            >
                                {word.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {words.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4">
                            <div className="text-7xl animate-bounce">⚡</div>
                            <p className="text-xl font-black uppercase tracking-[0.3em] opacity-50">Awaiting your thoughts...</p>
                        </motion.div>
                    )}
                </div>
            </main>

            <footer className="flex-none w-full bg-white border-t border-slate-100 py-6 px-10 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isActive ? "Real-time sync active" : "Session disconnected"}
                    </span>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Participants</span>
                        <span className="text-2xl font-black text-slate-900">{participantCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">👥</div>
                </motion.div>
            </footer>
        </div>
    );
}
