"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { usePoll, PollState } from "@/app/hooks/usePoll";
import LiveWordCloud from "@/app/components/LiveWordCloud";
import QRCodeDisplay from "@/app/components/QRCodeDisplay";
import { motion, AnimatePresence } from "framer-motion";

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { pollState, setPollState, stopPoll, error } = usePoll(id, "host");
    const [showQR, setShowQR] = useState(false);
    const [showResponses, setShowResponses] = useState(false);
    const [origin, setOrigin] = useState("");
    const router = useRouter();

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    useEffect(() => {
        if (error) {
            // alert("Poll not found"); 
        }
    }, [error]);

    if (!pollState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
                Loading poll...
            </div>
        );
    }

    const joinUrl = `${origin}/vote/${pollState.id}`;

    // Transform votes for Word Cloud
    const wordCloudData = Object.entries(pollState.votes).map(([text, count]) => ({
        text,
        value: count,
    }));

    // Calculate total votes
    const totalVotes = Object.values(pollState.votes).reduce((a, b) => a + b, 0);

    // Sort votes for list view
    const sortedVotes = Object.entries(pollState.votes)
        .sort(([, a], [, b]) => b - a);

    const toggleQR = () => setShowQR(!showQR);
    const toggleResponses = () => setShowResponses(!showResponses);

    return (
        <div className="relative min-h-screen w-full bg-slate-50 overflow-hidden">
            {/* Poll Visualization */}
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
                <div className="flex flex-col h-screen w-full p-8 font-sans">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-800">{pollState.question}</h1>
                        <div className="mt-4 flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${pollState.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {pollState.isActive ? "Live" : "Closed"}
                            </span>
                            <span className="text-slate-500 font-medium">Join at {origin ? joinUrl.replace(/^https?:\/\//, '') : '...'}</span>
                        </div>
                    </header>

                    <main className="flex-1 flex items-end justify-center gap-12 pb-20">
                        {pollState.options?.map((opt, i) => {
                            const count = pollState.votes[opt] || 0;
                            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                            return (
                                <div key={i} className="flex flex-col items-center justify-end h-full w-32 gap-3 group">
                                    <span className="font-bold text-2xl text-slate-700">{count}</span>
                                    <div className="w-full bg-slate-200 rounded-t-2xl relative overflow-hidden h-full max-h-[60vh] flex items-end transition-all">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${percentage}%` }}
                                            transition={{ type: "spring", stiffness: 60 }}
                                            className="w-full bg-blue-500 rounded-t-xl absolute bottom-0"
                                        />
                                    </div>
                                    <span className="font-medium text-slate-600 text-center text-lg">{opt}</span>
                                </div>
                            )
                        })}
                    </main>
                </div>
            )}

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-6 z-50 flex gap-3 items-center">
                <button
                    onClick={toggleQR}
                    className="bg-white p-3 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
                    title="Show QR Code"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                    </svg>
                </button>

                <button
                    onClick={toggleResponses}
                    className={`p-3 rounded-full shadow-lg border transition-colors ${showResponses ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    title="View Responses List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </button>

                {pollState.isActive ? (
                    <button
                        onClick={stopPoll}
                        className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 font-bold tracking-wide transition-colors"
                    >
                        Stop Poll
                    </button>
                ) : (
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold tracking-wide transition-colors flex items-center gap-2"
                    >
                        <span>New Poll</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                )}
            </div>

            {/* QR Modal/Overlay */}
            <AnimatePresence>
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-24 left-6 z-50 origin-bottom-left"
                    >
                        <div className="relative">
                            <QRCodeDisplay url={joinUrl} />
                            <button
                                onClick={() => setShowQR(false)}
                                className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md border text-slate-400 hover:text-red-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responses Sidebar */}
            <AnimatePresence>
                {showResponses && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-slate-100 flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">Responses ({totalVotes})</h2>
                            <button onClick={toggleResponses} className="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {sortedVotes.length === 0 ? (
                                <div className="text-center text-slate-400 py-10">
                                    No responses yet.
                                </div>
                            ) : (
                                sortedVotes.map(([text, count]) => (
                                    <div key={text} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                        <span className="font-medium text-slate-700 truncate max-w-[200px]" title={text}>{text}</span>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-sm font-bold">{count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
