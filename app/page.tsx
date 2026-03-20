"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';

type PollType = 'wordcloud' | 'multiple-choice' | 'open-ended';

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function CreatePoll() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [backgroundParticles, setBackgroundParticles] = useState<any[]>([]);

  useEffect(() => {
    setBackgroundParticles([...Array(20)].map((_, i) => ({
      id: i,
      left: (Math.random() * 100).toFixed(2),
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 5,
      color: i % 2 === 0 ? '#3b82f6' : '#a855f7'
    })));
    setMounted(true);
  }, []);

  const [joinCode, setJoinCode] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<PollType>('wordcloud');
  const [options, setOptions] = useState<string[]>(['', '']);

  // Video/Doc Generation State
  const [activeTab, setActiveTab] = useState<'manual' | 'video' | 'document'>('manual');
  const [videoUrl, setVideoUrl] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generationError, setGenerationError] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [creationPath, setCreationPath] = useState<'selection' | 'manual' | 'video' | 'document'>('selection');
  const [manualStep, setManualStep] = useState<'selection' | 'form'>('selection');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      router.push(`/vote/${joinCode.toUpperCase().trim()}`);
    }
  };

  const handleCreate = async () => {
    if (!question.trim()) return;
    const id = Math.random().toString(36).substr(2, 6).toUpperCase();
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          question,
          type,
          options: type === 'multiple-choice' ? options.filter(o => o.trim()) : [],
        }),
      });
      if (res.ok) router.push(`/host/${id}`);
    } catch (error) {
      console.error('Failed to create poll', error);
    }
  };

  const handleGenerateQuestions = async () => {
    if (activeTab === 'video' && !videoUrl.trim()) return;
    if (activeTab === 'document' && !documentFile) return;

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedQuestions([]);

    try {
      let res;
      if (activeTab === 'video') {
        res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            videoUrl: manualTranscript ? undefined : videoUrl,
            sourceText: manualTranscript || undefined
          }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', documentFile as Blob);
        formData.append('count', '5');
        res = await fetch('/api/generate-from-file', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok) {
        if (activeTab === 'video' && res.status === 400) setShowManualFallback(true);
        throw new Error(data.details || data.error || 'Failed to generate questions');
      }

      setShowManualFallback(false);
      const rawQuestions = data.questions || (Array.isArray(data) ? data : []);
      const questions = rawQuestions.map((q: any) => ({
        question: q.question || (typeof q === 'string' ? q : ''),
        options: Array.isArray(q.options) ? q.options.map((o:any) => typeof o === 'string' ? o : o.text) : [],
        correctAnswer: q.correctAnswer || ''
      }));
      setGeneratedQuestions(questions);
      
      if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectQuestion = (q: GeneratedQuestion) => {
    setQuestion(q.question);
    setOptions(q.options);
    setType('multiple-choice');
    setCreationPath('manual');
    setManualStep('form');
    setGeneratedQuestions([]);
    setVideoUrl('');
  };

  const addOption = () => setOptions([...options, '']);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-purple-200 relative overflow-x-hidden">
      {/* Immersive Floating Elements Layer 1 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          {[...Array(12)].map((_, i) => (
              <motion.div
                  key={`float-1-${i}`}
                  animate={{
                      y: [0, -150, 0],
                      x: [0, i % 2 === 0 ? 50 : -50, 0],
                      rotate: [0, 180, 360],
                      scale: [1, 1.2, 1],
                  }}
                  transition={{
                      duration: 15 + i * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                  }}
                  style={{
                      position: 'absolute',
                      left: `${(i * 15) % 100}%`,
                      top: `${(i * 20) % 100}%`,
                      width: i % 3 === 0 ? '150px' : i % 3 === 1 ? '100px' : '50px',
                      height: i % 3 === 0 ? '150px' : i % 3 === 1 ? '100px' : '50px',
                      background: i % 2 === 0 ? 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(40px)',
                  }}
              />
          ))}
      </div>

      {/* Layer 2: Faster, smaller particles - Populated in useEffect for hydration safety */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          {backgroundParticles.map((p) => (
              <motion.div
                  key={`float-2-${p.id}`}
                  animate={{
                      y: [0, -1000],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                      duration: p.duration,
                      repeat: Infinity,
                      ease: "linear",
                      delay: p.delay,
                  }}
                  style={{
                      position: 'absolute',
                      left: `${p.left}%`,
                      bottom: `${-10}%`,
                      width: '4px',
                      height: '4px',
                      backgroundColor: p.color,
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(59,130,246,0.8)',
                  }}
              />
          ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-purple-500/20 shadow-lg text-lg">
              ☁️
            </div>
            WordCloud
          </div>
          <button onClick={scrollToForm} className="relative group overflow-hidden bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-900/10">
            <motion.div 
               animate={{ x: ['-100%', '200%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
            <span className="relative z-10">Create Free Poll ⚡</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col justify-center items-center text-center relative overflow-hidden"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 left-10 md:left-32 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-40 right-10 md:right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 font-semibold text-sm mb-6 shadow-sm"
        >
          <span>✨</span> Now with AI Video & Document Generation
        </motion.div>
        
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 max-w-4xl leading-[1] mb-8"
        >
          Engage your audience in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient-x">seconds.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Create stunning live word clouds, dynamic polls, and open-ended Q&As instantly. Let our advanced AI generate interactive questions directly from your YouTube videos and documents.
        </motion.p>
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-10 w-full"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button onClick={scrollToForm} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto">
              Create Free Poll <span>⚡</span>
            </button>
            <a href="#features" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
              How it works
            </a>
          </div>

          <form onSubmit={handleJoin} className="w-full max-w-md bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 group transition-all hover:border-purple-200">
            <div className="flex-1 px-4 flex items-center gap-3">
              <span className="text-xl">🎟️</span>
              <input 
                type="text" 
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code" 
                className="w-full border-none focus:ring-0 text-lg font-bold tracking-widest text-slate-700 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-medium outline-none"
              />
            </div>
            <button type="submit" disabled={joinCode.length !== 6} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 disabled:grayscale active:scale-95">
              Join Poll
            </button>
          </form>
        </motion.div>

        <motion.div 
           initial={{ y: 50, opacity: 0 }}
           whileInView={{ y: 0, opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className="mt-16 w-full max-w-5xl rounded-[40px] border border-white/40 p-3 bg-white/20 backdrop-blur-xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)]"
        >
           <div className="relative rounded-[32px] overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Audience engagement" className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-left">
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-6 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>)}
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Engage in Real-Time</h3>
                <p className="text-white/80 max-w-sm">Watch your audience's thoughts transform into a beautiful interactive word cloud instantly.</p>
              </div>
           </div>
        </motion.div>
      </motion.section>

      {/* Why Choose Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 bg-slate-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:w-1/2 space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">The pulse of your audience, <span className="text-purple-600">visualized.</span></h2>
            <p className="text-xl text-slate-600 leading-relaxed">Traditional polls are boring. WordCloud makes participation fun, anonymous, and visually stunning. Whether it's a classroom of 30 or a global event of 30,000, we scale with you.</p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                <span className="font-bold text-slate-700">100% Secure</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                <span className="font-bold text-slate-700">Real-time Sync</span>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:w-1/2 relative"
          >
            <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-[50px] rotate-3 relative overflow-hidden shadow-inner border border-white">
              <div className="absolute inset-10 bg-white rounded-[40px] shadow-2xl p-8 flex flex-col justify-center gap-4 -rotate-3">
                 {[
                   {word: 'Engagement', size: 'text-3xl', color: 'text-purple-600'},
                   {word: 'Innovation', size: 'text-xl', color: 'text-blue-500'},
                   {word: 'Teamwork', size: 'text-2xl', color: 'text-slate-800'},
                   {word: 'Dynamic', size: 'text-lg', color: 'text-emerald-500'},
                   {word: 'AI Magic', size: 'text-4xl', color: 'text-indigo-600'},
                   {word: 'Realtime', size: 'text-xl', color: 'text-rose-500'}
                 ].map((item, idx) => (
                   <motion.span 
                    key={idx} 
                    animate={{ x: [0, 10, 0], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                    className={`${item.size} ${item.color} font-black block`}
                    style={{ marginLeft: `${idx * 15}px` }}
                   >
                     {item.word}
                   </motion.span>
                 ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-white border-y border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 tracking-tight">Everything you need for interactive presentations</h2>
            <p className="text-slate-500 text-lg">Pick from multiple engaging formats to capture your audience's attention.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {icon: '☁️', title: 'Live Word Clouds', desc: 'Visualize audience thoughts in real-time. Watch words grow as multiple people submit the same answers.', color: 'hover:border-purple-200 hover:shadow-purple-100/50'},
              {icon: '📊', title: 'Multiple Choice Polls', desc: 'Test knowledge or gather opinions with classic A/B/C grids. Show live results instantly to everyone.', color: 'hover:border-blue-200 hover:shadow-blue-100/50'},
              {icon: '💬', title: 'Open Ended Q&A', desc: 'Let your audience type long-form answers, ask questions, or provide detailed feedback anonymously.', color: 'hover:border-emerald-200 hover:shadow-emerald-100/50'}
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-8 rounded-[40px] bg-white border border-slate-100 ${feature.color} shadow-sm hover:shadow-2xl transition-all group duration-500 relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-50 shadow-inner rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-white transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Creation Workspace */}
      <section ref={formRef} id="create" className="py-24 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {creationPath === 'selection' ? (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4"
              >
                {[
                  { id: 'manual', icon: '✏️', title: 'Quick Manual', desc: 'Build a custom poll in seconds.', color: 'hover:border-blue-500/50 hover:shadow-blue-500/20', badge: null },
                  { id: 'video', icon: '🎬', title: 'Video Wizard', desc: 'AI generates polls from YouTube links.', color: 'hover:border-purple-500/50 hover:shadow-purple-500/20', badge: 'AI Superpower' },
                  { id: 'document', icon: '📄', title: 'Doc Scanner', desc: 'Extract questions from PDFs/Word files.', color: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20', badge: null }
                ].map((path) => (
                  <button 
                    key={path.id}
                    onClick={() => {
                        setCreationPath(path.id as any);
                        if(path.id === 'manual') setManualStep('selection');
                        else setActiveTab(path.id as any);
                    }}
                    className={`group relative bg-white/5 border border-white/10 p-10 rounded-[32px] text-center hover:bg-white/10 transition-all duration-500 ${path.color} hover:-translate-y-2 hover:shadow-2xl`}
                  >
                    {path.badge && <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-[10px] font-black uppercase text-white shadow-lg z-10">{path.badge}</div>}
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">{path.icon}</div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{path.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{path.desc}</p>
                    <div className="inline-flex items-center gap-2 text-white/40 font-bold text-sm tracking-widest uppercase bg-white/5 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Select <span>→</span></div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="workspace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl mx-auto w-full px-4"
              >
                <div className="bg-white rounded-[40px] shadow-2xl border border-white/10 overflow-hidden text-slate-800">
                  <div className="bg-slate-50/80 p-6 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
                        {creationPath === 'manual' ? '✏️' : creationPath === 'video' ? '🎬' : '📄'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 tracking-tight leading-none uppercase text-xs">{creationPath} Mode</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Workspace</p>
                      </div>
                    </div>
                    <button onClick={() => { setCreationPath('selection'); setGeneratedQuestions([]); setShowManualFallback(false); }} className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all shadow-sm active:scale-95">Change Path</button>
                  </div>

                  <div className="p-10 min-h-[450px]">
                    <AnimatePresence mode="wait">
                      {creationPath === 'manual' && manualStep === 'selection' ? (
                        <motion.div key="manual-selection" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex flex-col items-center">
                          <div className="text-center mb-4">
                            <h4 className="text-lg font-bold text-slate-800 mb-1">Pick your poll style</h4>
                            <p className="text-xs text-slate-500">Optimized for maximum engagement.</p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 w-full">
                            {[
                              {id: 'wordcloud', icon: '☁️', title: 'Live Word Cloud', desc: 'Real-time pulsing word groups.'},
                              {id: 'multiple-choice', icon: '📊', title: 'Power Poll', desc: 'Classic A/B selection with graphs.'},
                              {id: 'open-ended', icon: '💬', title: 'Open Q&A', desc: 'Detailed anonymous feedback.'}
                            ].map((style) => (
                              <motion.button key={style.id} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => { setType(style.id as PollType); setManualStep('form'); }} className="group flex items-center gap-6 p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500/50 hover:bg-blue-50/30 transition-all text-left shadow-sm">
                                <div className="w-14 h-14 bg-white shadow-md rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{style.icon}</div>
                                <div><h5 className="font-bold text-slate-800">{style.title}</h5><p className="text-xs text-slate-400 font-medium">{style.desc}</p></div>
                                <span className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      ) : creationPath === 'manual' && manualStep === 'form' ? (
                        <motion.div key="manual-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                            <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-tight">Active:</span>
                            <div className="bg-white px-3 py-1 rounded-lg shadow-sm text-xs font-black text-blue-600 uppercase border border-blue-100">{type}</div>
                            <button onClick={() => setManualStep('selection')} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase px-2">Edit</button>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Question</label>
                            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What is your favorite technology?" className="w-full p-5 rounded-[24px] border-2 border-slate-200 focus:border-blue-500 outline-none transition-all text-lg font-bold placeholder:text-slate-300 resize-none h-32 shadow-inner" />
                          </div>
                          {type === 'multiple-choice' && (
                            <div className="space-y-4">
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Options</label>
                              <div className="grid gap-3">
                                {options.map((opt, idx) => (
                                  <div key={idx} className="relative group">
                                    <input type="text" value={opt} onChange={(e) => { const n = [...options]; n[idx] = e.target.value; setOptions(n); }} placeholder={`Option ${idx + 1}`} className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none shadow-sm pl-12" />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase text-xs">{String.fromCharCode(65 + idx)}</span>
                                  </div>
                                ))}
                              </div>
                              <button onClick={addOption} className="text-xs text-blue-600 font-black hover:text-blue-700 mt-2 flex items-center justify-center gap-2 w-full p-3 bg-blue-50 rounded-xl border border-blue-100 transition-all border-dashed hover:border-solid">+ ADD OPTION</button>
                            </div>
                          )}
                          <button onClick={handleCreate} disabled={!question.trim()} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] transition-all disabled:opacity-50 shadow-2xl shadow-slate-900/40 active:scale-95 uppercase tracking-widest text-sm">Launch Live Session 🚀</button>
                        </motion.div>
                      ) : (
                        <motion.div key="ai-path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 flex flex-col justify-between h-full">
                          {!generatedQuestions.length ? (
                            <div className="h-full flex flex-col justify-between py-2">
                              {creationPath === 'video' ? (
                                <div>
                                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">YouTube URL</label>
                                  <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl shadow-inner">▶️</div>
                                    <input type="text" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); setShowManualFallback(false); }} placeholder="Paste video link here" className="w-full p-5 pl-18 rounded-2xl border-2 border-slate-200 focus:border-purple-500 outline-none transition-all text-sm font-bold shadow-inner" />
                                  </div>
                                  {showManualFallback && (
                                    <div className="mt-6 p-6 bg-purple-50/50 rounded-3xl border border-purple-100/50">
                                      <label className="block text-[10px] font-black text-purple-700 mb-3 uppercase tracking-widest">Manual Transcript</label>
                                      <textarea value={manualTranscript} onChange={(e) => setManualTranscript(e.target.value)} placeholder="Paste transcript here..." className="w-full h-32 p-4 text-sm rounded-2xl border border-purple-200 outline-none focus:border-purple-500 transition-all resize-none shadow-sm" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Upload Source</label>
                                  <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-[32px] flex flex-col items-center justify-center p-4 relative group cursor-pointer">
                                    <input type="file" accept=".pdf,.docx,.pptx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
                                    <div className="text-center z-10 transition-all duration-300">
                                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-3xl">{documentFile ? '📑' : '📂'}</div>
                                      <p className="font-black text-slate-700 text-sm uppercase tracking-tight">{documentFile ? documentFile.name : 'Drop file here'}</p>
                                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{documentFile ? (documentFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'PDF, DOCX, or PPTX'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="mt-8">
                                {generationError && <div className="mb-4 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-start gap-3"><span>⚠️</span>{generationError}</div>}
                                <button onClick={handleGenerateQuestions} disabled={isGenerating || (creationPath === 'video' ? (!videoUrl.trim() && !manualTranscript.trim()) : !documentFile)} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white font-black py-5 rounded-[24px] transition-all disabled:opacity-60 shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs">
                                  {isGenerating ? <><LoadingSpinner size="small" color="bg-white" hideLabel /><span className="animate-pulse">Analyzing...</span></> : <><span>✨</span> AI GENERATE</>}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6 h-full flex flex-col pt-2">
                              <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-2xl border border-purple-100 shrink-0">
                                <div className="flex items-center gap-3"><span className="animate-bounce">✨</span><h3 className="font-black text-purple-900 text-xs uppercase tracking-widest">Select Question</h3></div>
                                <button onClick={() => setGeneratedQuestions([])} className="text-[10px] text-purple-600 hover:text-white hover:bg-purple-600 font-black px-4 py-2 bg-white rounded-xl shadow-sm transition-all uppercase tracking-tighter">Back</button>
                              </div>
                              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
                                {generatedQuestions.map((q, idx) => (
                                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} onClick={() => selectQuestion(q)} className="p-6 rounded-[28px] border-2 border-slate-100 hover:border-purple-400 hover:bg-purple-50/30 hover:shadow-xl cursor-pointer transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700" />
                                    <p className="font-black text-slate-800 mb-5 group-hover:text-purple-900 leading-tight text-lg">{q.question}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {q.options.slice(0, 4).map((opt, i) => (
                                        <div key={i} className="text-[11px] font-bold px-4 py-2.5 bg-white border border-slate-100 group-hover:border-purple-200 shadow-sm rounded-xl text-slate-500 flex items-center gap-3">
                                          <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 group-hover:bg-purple-100 text-[10px] text-slate-400 group-hover:text-purple-600 font-black uppercase">{String.fromCharCode(65 + i)}</span> 
                                          <span className="truncate">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Benefits Content */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-32 px-6 bg-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24 max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 font-black text-[10px] uppercase tracking-[0.25em] rounded-full mb-4">Features</div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Ultimate Engagement.</span></h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">We've built everything you need to transform a passive audience into an active participant.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {icon: '⚡', title: 'Instant Load', desc: 'No lag, no delays. Everything syncs in under 50ms across all participants.'},
              {icon: '📱', title: 'Mobile First', desc: 'Optimized for every screen from iPhones to massive stage displays.'},
              {icon: '🔒', title: 'Safety First', desc: 'Advanced word filtering and moderation ensures your event stays on track.'},
              {icon: '🎨', title: 'Custom Themes', desc: 'Match your brand colors and styles perfectly for a seamless experience.'}
            ].map((benefit, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                <div className="text-4xl mb-6 group-hover:rotate-12 transition-transform">{benefit.icon}</div>
                <h4 className="text-xl font-bold mb-3 text-slate-900">{benefit.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 p-12 md:p-20 rounded-[60px] bg-slate-900 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-3/5 space-y-6">
                <h3 className="text-4xl md:text-5xl font-black text-white leading-tight underline decoration-purple-500 decoration-8 underline-offset-8">Ready to transform <br/> your next event?</h3>
                <p className="text-slate-400 text-lg">Join 2,500+ presenters who use WordCloud every single day.</p>
              </div>
              <button onClick={scrollToForm} className="bg-white text-slate-900 px-12 py-6 rounded-full text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto uppercase tracking-wider">
                Create First Poll
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-20 text-slate-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
                <div className="flex items-center gap-3 font-black text-2xl text-slate-900">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg text-xl text-white">☁️</div>
                  WordCloud
                </div>
                <p className="text-slate-500 max-w-xs font-medium leading-relaxed">The ultimate tool for interactive real-time audience engagement and word cloud visualization.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <h5 className="font-black text-[11px] text-slate-900 uppercase tracking-widest">Product</h5>
                <ul className="space-y-2 text-sm font-bold">
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">Live Polls</li>
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">Word Clouds</li>
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">AI Generation</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-black text-[11px] text-slate-900 uppercase tracking-widest">Company</h5>
                <ul className="space-y-2 text-sm font-bold">
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">About</li>
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">Privacy</li>
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">Terms</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-black text-[11px] text-slate-900 uppercase tracking-widest">Help</h5>
                <ul className="space-y-2 text-sm font-bold">
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">Support</li>
                  <li className="hover:text-purple-600 transition-colors cursor-pointer">Docs</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">© 2026 WordCloud Inc. All rights reserved.</p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 group-hover:bg-purple-600 transition-all flex items-center justify-center text-white text-[10px] font-black italic">W</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-purple-600 transition-colors">Premium Cloud</span>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
