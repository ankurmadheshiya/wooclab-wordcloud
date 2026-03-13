"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Option {
    id: string;
    text: string;
}

interface PollParticipantProps {
    question: string;
    options: Option[];
    onSubmit: (optionId: string) => void;
    disabled?: boolean;
}

export default function PollParticipant({
    question,
    options,
    onSubmit,
    disabled = false
}: PollParticipantProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        if (disabled) return;
        setSelectedId(id);
        onSubmit(id);
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-lg mx-auto p-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900 leading-snug">{question}</h2>
                <p className="text-slate-500 text-sm mt-2">Select one option below</p>
            </div>

            <div className="flex flex-col gap-3">
                {options.map((option, index) => {
                    const isSelected = selectedId === option.id;

                    return (
                        <button
                            key={option.id}
                            disabled={disabled || (selectedId !== null && !isSelected)}
                            onClick={() => handleSelect(option.id)}
                            className={`group relative flex items-center p-5 rounded-2xl border-2 transition-all text-left ${isSelected
                                    ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-600/10'
                                    : 'border-slate-100 bg-white hover:border-slate-200 active:bg-slate-50'
                                } ${disabled && !isSelected ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {isSelected ? <Check size={20} /> : String.fromCharCode(65 + index)}
                            </div>

                            <span className={`flex-1 font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-700'
                                }`}>
                                {option.text}
                            </span>

                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded ml-2"
                                >
                                    Voted
                                </motion.div>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedId && (
                <p className="text-center text-slate-400 text-xs font-medium animate-pulse">
                    Waiting for the presenter to move to the next slide...
                </p>
            )}
        </div>
    );
}
