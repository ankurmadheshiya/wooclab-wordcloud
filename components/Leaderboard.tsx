"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Star } from "lucide-react";

interface LeaderboardProps {
    scores: { participantId: string; name: string; score: number }[];
}

export default function Leaderboard({ scores }: LeaderboardProps) {
    const sortedScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 5);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 p-8">
            <div className="text-center mb-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block p-4 bg-yellow-100 text-yellow-600 rounded-full mb-4"
                >
                    <Trophy size={48} />
                </motion.div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Leaderboard</h2>
                <p className="text-slate-500 font-bold mt-2">Top Performers</p>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {sortedScores.map((score, index) => (
                        <motion.div
                            key={score.participantId}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${index === 0 ? 'bg-yellow-50 border-yellow-200 shadow-lg' : 'bg-white border-slate-100 shadow-sm'
                                }`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center">
                                {index === 0 ? <Medal className="text-yellow-500" size={32} /> :
                                    index === 1 ? <Medal className="text-slate-400" size={28} /> :
                                        index === 2 ? <Medal className="text-amber-600" size={24} /> :
                                            <span className="text-xl font-black text-slate-300">#{index + 1}</span>}
                            </div>

                            <div className="flex-1">
                                <span className="text-lg font-bold text-slate-800">{score.name || `Player ${score.participantId.slice(0, 4)}`}</span>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl">
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-xl font-black">{score.score}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {sortedScores.length === 0 && (
                <div className="text-center py-20 opacity-20">
                    <Trophy size={80} className="mx-auto" />
                    <p className="mt-4 font-bold">Waiting for results...</p>
                </div>
            )}
        </div>
    );
}
