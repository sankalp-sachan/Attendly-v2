import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trophy, Users, Search, Filter, Loader2, Award, ClipboardList } from 'lucide-react';
import api from '../../utils/api';

const QuizTeacherResults = () => {
    const { id, classId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [quizInfo, setQuizInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: resultsData } = await api.get(`/quizzes/${id}/results`);
                setResults(resultsData);
                
                // Fetch first record to get quiz info or create a separate route for it
                if (resultsData.length > 0) {
                    setQuizInfo(resultsData[0].quiz);
                }
            } catch (error) {
                console.error("Failed to fetch results");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownload = async () => {
        try {
            const response = await api.get(`/quizzes/${id}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quiz_Results_${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Export failed");
        }
    };

    const filteredResults = results.filter(r => 
        r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen grid place-items-center bg-[#020617]">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 font-sans text-white">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all shadow-xl"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Evaluation Dashboard</h1>
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Quiz ID: {id}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={handleDownload}
                            className="btn-primary flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export Registry</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="card p-8 bg-slate-900 border-white/5 relative overflow-hidden group">
                        <Users className="w-10 h-10 text-primary-400 mb-6 opacity-80" />
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Total Participants</h3>
                        <p className="text-5xl font-black tracking-tighter">{results.length}</p>
                        <p className="mt-2 text-[10px] font-bold text-primary-400 uppercase tracking-widest">Logged Submissions</p>
                    </div>

                    <div className="card p-8 bg-slate-900 border-white/5 relative overflow-hidden group">
                        <Trophy className="w-10 h-10 text-amber-500 mb-6 opacity-80" />
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Average Score</h3>
                        <p className="text-5xl font-black tracking-tighter">
                            {results.length > 0 
                                ? ((results.reduce((a, b) => a + b.score, 0) / (results.length * (results[0]?.totalQuestions || 1))) * 100).toFixed(0)
                                : 0
                            }%
                        </p>
                        <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">Class Performance</p>
                    </div>

                    <div className="card p-8 bg-slate-900 border-white/5 relative overflow-hidden group">
                        <Award className="w-10 h-10 text-emerald-500 mb-6 opacity-80" />
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Completion Rate</h3>
                        <p className="text-5xl font-black tracking-tighter">100%</p>
                        <p className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">System Stability</p>
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-2 h-8 bg-amber-500 rounded-full" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Elite Performers</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                        {results.slice(0, 3).map((r, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={r._id}
                                className={`min-w-[300px] p-8 rounded-[2.5rem] border ${index === 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-900 border-white/5'} flex flex-col items-center text-center`}
                            >
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 border-4 ${index === 0 ? 'border-amber-500/30' : 'border-white/5'}`}>
                                    <span className="text-3xl font-black">{index + 1}</span>
                                </div>
                                <h4 className="text-white font-black text-xl mb-1 truncate w-full">{r.student.name}</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Roll NO: {r.student.rollNo || 'N/A'}</p>
                                <div className="text-4xl font-black tracking-tighter text-white">
                                    {r.score} <span className="text-lg text-slate-600 font-bold">/ {r.totalQuestions}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* All Results Table */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                            <ClipboardList className="w-8 h-8 text-primary-400" />
                            Full Registry
                        </h2>
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Scan principal records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-14 bg-slate-900"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-black/40">
                                <tr>
                                    <th className="px-10 py-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Principal Identity</th>
                                    <th className="px-10 py-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Credentials</th>
                                    <th className="px-10 py-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Net Performance</th>
                                    <th className="px-10 py-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Log</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredResults.map((r) => (
                                    <tr key={r._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-400 group-hover:text-primary-400 transition-colors text-lg">
                                                    {r.student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-white text-base tracking-tight mb-0.5">{r.student.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{r.student.rollNo || 'REGISTRY_VOID'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-slate-400">{r.student.email}</div>
                                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Enr: {r.student.enrollmentNo || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-32 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${((r.score / r.totalQuestions) * 100) >= 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}
                                                        style={{ width: `${(r.score / r.totalQuestions) * 100}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xl font-black tracking-tighter ${((r.score / r.totalQuestions) * 100) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {r.score}<span className="text-xs text-slate-600 font-bold">/{r.totalQuestions}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="text-xs font-bold text-slate-500">
                                                {new Date(r.completedAt).toLocaleDateString()}
                                                <div className="text-[9px] uppercase tracking-widest opacity-60 mt-0.5">
                                                    {new Date(r.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizTeacherResults;
