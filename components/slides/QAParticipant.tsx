"use client";

import { useState } from "react";
import { ThumbsUp, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QAParticipantProps {
    questions: any[];
    onAsk: (text: string) => void;
    onUpvote: (id: string) => void;
}

export default function QAParticipant({ questions, onAsk, onUpvote }: QAParticipantProps) {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAsk(text.trim());
        setText("");
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-8">
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Ask a question</h3>
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your question..."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-14 text-sm font-medium outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl disabled:opacity-50 active:scale-90 transition-all"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-slate-400 mt-3 text-center uppercase font-bold tracking-widest">Questions are anonymous</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Question List</h3>
                    <span className="text-xs font-bold text-blue-600">{questions.length} asked</span>
                </div>

                <AnimatePresence mode="popLayout">
                    {questions.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).map((q) => (
                        <motion.div
                            key={q.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white border border-slate-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm"
                        >
                            <div className="flex-1">
                                <p className="text-slate-800 font-medium leading-relaxed">{q.content}</p>
                            </div>
                            <button
                                onClick={() => onUpvote(q.id)}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className="p-2 bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 rounded-xl transition-colors">
                                    <ThumbsUp size={18} />
                                </div>
                                <span className="text-xs font-black text-slate-500 group-hover:text-blue-600">{q.upvotes || 0}</span>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {questions.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-400 font-bold">No questions yet. Be the first!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
