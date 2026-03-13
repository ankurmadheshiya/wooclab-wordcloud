"use client";

import { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SessionTimerProps {
    initialSeconds: number;
    onTimeUp?: () => void;
}

export default function SessionTimer({ initialSeconds, onTimeUp }: SessionTimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            onTimeUp?.();
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, onTimeUp]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setSeconds(initialSeconds);
        setIsActive(false);
    };

    return (
        <div className="flex items-center gap-4 bg-slate-800 px-6 py-3 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex items-center gap-3">
                <Timer size={20} className={seconds <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-400'} />
                <span className={`text-2xl font-black tabular-nums ${seconds <= 10 ? 'text-red-400' : 'text-white'}`}>
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                </span>
            </div>

            <div className="h-6 w-px bg-slate-700 mx-2" />

            <div className="flex items-center gap-2">
                <button
                    onClick={toggle}
                    className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300"
                >
                    {isActive ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                    onClick={reset}
                    className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(seconds / initialSeconds) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
            />
        </div>
    );
}
