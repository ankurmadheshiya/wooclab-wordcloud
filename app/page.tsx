"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type PollType = 'wordcloud' | 'multiple-choice';

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function CreatePoll() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<PollType>('wordcloud');
  const [options, setOptions] = useState<string[]>(['', '']);

  // Video Generation State
  const [activeTab, setActiveTab] = useState<'manual' | 'video' | 'document'>('manual');
  const [videoUrl, setVideoUrl] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generationError, setGenerationError] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');

  const handleCreate = async () => {
    if (!question.trim()) return;

    const id = Math.random().toString(36).substr(2, 6).toUpperCase();

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          question,
          type,
          options: type === 'multiple-choice' ? options.filter(o => o.trim()) : [],
        }),
      });

      if (res.ok) {
        router.push(`/host/${id}`);
      }
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            videoUrl: manualTranscript ? undefined : videoUrl,
            sourceText: manualTranscript || undefined
          }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', documentFile as Blob);
        formData.append('count', '5'); // Generate 5 questions

        res = await fetch('/api/generate-from-file', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await res.json();

      if (!res.ok) {
        if (activeTab === 'video' && res.status === 400) {
            setShowManualFallback(true);
        }
        throw new Error(data.details || data.error || 'Failed to generate questions');
      }

      setShowManualFallback(false);

      if (activeTab === 'document') {
         // API returns slides array, map it to the expected GeneratedQuestion format
         const questions = (Array.isArray(data) ? data : []).map((slide: any) => ({
             question: slide.question || '',
             options: slide.options?.map((o: any) => typeof o === 'string' ? o : o.text) || [],
             correctAnswer: typeof slide.correctAnswer === 'string' ? slide.correctAnswer : slide.options?.find((o: any) => o.isCorrect)?.text || ''
         }));
         setGeneratedQuestions(questions);
      } else {
         const rawQuestions = data.questions || (Array.isArray(data) ? data : []);
         const questions = rawQuestions.map((q: any) => ({
             question: q.question || '',
             options: Array.isArray(q.options) ? q.options : [],
             correctAnswer: q.correctAnswer || ''
         }));
         setGeneratedQuestions(questions);
      }
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
    setActiveTab('manual');
    setGeneratedQuestions([]); // Clear selection
    setVideoUrl(''); // Clear input
  };

  const addOption = () => setOptions([...options, '']);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-slate-900 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Create a New Poll</h1>
          <p className="text-slate-400 text-sm mt-1">Engage your audience in seconds</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap custom-scrollbar">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 min-w-[120px] p-4 font-semibold text-sm transition-colors ${activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manual Creation
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 min-w-[150px] p-4 font-semibold text-sm transition-colors ${activeTab === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            From Video ✨
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`flex-1 min-w-[160px] p-4 font-semibold text-sm transition-colors ${activeTab === 'document' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            From Document 📄
          </button>
        </div>

        <div className="p-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Question</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What is your favorite color?"
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium placeholder:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Poll Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setType('wordcloud')}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${type === 'wordcloud' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                    >
                      <span className="text-2xl">☁️</span>
                      <span className="font-bold">Word Cloud</span>
                    </button>
                    <button
                      onClick={() => setType('multiple-choice')}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${type === 'multiple-choice' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                    >
                      <span className="text-2xl">📊</span>
                      <span className="font-bold">Multiple Choice</span>
                    </button>
                  </div>
                </div>

                {type === 'multiple-choice' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Options</label>
                    {options?.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={opt || ''}
                        onChange={(e) => {
                          const newOpts = [...(options || [])];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all"
                      />
                    ))}
                    <button onClick={addOption} className="text-sm text-blue-600 font-semibold hover:underline">+ Add another option</button>
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={!question.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-95 transform"
                >
                  Start Poll Now
                </button>
              </motion.div>
            ) : activeTab === 'video' || activeTab === 'document' ? (
              <motion.div
                key="generation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!generatedQuestions.length ? (
                  <>
                    {activeTab === 'video' ? (
                        <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">YouTube Video URL</label>
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => {
                                setVideoUrl(e.target.value);
                                setShowManualFallback(false);
                                setManualTranscript('');
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-lg font-medium placeholder:text-slate-300"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            Paste a YouTube link to generate quiz questions from its content.
                        </p>
                        
                        {showManualFallback && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100"
                            >
                                <label className="block text-xs font-bold text-purple-700 mb-2 uppercase tracking-wider">Manual Transcript Fallback</label>
                                <textarea
                                    value={manualTranscript}
                                    onChange={(e) => setManualTranscript(e.target.value)}
                                    placeholder="Auto-fetch failed. Please paste the transcript or video summary here..."
                                    className="w-full h-32 p-3 text-sm rounded-lg border border-purple-200 outline-none focus:border-purple-500 transition-all resize-none"
                                />
                                <p className="text-[10px] text-purple-400 mt-1 italic">
                                    Tip: You can get the transcript on YouTube by clicking "...more" in the description and then "Show transcript".
                                </p>
                            </motion.div>
                        )}
                        </div>
                    ) : (
                        <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Document (PDF, Word, PPT)</label>
                        <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 relative hover:bg-slate-100 transition-all cursor-pointer">
                            <input 
                                type="file" 
                                accept=".pdf,.docx,.pptx"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                            />
                            {documentFile ? (
                                <div className="text-center w-full">
                                    <p className="font-bold text-slate-800 truncate px-4">{documentFile.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <p className="text-sm text-blue-600 mt-2 font-medium">Click to change file</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="font-bold text-slate-600">Click or drag and drop</p>
                                    <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, PPTX</p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Upload a document to extract text and generate questions for your poll.
                        </p>
                        </div>
                    )}

                    {generationError && (
                      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {generationError}
                      </div>
                    )}

                    <button
                      onClick={handleGenerateQuestions}
                      disabled={isGenerating || (activeTab === 'video' ? (!videoUrl.trim() && !manualTranscript.trim()) : !documentFile)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 active:scale-95 transform flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <span>✨</span> Generate Questions
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-800">Select a Question</h3>
                      <button
                        onClick={() => setGeneratedQuestions([])}
                        className="text-sm text-slate-500 hover:text-slate-800"
                      >
                        Back
                      </button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {generatedQuestions?.map((q, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectQuestion(q)}
                          className="p-4 rounded-xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all group"
                        >
                          <p className="font-semibold text-slate-800 mb-2 group-hover:text-purple-900">{q?.question}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {q?.options?.map((opt, i) => (
                              <div key={i} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
