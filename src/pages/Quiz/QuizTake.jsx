import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Shield, CheckCircle, ChevronRight, ChevronLeft, HelpCircle, Loader2, FileText, Download, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

const QuizTake = () => {
    const { id, classId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthorized && quiz) {
            setTimeLeft(quiz.duration * 60);
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isAuthorized, quiz]);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        try {
            const { data } = await api.post(`/quizzes/${id}/join`, { password });
            setQuiz(data);
            setIsAuthorized(true);
        } catch (error) {
            setAuthError(error.response?.data?.message || 'Invalid password or already submitted');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        
        const confirmSubmit = window.confirm("Are you sure you want to submit the quiz?");
        if (!confirmSubmit && timeLeft > 0) return;

        setIsSubmitting(true);
        try {
            const answersArray = quiz.questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);
            await api.post(`/quizzes/${id}/submit`, { answers: answersArray });
            
            if (quiz.showResult) {
                navigate(`/student/classes/${classId}/quiz/${id}/result`);
            } else {
                alert("Quiz submitted successfully! Results will be released by the teacher later.");
                navigate(`/student/classes/${classId}`);
            }
        } catch (error) {
            alert("Submission failed. Please contact your teacher.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#020617] grid place-items-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md card p-10 bg-slate-900 shadow-2xl border-white/5"
                >
                    <div className="w-20 h-20 bg-primary-600/10 text-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/10">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-center text-white uppercase tracking-tighter mb-2">Quiz Authorization</h2>
                    <p className="text-slate-500 text-center text-[10px] font-black uppercase tracking-widest mb-10">Verification Protocol Required</p>
                    
                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Access Key</label>
                            <input 
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field bg-black/40 font-mono tracking-widest px-8"
                                autoFocus
                            />
                        </div>
                        {authError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{authError}</p>}
                        <button 
                            disabled={loading}
                            className="btn-primary w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Initialize Session</span>}
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full py-2 text-slate-600 font-black text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Abort Protocol
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col min-h-[85vh]">
                <header className="flex justify-between items-center mb-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {quiz.questionFile && (
                            <a
                                href={`${api.defaults.baseURL.replace('/api', '')}${quiz.questionFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl shadow-lg text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                            >
                                <FileText className="w-5 h-5" />
                                <span>Question Paper</span>
                                <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                            </a>
                        )}

                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl shadow-lg">
                            <Clock className="w-5 h-5 text-rose-500 animate-pulse" />
                            <span className="font-mono text-lg font-black text-rose-500">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex flex-col justify-center gap-10">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="card p-8 md:p-12 bg-slate-900/60 border-white/5 shadow-2xl"
                        >
                            <h2 className="text-xl md:text-3xl font-bold leading-tight mb-12">
                                {quiz.questions[currentQuestion].questionText}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {quiz.questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                                            answers[currentQuestion] === index 
                                            ? 'bg-primary-600/20 border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                                            : 'bg-white/5 border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                                                answers[currentQuestion] === index ? 'bg-primary-600 text-white' : 'bg-black/40 text-slate-500 group-hover:text-slate-300'
                                            }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className={`text-base font-bold ${answers[currentQuestion] === index ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                {option}
                                            </span>
                                        </div>
                                        {answers[currentQuestion] === index && (
                                            <motion.div layoutId="check" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400">
                                                <CheckCircle className="w-6 h-6" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center shrink-0">
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0 || !quiz.backtrackingEnabled}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-20 transition-all flex items-center gap-3"
                        >
                            <ChevronLeft className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                                {quiz.backtrackingEnabled ? 'Previous Module' : 'Backtracking Locked'}
                            </span>
                        </button>

                        <div className="flex gap-2">
                            {quiz.questions.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentQuestion ? 'w-8 bg-primary-500' : answers[i] !== undefined ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                            ))}
                        </div>

                        {currentQuestion === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-500 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-2 h-2 bg-white rounded-full" />}
                                <span>Terminate & Submit</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                                className="bg-primary-600 hover:bg-primary-500 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3"
                            >
                                <span className="hidden sm:block">Next Module</span>
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizTake;
