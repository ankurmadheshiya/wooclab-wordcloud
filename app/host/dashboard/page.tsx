"use client";

import { useState, useEffect } from 'react';
import { Plus, Play, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HostDashboard() {
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            // For now using a hardcoded hostId till auth is implemented
            const res = await fetch('/api/sessions?hostId=anonymous-host');
            const data = await res.json();
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions');
        } finally {
            setIsLoading(false);
        }
    };

    const createSession = async () => {
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                body: JSON.stringify({
                    title: `New Session ${new Date().toLocaleDateString()}`,
                    hostId: 'anonymous-host'
                })
            });
            const data = await res.json();
            router.push(`/host/edit/${data.id}`);
        } catch (error) {
            console.error('Failed to create session');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Presenter Dashboard</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage your interactive audience engagements</p>
                    </div>
                    <button
                        onClick={createSession}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Create Session
                    </button>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-5xl mb-4">🚀</div>
                        <h2 className="text-xl font-bold text-slate-800">No sessions yet</h2>
                        <p className="text-slate-500 mt-2">Create your first interactive presentation to get started</p>
                        <button
                            onClick={createSession}
                            className="mt-6 text-blue-600 font-bold hover:underline"
                        >
                            Start by creating a session
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${session.status === 'LIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {session.status}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            CODE: {session.joinCode}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {session.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Plus size={12} className="rotate-45" />
                                            {session._count?.slides || 0} Slides
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-2">
                                    <button
                                        onClick={() => router.push(`/host/${session.id}`)}
                                        className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Play size={16} fill="white" />
                                        Present
                                    </button>
                                    <button
                                        onClick={() => router.push(`/host/edit/${session.id}`)}
                                        className="aspect-square bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button className="aspect-square bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
