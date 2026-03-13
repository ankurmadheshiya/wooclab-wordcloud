"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id: string;
    text: string;
    isCorrect?: boolean;
}

interface PollPresenterProps {
    question: string;
    options: Option[];
    responses: { content: string }[];
    showCorrect?: boolean;
}

export default function PollPresenter({
    question,
    options,
    responses,
    showCorrect = false
}: PollPresenterProps) {
    const totalResponses = responses.length;

    const getCount = (optionId: string) => {
        return responses.filter(r => r.content === optionId).length;
    };

    const getPercentage = (optionId: string) => {
        if (totalResponses === 0) return 0;
        return Math.round((getCount(optionId) / totalResponses) * 100);
    };

    return (
        <div className="flex flex-col h-full w-full p-12 bg-white">
            <div className="mb-12">
                <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2 block">Multiple Choice Poll</span>
                <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">{question}</h1>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 max-w-4xl">
                {options.map((option, index) => {
                    const percentage = getPercentage(option.id);
                    const count = getCount(option.id);

                    return (
                        <div key={option.id} className="relative group">
                            <div className="flex justify-between items-end mb-2 px-1">
                                <span className="font-bold text-xl text-slate-800">
                                    {option.text}
                                    {showCorrect && option.isCorrect && <span className="ml-2 text-green-500">✓</span>}
                                </span>
                                <span className="font-bold text-slate-400">
                                    {percentage}% <span className="text-sm font-medium ml-1">({count})</span>
                                </span>
                            </div>

                            <div className="h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                    className={`h-full absolute left-0 top-0 ${showCorrect && option.isCorrect ? 'bg-green-500' : 'bg-blue-600'
                                        }`}
                                />
                                <div className="relative z-10 px-4 font-bold text-white text-lg mix-blend-difference">
                                    {String.fromCharCode(65 + index)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 flex items-center gap-4 text-slate-400 font-bold">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>{totalResponses} total votes</span>
                </div>
            </div>
        </div>
    );
}
