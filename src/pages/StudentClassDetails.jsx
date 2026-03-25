import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, Calendar, AlertCircle, ShieldCheck, Star, FileText, Download, Image, BookOpen } from 'lucide-react';
import api from '../utils/api';

const StudentClassDetails = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const isUserCR = classData?.CRs?.some(id => (id._id || id) === user?._id);
    const isUserMentor = classData?.mentors?.some(id => (id._id || id) === user?._id);

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const { data } = await api.get(`/college/student/classes/${classId}`);
                setClassData(data.class);
                setStats(data.stats);
                setHistory(data.history);

                // Fetch Notes
                const { data: notesData } = await api.get(`/notes/${classId}`);
                setNotes(notesData);
            } catch (error) {
                console.error("Failed to fetch class details");
            } finally {
                setLoading(false);
            }
        };
        fetchClassDetails();
    }, [classId]);

    if (loading) return (
        <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!classData) return <div className="p-8 text-center text-slate-500">Class not found</div>;

    return (
        <div className="min-h-screen relative bg-[#020617] p-4 md:p-8 lg:p-10 overflow-x-hidden font-sans">
            {/* Cinematic Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/10 blur-[130px] rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[130px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={() => navigate('/student')}
                            className="p-3.5 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl"
                        >
                            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight">{classData.name}</h1>
                                <div className="flex gap-2">
                                    {isUserCR && (
                                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[8px] md:text-[10px] uppercase font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                            <Star className="w-3 h-3 fill-amber-500" /> Class Representative
                                        </span>
                                    )}
                                    {isUserMentor && (
                                        <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-3 py-1 rounded-full text-[8px] md:text-[10px] uppercase font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                            <ShieldCheck className="w-3 h-3" /> Mentor Role
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 font-black uppercase text-[10px] md:text-xs tracking-widest opacity-80">
                                <span className="text-primary-400">{classData.subject}</span>
                                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                <span>Prof. {classData.user?.name}</span>
                                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                <span>SEM {classData.semester}</span>
                            </div>
                        </div>
                    </div>

                    {(isUserCR || isUserMentor) && (
                        <button
                            onClick={() => navigate(`/teacher/classes/${classId}`)}
                            className="btn-primary w-full md:w-auto px-8 py-4 rounded-2xl text-[10px] md:text-xs uppercase font-black tracking-[0.2em] shadow-2xl shadow-primary-500/20"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span>Executive Panel</span>
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card p-8 md:p-10 bg-gradient-to-br from-primary-600/90 to-violet-700/90 text-white border-none shadow-2xl shadow-primary-500/20 relative overflow-hidden group"
                    >
                        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-3">Overall Presence</h3>
                        <p className="text-5xl md:text-6xl font-black tracking-tighter mb-4">{stats.percentage}%</p>
                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </motion.div>

                    <div className="card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group">
                        <Calendar className="w-10 h-10 text-emerald-500 mb-6 opacity-80" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Sessions Attended</h3>
                        <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">{stats.present} <span className="text-xl md:text-2xl text-slate-600">/ {stats.total}</span></p>
                    </div>

                    <div className="card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group">
                        <AlertCircle className="w-10 h-10 text-amber-500 mb-6 opacity-80" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Target Benchmark</h3>
                        <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">{classData.targetPercentage}%</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                        Shared Academic Assets
                    </h2>
                </div>

                {notes.length === 0 ? (
                    <div className="p-12 mb-16 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5 opacity-60">
                        <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-40" />
                        <p className="text-slate-600 font-bold uppercase tracking-[0.25em] text-[10px]">No academic assets shared for this registry</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {notes.map((note) => (
                            <motion.div
                                key={note._id}
                                whileHover={{ y: -5 }}
                                className="card p-6 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-4 rounded-2xl ${note.fileType === 'pdf' ? 'bg-rose-500/10 text-rose-500' :
                                        note.fileType === 'ppt' ? 'bg-amber-500/10 text-amber-500' :
                                            note.fileType === 'image' ? 'bg-emerald-500/10 text-emerald-500' :
                                                'bg-primary-500/10 text-primary-500'
                                        }`}>
                                        {note.fileType === 'image' ? <Image className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                    <a
                                        href={`${api.defaults.baseURL.replace('/api', '')}${note.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-primary-600 transition-all shadow-lg"
                                        title="Download Asset"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg tracking-tight mb-2 truncate" title={note.title}>{note.title}</h4>
                                    <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4 line-clamp-2">{note.description || 'Reference material shared by your professor.'}</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[8px] text-slate-400 font-black">
                                                {note.teacher?.name?.charAt(0)}
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Prof. {note.teacher?.name}</span>
                                        </div>
                                        <span className="text-[8px] text-slate-600 font-bold uppercase">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary-600 rounded-full" />
                        Attendance Log
                    </h2>
                </div>

                <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden mb-20">
                    {history.length === 0 ? (
                        <div className="p-20 text-center">
                            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm md:text-base opacity-40">Static Registry - No records found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {history.map(record => (
                                <motion.div
                                    key={record._id}
                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                    className="p-6 md:p-8 flex justify-between items-center transition-colors group"
                                >
                                    <div className="flex items-center gap-5 md:gap-8">
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black transition-transform group-hover:scale-110 ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                            {record.status === 'Present' ? 'P' : 'A'}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-base md:text-lg tracking-tight mb-1">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System Logged</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${record.status === 'Present' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/5 text-rose-500 border-rose-500/10'}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentClassDetails;
