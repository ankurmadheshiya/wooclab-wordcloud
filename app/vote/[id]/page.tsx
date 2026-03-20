"use client";

import { useState, use } from "react";
import { usePoll } from "@/app/hooks/usePoll";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { pollState, sendVote, sendFeedback, error } = usePoll(id, "voter");
    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!answer.trim()) return;

        await sendVote(answer);
        setAnswer("");
        setSubmitted(true);

        // Allow submitting again after a delay for word cloud fun
        if (pollState?.type === 'wordcloud') {
            setTimeout(() => setSubmitted(false), 2000);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Poll Not Found</h2>
                    <p className="text-slate-500 mt-2">Please check the code and try again.</p>
                </div>
            </div>
        );
    }

    if (!pollState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <LoadingSpinner />
            </div>
        );
    }

    if (!pollState.isActive) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl text-center"
                >
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner">🔒</div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Voting Closed</h1>
                    <p className="text-slate-500 mt-2 font-medium">The presenter has stopped the poll.</p>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">How was it?</h3>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                            {['😍', '😊', '👍', '🔥', '👏', '💡', '😮', '😂', '😢', '💯'].map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => {
                                        sendFeedback(emoji);
                                        setFeedbackSent(true);
                                    }}
                                    className={`text-3xl p-3 rounded-2xl transition-all active:scale-90 ${feedbackSent ? 'opacity-50 grayscale cursor-default' : 'hover:bg-slate-50 hover:scale-110 active:bg-blue-50'}`}
                                    disabled={feedbackSent}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        {feedbackSent && (
                            <motion.p 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-blue-500 font-bold mt-4 text-sm"
                            >
                                Thanks for your feedback! ✨
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans relative overflow-hidden">
            {/* Animated Background Aura */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        x: [-50, 50, -50],
                        y: [-20, 20, -20],
                        rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-blue-400/10 rounded-full blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        x: [50, -50, 50],
                        y: [20, -20, 20],
                        rotate: [360, 270, 180, 90, 0]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] bg-purple-400/10 rounded-full blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        opacity: [0.1, 0.3, 0.1],
                        scale: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-slate-50/50"
                />
            </div>

            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md py-6 text-center relative z-10"
            >
                <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm mb-4">
                    <strong className="text-slate-400 text-[10px] tracking-widest uppercase font-black">Live Session: {id}</strong>
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{pollState.question}</h1>
            </motion.header>

            <main className="w-full max-w-md flex-1 flex flex-col justify-center pb-20 relative z-10">
                <AnimatePresence mode="wait">
                    {submitted && pollState.type !== 'wordcloud' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white p-10 rounded-[40px] shadow-2xl shadow-blue-500/10 border border-slate-100 text-center"
                        >
                            <motion.div 
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                className="text-6xl mb-6"
                            >
                                🎉
                            </motion.div>
                            <h2 className="text-2xl font-black text-slate-800">Vote Received!</h2>
                            <p className="text-slate-500 mt-2 font-medium">Sit tight for the next question.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-4"
                        >
                            {pollState.type === 'wordcloud' || pollState.type === 'open-ended' ? (
                                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end px-1">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Your Answer</label>
                                            {pollState.type === 'wordcloud' && (
                                                <span className="text-[10px] font-bold text-slate-300">{answer.length}/25</span>
                                            )}
                                        </div>
                                        {pollState.type === 'open-ended' ? (
                                            <textarea
                                                className="w-full p-5 text-lg font-bold border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-200 resize-none h-40 shadow-inner"
                                                placeholder="Type your response..."
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full p-5 text-xl font-bold border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-200 shadow-inner"
                                                placeholder="Enter a word"
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                maxLength={25}
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={!answer.trim()}
                                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-900/10 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {submitted ? 'Sent! Send more? ✨' : 'Submit Answer 🚀'}
                                    </motion.button>
                                </form>
                            ) : (
                                <div className="grid gap-4">
                                    {pollState.options?.map((opt, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ scale: 1.02, x: 10 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                sendVote(opt);
                                                setSubmitted(true);
                                            }}
                                            className="w-full p-6 bg-white border-2 border-slate-50 rounded-3xl text-left font-bold text-slate-800 hover:border-blue-500/50 hover:bg-blue-50/10 hover:shadow-xl transition-all text-lg flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-black">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
