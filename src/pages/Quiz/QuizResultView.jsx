import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, CheckCircle, XCircle, Award, Target, HelpCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const QuizResultView = () => {
    const { id, classId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: resultData } = await api.get(`/quizzes/${id}/my-result`);
                setResult(resultData);
                
                const { data: leaderboardData } = await api.get(`/quizzes/${id}/leaderboard`);
                setLeaderboard(leaderboardData);
            } catch (error) {
                console.error("Failed to fetch result");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen grid place-items-center bg-[#020617]">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );

    if (!result) return (
        <div className="min-h-screen grid place-items-center bg-[#020617] text-white">
            <div className="text-center">
                <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h1 className="text-2xl font-black uppercase tracking-tighter">Record Not Found</h1>
                <button onClick={() => navigate(-1)} className="mt-6 text-primary-400 font-bold uppercase text-[10px] tracking-widest">Return to Dashboard</button>
            </div>
        </div>
    );

    const scorePercentage = (result.score / result.totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 font-sans text-white">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center gap-6 mb-12">
                    <button
                        onClick={() => navigate(`/student/classes/${classId}`)}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all shadow-xl"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Evaluation Output</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{result.quiz.title}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Score Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1 card p-10 bg-gradient-to-br from-primary-600 to-indigo-700 border-none shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative w-40 h-40 mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    className="text-white/20"
                                    strokeWidth="12"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                />
                                <motion.circle
                                    className="text-white"
                                    strokeWidth="12"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * scorePercentage) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black">{Math.round(scorePercentage)}%</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Result</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black mb-1">Elite Performance</h3>
                        <p className="text-white/60 font-bold text-xs uppercase tracking-widest">{result.score} Correct Modules / {result.totalQuestions} Total</p>
                    </motion.div>

                    {/* Quick Stats & Leaderboard */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="card p-8 bg-slate-900 border-white/5 flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                    <Target className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Accuracy Index</h4>
                                    <p className="text-2xl font-black tracking-tighter">{((result.score / result.totalQuestions) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="card p-8 bg-slate-900 border-white/5 flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Standing</h4>
                                    <p className="text-2xl font-black tracking-tighter">
                                        #{leaderboard.findIndex(l => l.student._id === result.student) + 1 || '?'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Local Leaderboard */}
                        <div className="card bg-slate-900 border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center gap-4">
                                <Award className="w-5 h-5 text-amber-500" />
                                <h3 className="font-black uppercase tracking-widest text-xs">Class Vanguard Leaderboard</h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {leaderboard.map((entry, index) => (
                                    <div key={index} className={`p-4 px-6 flex justify-between items-center ${entry.student._id === result.student ? 'bg-primary-600/10' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <span className={`w-6 text-xs font-black ${index < 3 ? 'text-amber-500' : 'text-slate-600'}`}>{index + 1}</span>
                                            <span className="font-black text-sm uppercase tracking-tight">{entry.student.name}</span>
                                            {entry.student._id === result.student && (
                                                <span className="bg-primary-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">You</span>
                                            )}
                                        </div>
                                        <div className="font-black text-lg">
                                            {entry.score} <span className="text-[10px] text-slate-600">/ {entry.totalQuestions}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Review (Optional logic, let's keep it simple for now) */}
                <div className="space-y-6 mb-12">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                        <HelpCircle className="w-6 h-6 text-primary-400" />
                        Intelligence Debrief
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.answers.map((answer, index) => (
                            <div key={index} className={`card p-6 border ${answer.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-black text-xs uppercase text-slate-500 tracking-widest">Module {index + 1}</h4>
                                    {answer.isCorrect ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-rose-500" />
                                    )}
                                </div>
                                <p className="font-bold text-sm mb-4 line-clamp-2">{result.quiz.questions[index].questionText}</p>
                                <div className="text-[10px] uppercase font-black tracking-widest space-y-2">
                                    <p className={`${answer.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        Selected: {result.quiz.questions[index].options[answer.selectedOption] || 'N/A'}
                                    </p>
                                    {!answer.isCorrect && (
                                        <p className="text-emerald-500">
                                            Correct: {result.quiz.questions[index].options[result.quiz.questions[index].correctOption]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResultView;
