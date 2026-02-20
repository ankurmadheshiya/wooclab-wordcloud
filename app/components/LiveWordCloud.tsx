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
    // ...
    // ... in footer ...
    <div className="flex flex-col">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Join at</span>
        <strong className="text-2xl font-bold tracking-tight">{joinUrl.replace(/^https?:\/\//, '')}</strong>
    </div>
    const [layoutWords, setLayoutWords] = useState<CloudWord[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
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

        // Check if we have words, otherwise clear layout
        if (words.length === 0) {
            setLayoutWords([]);
            return;
        }

        const maxVal = Math.max(...words.map((w) => w.value));
        const minVal = Math.min(...words.map((w) => w.value));

        const wordData = words.map((w) => ({
            text: w.text,
            value: w.value,
            size: 20 + ((w.value - minVal) / (maxVal - minVal + 1)) * 90
        }));

        cloud()
            .size([dimensions.width, dimensions.height])
            .words(wordData as any[])
            .padding(15)
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

            {/* Header */}
            <header className="flex-none w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Live Poll</span>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{question}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2">
                        <div className="relative flex h-2.5 w-2.5">
                            {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </div>
                        <span className="text-slate-600 font-bold text-xs uppercase tracking-wide">
                            {isActive ? "Voting Open" : "Voting Closed"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Cloud Container */}
            <main className="flex-1 w-full relative flex items-center justify-center p-0">
                <div
                    ref={containerRef}
                    className="w-full h-full absolute inset-0"
                >
                    <AnimatePresence>
                        {layoutWords.map((word) => (
                            <motion.div
                                key={word.text}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: word.x + dimensions.width / 2,
                                    y: word.y + dimensions.height / 2
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    type: "spring",
                                    damping: 20,
                                    stiffness: 100
                                }}
                                className={cn(
                                    "absolute whitespace-nowrap font-bold select-none cursor-default hover:scale-110 transition-transform duration-200",
                                    word.color
                                )}
                                style={{
                                    fontSize: `${word.size}px`,
                                    transform: "translate(-50%, -50%)",
                                    left: 0,
                                    top: 0,
                                    willChange: "transform, opacity"
                                }}
                            >
                                {word.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {words.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xl font-light">
                            Waiting for responses...
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="flex-none w-full bg-slate-900 text-white py-5 px-10 flex justify-between items-center z-10 shadow-lg">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Join at</span>
                        <strong className="text-2xl font-bold tracking-tight">{joinUrl.replace(/^https?:\/\//, '')}</strong>
                    </div>
                    <div className="h-10 w-px bg-slate-700"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Code</span>
                        <strong className="text-2xl font-bold tracking-widest text-teal-400">{pollCode}</strong>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg font-semibold text-white">{participantCount}</span>
                </div>
            </footer>

        </div>
    );
}
