"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, CheckCircle, Trash2, MessageSquare } from "lucide-react";

interface QAPresenterProps {
    question: string;
    questions: any[];
    onAnswer?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export default function QAPresenter({ question, questions, onAnswer, onDelete }: QAPresenterProps) {
    const sortedQuestions = [...questions].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

    return (
        <div className="h-full flex flex-col p-8 bg-white">
            <header className="mb-12 text-center">
                <strong className="text-slate-400 text-sm tracking-[0.3em] uppercase block mb-4">Live Q&A Mode</strong>
                <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">{question}</h1>
            </header>

            <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full px-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {sortedQuestions.map((q, i) => (
                            <motion.div
                                key={q.id}
                                layout
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-6 rounded-3xl border-2 flex flex-col gap-4 shadow-sm relative overflow-hidden group ${q.isAnswered ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl">
                                        <ThumbsUp size={18} className="text-slate-400" />
                                        <span className="text-lg font-black text-slate-700">{q.upvotes || 0}</span>
                                    </div>
                                </div>

                                <p className="text-xl font-bold text-slate-800 leading-relaxed mb-4">
                                    {q.content}
                                </p>

                                <div className="mt-auto flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!q.isAnswered && (
                                        <button
                                            onClick={() => onAnswer?.(q.id)}
                                            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete?.(q.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {q.isAnswered && (
                                    <div className="absolute top-4 right-16">
                                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            Answered
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {questions.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-40">
                        <MessageSquare size={80} className="mb-6" />
                        <h2 className="text-3xl font-black">No questions yet</h2>
                        <p className="text-xl font-medium">Wait for the audience to participate</p>
                    </div>
                )}
            </div>
        </div>
    );
}
