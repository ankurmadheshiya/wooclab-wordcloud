"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { usePoll } from "@/app/hooks/usePoll";
import LiveWordCloud from "@/app/components/LiveWordCloud";
import QRCodeDisplay from "@/app/components/QRCodeDisplay";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { pollState, stopPoll, error } = usePoll(id, "host");
    const [showQR, setShowQR] = useState(false);
    const [showResponses, setShowResponses] = useState(false);
    const [origin, setOrigin] = useState("");
    const [mounted, setMounted] = useState(false);
    interface FeedbackParticle {
        emoji: string;
        count: number;
        delay: number;
    }
    const [feedbackParticles, setFeedbackParticles] = useState<FeedbackParticle[]>([]);
    const router = useRouter();

    useEffect(() => {
        setOrigin(window.location.origin);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (pollState?.feedbacks) {
            setFeedbackParticles(Object.entries(pollState.feedbacks).map(([emoji, count]) => ({
                emoji,
                count,
                delay: Math.random() * 2
            })));
        }
    }, [pollState?.feedbacks]);

    if (!pollState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingSpinner />
            </div>
        );
    }

    const joinUrl = `${origin}/vote/${pollState.id}`;
    const wordCloudData = Object.entries(pollState.votes).map(([text, count]) => ({ text, value: count }));
    const totalVotes = Object.values(pollState.votes).reduce((a, b) => a + b, 0);
    const sortedVotes = Object.entries(pollState.votes).sort(([, a], [, b]) => b - a);

    const toggleQR = () => setShowQR(!showQR);
    const toggleResponses = () => setShowResponses(!showResponses);

    return (
        <div className="relative min-h-screen w-full bg-slate-50 overflow-hidden font-sans">
            {/* Animated Background Aura */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        x: [-100, 100, -100],
                        y: [-50, 50, -50],
                        rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[30%] -left-[20%] w-[100%] h-[100%] bg-blue-100 rounded-full blur-[150px] opacity-40"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.3, 1, 1.3],
                        x: [100, -100, 100],
                        y: [50, -50, 50],
                        rotate: [360, 270, 180, 90, 0]
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[30%] -right-[20%] w-[100%] h-[100%] bg-purple-100 rounded-full blur-[150px] opacity-40"
                />
            </div>

            <div className="relative z-10 flex flex-col h-screen w-full">
                {pollState.type === "wordcloud" ? (
                    <LiveWordCloud
                        words={wordCloudData}
                        question={pollState.question}
                        pollCode={pollState.id}
                        participantCount={totalVotes}
                        isActive={pollState.isActive}
                        joinUrl={origin ? joinUrl : 'Loading...'}
                    />
                ) : (
                    <div className="flex flex-col h-full w-full p-8">
                        <motion.header 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 flex justify-between items-start shrink-0"
                        >
                            <div className="flex flex-col gap-2">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">{pollState.question}</h1>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${pollState.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                        {pollState.isActive ? "• Live Session" : "• Session Closed"}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{pollState.type === 'open-ended' ? 'Open Ended' : 'Multiple Choice'}</span>
                                </div>
                            </div>

                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-end gap-3 shrink-0">
                                <button onClick={() => { navigator.clipboard.writeText(joinUrl); alert("Link copied!"); }} className="flex items-center gap-8 bg-white px-8 py-5 rounded-[32px] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 hover:border-blue-500/30 transition-all active:scale-95 group">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Join at</span>
                                        <strong className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                            {origin ? joinUrl.replace(/^https?:\/\//, '') : '...'}
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-300 group-hover:text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>
                                            </div>
                                        </strong>
                                    </div>
                                    <div className="h-12 w-px bg-slate-100" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Passcode</span>
                                        <strong className="text-3xl font-black text-blue-600 tracking-[0.2em]">{pollState.id}</strong>
                                    </div>
                                </button>
                            </motion.div>
                        </motion.header>

                        <main className="flex-1 flex overflow-hidden">
                            {pollState.type === 'open-ended' ? (
                                <div className="w-full overflow-y-auto px-4 pb-40 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <AnimatePresence>
                                            {Object.entries(pollState.votes).reverse().map(([text], i) => (
                                                <motion.div key={text + i} initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", damping: 15, stiffness: 100, delay: i * 0.05 }} className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 hover:border-blue-500/20 hover:shadow-blue-500/10 transition-all flex flex-col gap-6 relative group overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/20" />
                                                    <p className="text-2xl font-black text-slate-800 leading-[1.4] tracking-tight">"{text}"</p>
                                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Participant #{totalVotes - i}</span>
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs">💬</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {totalVotes === 0 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full h-80 flex flex-col items-center justify-center text-slate-300 gap-6">
                                                <div className="text-8xl animate-pulse">✨</div>
                                                <p className="text-2xl font-black uppercase tracking-widest opacity-50">Waiting for responses...</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full flex items-end justify-center gap-16 pb-32 px-12 h-full">
                                    {pollState.options?.map((opt, i) => {
                                        const count = pollState.votes[opt] || 0;
                                        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                                        return (
                                            <div key={i} className="flex flex-col items-center justify-end h-full w-40 gap-6 group">
                                                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-black text-4xl text-slate-800">{count}</motion.span>
                                                <div className="w-full bg-slate-100/50 rounded-[32px] relative overflow-hidden h-full max-h-[55vh] flex items-end border border-slate-200/50 shadow-inner">
                                                    <motion.div initial={{ height: 0 }} animate={{ height: `${percentage}%` }} transition={{ type: "spring", damping: 12, stiffness: 60, delay: i * 0.1 }} className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-[20px] absolute bottom-0 shadow-[0_-10px_30px_-10px_rgba(37,99,235,0.5)]" />
                                                </div>
                                                <span className="font-black text-slate-500 text-center text-sm uppercase tracking-widest">{opt}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>

            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-10 left-10 z-50 flex gap-4 items-center bg-white/80 backdrop-blur-xl p-2 rounded-full border border-white shadow-2xl">
                <button onClick={toggleQR} className="w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-slate-600 active:scale-95" title="Toggle QR Code">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /></svg>
                </button>
                <button onClick={toggleResponses} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm border transition-all active:scale-95 ${showResponses ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-100'}`} title="Responses List">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                </button>
                {pollState.isActive ? <button onClick={stopPoll} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-full font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">End Session</button> : <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"><span>New Poll</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>}
            </motion.div>

            <AnimatePresence>
                {pollState.feedbacks && Object.keys(pollState.feedbacks).length > 0 && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: 50, opacity: 0 }} 
                        className="fixed bottom-10 right-10 z-50 flex gap-4 bg-white/40 backdrop-blur-2xl p-4 rounded-[40px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] items-center"
                    >
                        <div className="flex flex-col px-4 border-r border-slate-200/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live</span>
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Reactions</span>
                        </div>
                        <div className="flex gap-3 pl-2">
                        {feedbackParticles.map((p) => (
                            <motion.div 
                                key={p.emoji} 
                                animate={{ 
                                    y: [0, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    delay: p.delay,
                                    ease: "easeInOut"
                                }}
                                className="flex items-center gap-2 bg-white/80 px-4 py-2.5 rounded-[20px] border border-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <span className="text-2xl drop-shadow-sm">{p.emoji}</span>
                                <span className="font-black text-blue-600 text-sm tracking-tight">{p.count}</span>
                            </motion.div>
                        ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showQR && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-28 left-10 z-50 origin-bottom-left">
                        <div className="relative p-3 bg-white rounded-[40px] shadow-2xl border border-slate-100">
                            <QRCodeDisplay url={joinUrl} />
                            <button onClick={() => setShowQR(false)} className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 text-slate-400 hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute top-10 right-10 z-50 flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Audience</span>
                    <span className="text-2xl font-black">{totalVotes}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">👥</div>
            </motion.div>

            <AnimatePresence>
                {showResponses && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResponses(false)} className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[60]" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-4 right-4 bottom-4 w-[450px] bg-white shadow-2xl z-[70] rounded-[60px] border border-slate-100 flex flex-col overflow-hidden">
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">Responses</h2><p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5">{totalVotes} submissions</p></div>
                                <button onClick={toggleResponses} className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                                {sortedVotes.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"><div className="text-5xl">⏳</div><p className="font-bold text-sm tracking-widest uppercase">No data</p></div> : sortedVotes.map(([text, count], i) => (
                                    <motion.div key={text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex justify-between items-center p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 hover:border-blue-500/30 hover:bg-white transition-all shadow-sm group">
                                        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:text-blue-600 transition-colors">{i + 1}</div><span className="font-black text-slate-800 text-lg leading-tight truncate max-w-[200px]" title={text}>{text}</span></div>
                                        <span className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg">{count}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
