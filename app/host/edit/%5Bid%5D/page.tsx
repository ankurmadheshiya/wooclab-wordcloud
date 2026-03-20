"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
    Plus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Settings,
    Eye,
    Type,
    BarChart2,
    Cloud,
    Trophy,
    Sparkles,
    Save,
    Play
} from 'lucide-react';

type SlideType = 'WORD_CLOUD' | 'POLL_MCQ' | 'QUIZ_MCQ' | 'OPEN_ENDED' | 'RANKING' | 'QA';

interface Slide {
    id: string;
    type: SlideType;
    question: string;
    order: number;
    options: { id: string; text: string; isCorrect: boolean }[];
    settings: any;
}

export default function SessionEditor() {
    const { id } = useParams();
    const router = useRouter();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSessionData();
    }, [id]);

    const fetchSessionData = async () => {
        try {
            const res = await fetch(`/api/sessions/${id}/slides`);
            const data = await res.json();
            setSlides(data.length > 0 ? data : []);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch session data');
            setIsLoading(false);
        }
    };

    const addSlide = async (type: SlideType) => {
        const newSlide = {
            type,
            question: `New ${type.replace('_', ' ')} Question`,
            order: slides.length,
            options: type.includes('MCQ') ? [{ text: 'Option 1', isCorrect: true }, { text: 'Option 2', isCorrect: false }] : [],
            settings: {}
        };

        try {
            const res = await fetch(`/api/sessions/${id}/slides`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSlide)
            });
            const savedSlide = await res.json();
            setSlides([...slides, savedSlide]);
            setActiveSlideIndex(slides.length);
        } catch (error) {
            console.error('Failed to add slide');
        }
    };

    const updateActiveSlide = (updates: Partial<Slide>) => {
        const newSlides = [...slides];
        newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], ...updates };
        setSlides(newSlides);
    };

    const [showAIModal, setShowAIModal] = useState(false);
    const [aiMode, setAiMode] = useState<'text' | 'file'>('text');
    const [aiInput, setAiInput] = useState('');
    const [aiFile, setAiFile] = useState<File | null>(null);
    const [aiCount, setAiCount] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateWithAI = async () => {
        if (aiMode === 'text' && !aiInput.trim()) return;
        if (aiMode === 'file' && !aiFile) return;

        setIsGenerating(true);
        try {
            let res;
            if (aiMode === 'text') {
                res = await fetch('/api/generate-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sourceText: aiInput, count: aiCount })
                });
            } else {
                const formData = new FormData();
                if (aiFile) formData.append('file', aiFile);
                formData.append('count', aiCount.toString());

                res = await fetch('/api/generate-from-file', {
                    method: 'POST',
                    body: formData
                });
            }

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const generatedSlides = await res.json();

            // Save each generated slide to the DB
            for (const slide of generatedSlides) {
                await fetch(`/api/sessions/${id}/slides`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...slide,
                        order: slides.length
                    })
                });
            }

            await fetchSessionData();
            setShowAIModal(false);
            setAiInput('');
            setAiFile(null);
        } catch (error) {
            console.error('AI Generation failed', error);
            alert('Generation failed. Please check the file and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const activeSlide = slides[activeSlideIndex];

    return (
        <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
            {/* AI Generator Modal */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Sparkles /> Generate with AI
                                    </h2>
                                    <p className="text-blue-100 text-sm mt-1">Transform your content into interactive slides instantly</p>
                                </div>
                                <button onClick={() => setShowAIModal(false)} className="text-white/60 hover:text-white transition-colors text-2xl">×</button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                                    <button 
                                        onClick={() => setAiMode('text')} 
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${aiMode === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Text Input
                                    </button>
                                    <button 
                                        onClick={() => setAiMode('file')} 
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${aiMode === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        File Upload
                                    </button>
                                </div>

                                {aiMode === 'text' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Paste Source Content (Text, Transcript, etc.)</label>
                                        <textarea
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium outline-none focus:border-blue-500 transition-all resize-none"
                                            placeholder="Enter the text you want to generate questions from..."
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upload Document (PDF, DOCX, PPTX)</label>
                                        <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-5 relative hover:bg-slate-100 transition-all cursor-pointer">
                                            <input 
                                                type="file" 
                                                accept=".pdf,.docx,.pptx"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                                            />
                                            {aiFile ? (
                                                <div className="text-center w-full">
                                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                        <Save size={24} />
                                                    </div>
                                                    <p className="font-bold text-slate-800 truncate px-4">{aiFile.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{(aiFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <p className="text-sm text-blue-600 mt-2 font-medium">Click or drag to change file</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                        <Plus size={24} />
                                                    </div>
                                                    <p className="font-bold text-slate-600">Click or drag and drop to upload</p>
                                                    <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, PPTX</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-bold text-slate-600">Number of slides:</label>
                                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                            {[3, 5, 8].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setAiCount(n)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${aiCount === n ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={generateWithAI}
                                        disabled={isGenerating || (aiMode === 'text' ? !aiInput.trim() : !aiFile)}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center gap-2">
                                                <LoadingSpinner size="small" color="bg-white" hideLabel />
                                                Generating...
                                            </div>
                                        ) : 'Start Generating'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar - Slide List */}
            <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500">Slides</h2>
                    <span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600">{slides.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`w-full p-3 rounded-lg text-left transition-all flex items-start gap-3 border ${activeSlideIndex === idx
                                ? 'bg-white border-blue-200 shadow-sm ring-2 ring-blue-500/10'
                                : 'border-transparent hover:bg-slate-100'
                                }`}
                        >
                            <div className="text-[10px] font-bold text-slate-400 mt-1">{idx + 1}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-blue-600 mb-0.5 truncate">{slide.type}</div>
                                <div className="text-sm font-medium text-slate-800 truncate">{slide.question || 'Untitled'}</div>
                            </div>
                        </button>
                    ))}

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button onClick={() => addSlide('POLL_MCQ')} className="p-2 border border-dashed border-slate-300 rounded text-[10px] font-bold hover:bg-white transition-colors flex flex-col items-center gap-1">
                            <BarChart2 size={14} className="text-slate-400" /> MCQ
                        </button>
                        <button onClick={() => addSlide('WORD_CLOUD')} className="p-2 border border-dashed border-slate-300 rounded text-[10px] font-bold hover:bg-white transition-colors flex flex-col items-center gap-1">
                            <Cloud size={14} className="text-slate-400" /> Word Cloud
                        </button>
                        <button onClick={() => addSlide('QA')} className="p-2 border border-dashed border-slate-300 rounded text-[10px] font-bold hover:bg-white transition-colors flex flex-col items-center gap-1">
                            <Type size={14} className="text-slate-400" /> Q&A
                        </button>
                        <button onClick={() => addSlide('QUIZ_MCQ')} className="p-2 border border-dashed border-slate-300 rounded text-[10px] font-bold hover:bg-white transition-colors flex flex-col items-center gap-1">
                            <Trophy size={14} className="text-slate-400" /> Quiz
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={() => router.push(`/host/${id}`)}
                        className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                    >
                        <Play size={16} fill="white" /> Present
                    </button>
                </div>
            </aside>

            {/* Main Editor Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : !activeSlide ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                        <div className="text-6xl mb-6">✨</div>
                        <h1 className="text-2xl font-bold mb-2">Build your Session</h1>
                        <p className="text-slate-500 max-w-sm mb-8">Add a slide to start creating interactive content for your audience</p>
                        <div className="flex gap-4">
                            <button onClick={() => addSlide('POLL_MCQ')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Add MCQ Poll</button>
                            <button onClick={() => setShowAIModal(true)} className="bg-white border-2 border-slate-200 px-6 py-3 rounded-xl font-bold hover:border-slate-300 active:scale-95 transition-all flex items-center gap-2">
                                <Sparkles size={18} className="text-blue-600" /> Generate with AI
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => router.push('/host/dashboard')} className="text-slate-400 hover:text-slate-600">
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="h-6 w-px bg-slate-100" />
                                <h1 className="font-bold text-slate-800">Edit Slide {activeSlideIndex + 1}</h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="text-slate-500 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                    <Eye size={20} />
                                </button>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 active:scale-95 transition-all">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
                            <div className="max-w-3xl mx-auto space-y-10">
                                {/* Question Input */}
                                <section className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question Title</label>
                                    <textarea
                                        value={activeSlide.question}
                                        onChange={(e) => updateActiveSlide({ question: e.target.value })}
                                        placeholder="Type your question here..."
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl p-6 text-2xl font-bold outline-none focus:border-blue-500 transition-all shadow-sm min-h-[120px]"
                                    />
                                </section>

                                {/* Options List */}
                                {activeSlide.type.includes('MCQ') && (
                                    <section className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Options</label>
                                            <button className="text-xs font-bold text-blue-600 hover:underline">+ Add Option</button>
                                        </div>
                                        <div className="space-y-3">
                                            {activeSlide.options.map((opt, i) => (
                                                <div key={opt.id || i} className="flex gap-3 group">
                                                    <div className={`w-8 h-12 flex items-center justify-center font-bold rounded-lg ${opt.isCorrect ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={opt.text}
                                                        className="flex-1 bg-white border border-slate-100 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 shadow-sm"
                                                        placeholder="Enter option text..."
                                                    />
                                                    <button className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* AI Assistance */}
                                <section className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden group shadow-xl shadow-blue-600/20">
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                            <Sparkles size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-1">Generate with AI</h3>
                                            <p className="text-blue-100 text-sm">Use Text Input or paste a transcript to create instant high-quality questions</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAIModal(true)}
                                            className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-extrabold text-sm active:scale-95 transition-all shadow-lg"
                                        >
                                            Open Generator
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all" />
                                </section>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
