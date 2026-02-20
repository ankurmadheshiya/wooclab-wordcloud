"use client";

import { useState, use } from "react";
import { usePoll } from "@/app/hooks/usePoll";
import { motion, AnimatePresence } from "framer-motion";

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { pollState, sendVote, error } = usePoll(id, "voter");
    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);

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
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="text-center">
                    <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🔒</div>
                    <h1 className="text-2xl font-bold text-slate-800">Voting Closed</h1>
                    <p className="text-slate-500 mt-2">The presenter has stopped the poll.</p>
                </div>
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
