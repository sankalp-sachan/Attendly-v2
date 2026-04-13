import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, Calendar, AlertCircle, ShieldCheck, Star, FileText, Download, Image, BookOpen, HelpCircle, Award, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../utils/api';
import ClassFeed from '../components/ClassFeed';

const StudentClassDetails = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [notes, setNotes] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    
    // Syllabus Summarizer State
    const [syllabusText, setSyllabusText] = useState('');
    const [syllabusSummary, setSyllabusSummary] = useState('');
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);

    // Assignment State
    const [assignments, setAssignments] = useState([]);
    const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [submitFile, setSubmitFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

                // Fetch Quizzes
                const { data: quizzesData } = await api.get(`/quizzes/class/${classId}`);
                setQuizzes(quizzesData);

                // Fetch Assignments
                fetchAssignments();
            } catch (error) {
                console.error("Failed to fetch class details");
            } finally {
                setLoading(false);
            }
        };
        fetchClassDetails();
    }, [classId]);

    const fetchAiInsight = async () => {
        try {
            setLoadingAi(true);
            const { data } = await api.post(`/college/student/classes/${classId}/ai-insight`, {
                present: stats.present || 0,
                total: stats.total || 0,
                target: classData.targetPercentage
            });
            setAiInsight(data.insight);
        } catch (error) {
            setAiInsight("AI insight temporarily unavailable or key missing.");
        } finally {
            setLoadingAi(false);
        }
    };

    const handleSummarizeSyllabus = async (mode = 'summary') => {
        if (!syllabusText.trim()) return;
        try {
            setLoadingSyllabus(true);
            const { data } = await api.post(`/college/student/classes/${classId}/syllabus-summary`, {
                syllabusText,
                mode
            });
            setSyllabusSummary(data.summary);
        } catch (error) {
            setSyllabusSummary(`Failed to generate ${mode}. Please check your text or try again later.`);
        } finally {
            setLoadingSyllabus(false);
        }
    };

    const downloadSyllabusContent = (format = 'pdf') => {
        if (!syllabusSummary) return;

        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text('Attendly AI Syllabus Asset', 14, 22);
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Generated for: ${classData.name}`, 14, 30);
            doc.text(`Subject: ${classData.subject}`, 14, 37);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);
            
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 50, 196, 50);

            doc.setFontSize(11);
            doc.setTextColor(0);
            const splitText = doc.splitTextToSize(syllabusSummary, 170);
            doc.text(splitText, 14, 60);
            doc.save(`${classData.name}_Syllabus_AI.pdf`);
        } else {
            const element = document.createElement("a");
            const file = new Blob([syllabusSummary], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = `${classData.name}_Syllabus_Structure.txt`;
            document.body.appendChild(element);
            element.click();
        }
    };

    const fetchAssignments = async () => {
        setIsFetchingAssignments(true);
        try {
            const { data } = await api.get(`/assignments/class/${classId}`);
            setAssignments(data);
        } catch (error) {
            console.error("Failed to fetch assignments");
        } finally {
            setIsFetchingAssignments(false);
        }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('responseText', responseText);
            if (submitFile) formData.append('file', submitFile);

            await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowSubmitModal(false);
            setResponseText('');
            setSubmitFile(null);
            fetchAssignments();
            alert("Response deployed successfully!");
        } catch (error) {
            alert("Failed to submit assignment");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        {(() => {
                            const target = parseFloat(classData.targetPercentage) / 100;
                            const present = stats?.present || 0;
                            const total = stats?.total || 0;
                            if (total === 0) return <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">No classes held yet</p>;
                            const current = present / total;
                            
                            if (current < target) {
                                let x = Math.ceil((target * total - present) / (1 - target));
                                if (x < 0) x = 0;
                                return <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-rose-400">Must attend next {x} class{x !== 1 ? 'es' : ''} to reach target</p>;
                            } else {
                                let y = Math.floor((present - target * total) / target);
                                if (y === 0) return <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-amber-400">On track. Cannot skip the next class.</p>;
                                return <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-emerald-400">Safe to skip {y} class{y !== 1 ? 'es' : ''}</p>;
                            }
                        })()}
                        <div className="mt-6 border-t border-white/5 pt-4">
                            {!aiInsight ? (
                                <button
                                    onClick={fetchAiInsight}
                                    disabled={loadingAi}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all text-[10px] uppercase font-black tracking-widest border border-indigo-500/20 disabled:opacity-50"
                                >
                                    {loadingAi ? (
                                        <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    ) : (
                                        <>✨ Get AI Insights</>
                                    )}
                                </button>
                            ) : (
                                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 leading-relaxed relative mt-2 text-justify line-clamp-4 hover:line-clamp-none transition-all duration-300">
                                    <span className="absolute -top-2 left-4 px-2 bg-[#020617] border border-indigo-500/auto text-[8px] font-black uppercase text-indigo-400 rounded tracking-[0.2em]">AI Helper</span>
                                    {aiInsight}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-16">
                    <div className="card p-6 md:p-8 bg-slate-900/40 border-white/5 relative overflow-hidden flex flex-col gap-4 shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400 border border-violet-500/20">
                                <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">AI Syllabus Intelligence</h3>
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Paste syllabus to instantly extract key modules and objectives</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col gap-4 relative">
                                <textarea
                                    className="input-field min-h-[160px] resize-none text-sm placeholder:text-slate-600 bg-black/20"
                                    placeholder="Paste syllabus text here..."
                                    value={syllabusText}
                                    onChange={(e) => setSyllabusText(e.target.value)}
                                ></textarea>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button 
                                            onClick={() => handleSummarizeSyllabus('summary')}
                                            disabled={loadingSyllabus || !syllabusText.trim()}
                                            className="btn-primary py-3 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {loadingSyllabus ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                            <span>Summarize</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSummarizeSyllabus('notes')}
                                            disabled={loadingSyllabus || !syllabusText.trim()}
                                            className="px-6 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 group hover:bg-indigo-500/20 transition-all disabled:opacity-30"
                                        >
                                            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>Generate Notes</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSummarizeSyllabus('ppt')}
                                            disabled={loadingSyllabus || !syllabusText.trim()}
                                            className="px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2 group hover:bg-amber-500/20 transition-all disabled:opacity-30"
                                        >
                                            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>PPT Structure</span>
                                        </button>
                                    </div>
                            </div>

                            {syllabusSummary && (
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-[1.5rem] p-6 relative overflow-y-auto max-h-[220px] custom-scrollbar shadow-inner">
                                        <span className="absolute -top-3 left-6 px-3 py-1 bg-[#020617] border border-violet-500/30 text-[8px] font-black uppercase text-violet-400 rounded-lg tracking-[0.2em] shadow-lg">AI Insight</span>
                                        <div className="text-sm text-violet-200/90 leading-relaxed whitespace-pre-wrap mt-2 font-medium">
                                            {syllabusSummary}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => downloadSyllabusContent('pdf')}
                                            className="flex-1 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all shadow-lg"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Get PDF Asset
                                        </button>
                                        <button 
                                            onClick={() => downloadSyllabusContent('txt')}
                                            className="flex-1 py-3 bg-slate-800/40 text-slate-400 border border-white/5 rounded-xl text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all shadow-lg"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Download Outline
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-8 mt-4">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary-600 rounded-full" />
                        Class Synergy Hub
                    </h2>
                </div>

                <div className="mb-16">
                    <ClassFeed classId={classId} />
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
                        Task Directives
                    </h2>
                </div>

                {assignments.length === 0 ? (
                    <div className="p-12 mb-16 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5 opacity-60">
                        <Star className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-40" />
                        <p className="text-slate-600 font-bold uppercase tracking-[0.25em] text-[10px]">No task directives issued for this registry</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {assignments.map((assignment) => (
                            <motion.div
                                key={assignment._id}
                                whileHover={{ y: -5 }}
                                className="card p-6 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    {assignment.mySubmission ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Synchronized</span>
                                            {assignment.mySubmission.grade && (
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mr-1">Grade: {assignment.mySubmission.grade}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectedAssignment(assignment);
                                                setShowSubmitModal(true);
                                            }}
                                            className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/20"
                                        >
                                            Submit Response
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg tracking-tight mb-2 truncate" title={assignment.title}>{assignment.title}</h4>
                                    <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4 line-clamp-2">{assignment.description || 'Deliverable evaluation module.'}</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-rose-400" />
                                            <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        {assignment.fileUrl && (
                                            <a 
                                                href={`${api.defaults.baseURL.replace('/api', '')}${assignment.fileUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all border border-primary-500/10 group/btn"
                                            >
                                                <FileText className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">See Assignment</span>
                                            </a>
                                        )}
                                    </div>
                                    {assignment.mySubmission?.feedback && (
                                        <div className="mt-3 p-3 bg-primary-500/5 rounded-xl border border-primary-500/10 text-[9px] text-primary-300 font-medium italic">
                                            Feedback: {assignment.mySubmission.feedback}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-600 rounded-full" />
                        Evaluation Hub
                    </h2>
                </div>

                {quizzes.length === 0 ? (
                    <div className="p-12 mb-16 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5 opacity-60">
                        <Award className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-40" />
                        <p className="text-slate-600 font-bold uppercase tracking-[0.25em] text-[10px]">No active evaluation sessions available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {quizzes.map((quiz) => (
                            <motion.div
                                key={quiz._id}
                                whileHover={{ y: -5 }}
                                className="card p-6 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                        <HelpCircle className="w-6 h-6" />
                                    </div>
                                    {quiz.myResult ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Completed</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{quiz.myResult.score}/{quiz.myResult.totalQuestions} Marks</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/student/classes/${classId}/quiz/${quiz._id}/take`)}
                                            className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/20"
                                        >
                                            Attempt Quiz
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg tracking-tight mb-2 truncate" title={quiz.title}>{quiz.title}</h4>
                                    <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4 line-clamp-2">{quiz.description || 'Module Knowledge Assessment.'}</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{quiz.duration} MIN</span>
                                        </div>
                                        {quiz.myResult && quiz.showResult && (
                                            <button 
                                                onClick={() => navigate(`/student/classes/${classId}/quiz/${quiz._id}/result`)}
                                                className="text-[8px] text-primary-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Analysis Report
                                            </button>
                                        )}
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

                {/* Submit Assignment Modal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: showSubmitModal ? 1 : 0, 
                        visibility: showSubmitModal ? 'visible' : 'hidden' 
                    }}
                    className={`fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl transition-all duration-300 ${showSubmitModal ? '' : 'pointer-events-none'}`}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={showSubmitModal ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl p-8 md:p-10 relative"
                    >
                        <button onClick={() => setShowSubmitModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Deploy Response</h2>
                            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">Task: {selectedAssignment?.title}</p>
                        </div>

                        <form onSubmit={handleSubmitAssignment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contextual Response</label>
                                <textarea
                                    className="input-field min-h-[140px] resize-none text-sm bg-black/40 border-white/5 focus:border-primary-500/50"
                                    placeholder="Enter your summary or feedback..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Payload (Optional)</label>
                                <input
                                    type="file"
                                    id="submit-file-assignment"
                                    className="hidden"
                                    onChange={(e) => setSubmitFile(e.target.files[0])}
                                />
                                <label 
                                    htmlFor="submit-file-assignment"
                                    className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary-500/30 transition-all cursor-pointer group"
                                >
                                    {submitFile ? (
                                        <span className="text-xs text-white font-black truncate">{submitFile.name}</span>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Deliverable</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                    "Finalize Deployment"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentClassDetails;
