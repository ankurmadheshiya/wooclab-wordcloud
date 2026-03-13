"use client";

import { useState, use } from "react";
import { usePoll } from "@/app/hooks/usePoll";
import { motion, AnimatePresence } from "framer-motion";

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
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 font-sans">
            <header className="w-full max-w-md py-6 text-center">
                <strong className="text-slate-400 text-sm tracking-widest uppercase">Live Poll</strong>
                <h1 className="text-2xl font-bold text-slate-900 mt-2 leading-tight">{pollState.question}</h1>
            </header>

            <main className="w-full max-w-md flex-1 flex flex-col justify-center pb-20">
                <AnimatePresence mode="wait">
                    {submitted && pollState.type !== 'wordcloud' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm text-center"
                        >
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-xl font-bold text-slate-800">Vote Received!</h2>
                            <p className="text-slate-500 mt-2">Wait for the next question.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-4"
                        >
                            {pollState.type === 'wordcloud' ? (
                                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Your Answer</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 text-lg border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Type a word..."
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            maxLength={25}
                                            autoFocus
                                        />
                                        <p className="text-right text-xs text-slate-400 mt-1">{answer.length}/25</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!answer.trim()}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitted ? 'Sent! Send another?' : 'Submit'}
                                    </button>
                                </form>
                            ) : (
                                <div className="grid gap-3">
                                    {pollState.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                sendVote(opt);
                                                setSubmitted(true);
                                            }}
                                            className="w-full p-5 bg-white border-2 border-slate-100 rounded-xl text-left font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all active:scale-95 text-lg"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="py-6 text-slate-400 text-sm font-medium">
                Powered by <strong className="text-slate-600">Antigravity</strong>
            </footer>
        </div>
    );
}
