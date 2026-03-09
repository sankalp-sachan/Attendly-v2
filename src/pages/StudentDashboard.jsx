import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, TrendingUp, AlertCircle, LogOut, Bell, Key, MessageCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [classCode, setClassCode] = useState('');
    const [message, setMessage] = useState('');

    // Correction Request State
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [selectedClassForCorrection, setSelectedClassForCorrection] = useState(null);
    const [correctionDate, setCorrectionDate] = useState(new Date().toISOString().split('T')[0]);
    const [correctionReason, setCorrectionReason] = useState('');

    useEffect(() => {
        fetchStudentClasses();
    }, []);

    const fetchStudentClasses = async () => {
        try {
            const { data } = await api.get('/college/student/classes');
            setEnrolledClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/college/student/join', { classCode });
            setMessage(data.message);
            setClassCode('');
            // Optional: set a timeout to clear message or close modal
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to join");
        }
    };

    const handleCorrectionRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/college/student/correction', {
                classId: selectedClassForCorrection._id,
                date: correctionDate,
                reason: correctionReason
            });
            setShowCorrectionModal(false);
            setCorrectionReason('');
            alert("Correction request submitted successfully");
        } catch (error) {
            alert("Failed to submit request");
        }
    };

    const openCorrectionModal = (cls) => {
        setSelectedClassForCorrection(cls);
        setCorrectionDate(new Date().toISOString().split('T')[0]);
        setShowCorrectionModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10 page-transition">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 transform -rotate-12">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Attendly</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Student Portal Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex-1 md:flex-none btn-primary px-8"
                        >
                            <Key className="w-5 h-5" />
                            <span>Join Class</span>
                        </button>
                        <button onClick={logout} className="p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none relative overflow-hidden group"
                    >
                        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Overall Attendance</h3>
                        <p className="text-5xl font-black tracking-tighter">
                            {enrolledClasses.length > 0 ? (enrolledClasses.reduce((acc, cls) => acc + parseFloat(cls.attendanceStats?.percentage || 0), 0) / enrolledClasses.length).toFixed(1) : 0}%
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white shadow-[0_0_10px_white]" style={{ width: `${enrolledClasses.length > 0 ? (enrolledClasses.reduce((acc, cls) => acc + parseFloat(cls.attendanceStats?.percentage || 0), 0) / enrolledClasses.length) : 0}%` }} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card dark:bg-slate-900 border-none relative overflow-hidden group shadow-xl"
                    >
                        <BookOpen className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Enrolled Classes</h3>
                        <p className="text-5xl font-black tracking-tighter dark:text-white">{enrolledClasses.length}</p>
                        <p className="mt-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">Active Learning</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card dark:bg-slate-900 border-none relative overflow-hidden group shadow-xl"
                    >
                        <AlertCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Low Attendance</h3>
                        <p className="text-5xl font-black tracking-tighter dark:text-white">
                            {enrolledClasses.filter(c => parseFloat(c.attendanceStats?.percentage) < c.targetPercentage).length}
                        </p>
                        <p className="mt-2 text-xs font-bold text-amber-500 uppercase tracking-widest">Action Required</p>
                    </motion.div>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black dark:text-white tracking-tighter">Active Courses</h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Your registered classes for the current semester</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                    <AnimatePresence>
                        {enrolledClasses.map((cls) => (
                            <motion.div
                                key={cls._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01 }}
                                className="card group flex flex-col md:flex-row gap-8 items-stretch"
                            >
                                <div className="md:w-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-4 border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-primary-500/5 group-hover:border-primary-500/20">
                                    <div className={`text-3xl font-black ${parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {cls.attendanceStats?.percentage}%
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Present</span>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3
                                                onClick={() => navigate(`/student/classes/${cls._id}`)}
                                                className="text-2xl font-black dark:text-white cursor-pointer hover:text-primary-600 transition-colors tracking-tight"
                                            >
                                                {cls.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-primary-600 bg-primary-100/50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md uppercase tracking-wider">{cls.subject}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code: {cls.classCode}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openCorrectionModal(cls)}
                                            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary-600 transition-all duration-300"
                                            title="Request Correction"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">
                                            <span>Progress</span>
                                            <span className={parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'text-red-500' : 'text-emerald-500'}>
                                                Target: {cls.targetPercentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4 border border-slate-200/10 dark:border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cls.attendanceStats?.percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full ring-2 ring-white/10 ${parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-400">Prof. <span className="text-slate-900 dark:text-slate-200">{cls.user?.name}</span></p>
                                            <div className="flex gap-2">
                                                {cls.CRs?.some(id => (id._id || id) === user?._id) && (
                                                    <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-widest border border-amber-200/50">CR</span>
                                                )}
                                                {cls.mentors?.some(id => (id._id || id) === user?._id) && (
                                                    <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-widest border border-indigo-200/50">Mentor</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {enrolledClasses.length === 0 && !loading && (
                        <div className="col-span-full py-32 text-center animate-pulse">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-slate-200/50 dark:border-white/5">
                                <BookOpen className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 tracking-tight">Ready to start tracking?</h3>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="mt-6 btn-primary px-10 mx-auto"
                            >
                                Join your first class now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Join Class Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-center border border-white/5"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-indigo-600" />
                            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-12 transition-transform hover:rotate-0 duration-500">
                                <Key className="w-10 h-10 text-primary-600" />
                            </div>
                            <h2 className="text-3xl font-black mb-3 dark:text-white tracking-tighter">Enter Code</h2>
                            <p className="text-slate-500 text-sm mb-10 font-medium">Join a classroom using the 6-digit access code.</p>

                            <form onSubmit={handleJoinClass} className="space-y-6">
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={classCode}
                                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                    placeholder="AB12CD"
                                    className="w-full text-center text-4xl font-black tracking-[0.4em] py-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-3xl focus:ring-4 focus:ring-primary-500/20 outline-none dark:text-white uppercase transition-all"
                                />
                                {message && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`text-xs font-black uppercase tracking-widest ${message.includes('sent') ? 'text-emerald-500' : 'text-red-500'}`}
                                    >
                                        {message}
                                    </motion.p>
                                )}
                                <button type="submit" className="w-full btn-primary py-5 rounded-3xl text-lg">
                                    Send Request
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowJoinModal(false); setMessage(''); }}
                                    className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest py-2 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    Go Back
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Correction Request Modal */}
            <AnimatePresence>
                {showCorrectionModal && selectedClassForCorrection && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/5"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black dark:text-white tracking-tighter">Correction</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Class: {selectedClassForCorrection.name}</p>
                                </div>
                                <button onClick={() => setShowCorrectionModal(false)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:bg-slate-100 transition-colors">
                                    <XCircle className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCorrectionRequest} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                                    <input
                                        type="date"
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                        value={correctionDate}
                                        onChange={(e) => setCorrectionDate(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for request</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={correctionReason}
                                        onChange={(e) => setCorrectionReason(e.target.value)}
                                        placeholder="Briefly explain why this correction is needed..."
                                        className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-3xl focus:ring-4 focus:ring-primary-500/20 outline-none dark:text-white resize-none font-medium text-sm transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full btn-primary py-5 rounded-3xl text-lg shadow-amber-500/20 shadow-xl"
                                >
                                    Submit Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
