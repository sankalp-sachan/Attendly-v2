import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Users, Calendar, CheckCircle, XCircle, ArrowRight,
    Share2, ClipboardList, LogOut, Shield, UserCheck, Bell, Clock, Save,
    MessageCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import { useNavigate } from 'react-router-dom';



const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Notification Center State
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [activeTab, setActiveTab] = useState('join'); // 'join' or 'corrections'
    const [correctionRequests, setCorrectionRequests] = useState([]);

    // Attendance Modal State
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedClassForAttendance, setSelectedClassForAttendance] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const [newClass, setNewClass] = useState({
        name: '',
        subject: '',
        semester: '',
        startDate: new Date().toISOString().split('T')[0],
        targetPercentage: 75
    });



    useEffect(() => {
        fetchClasses();
        fetchCorrectionRequests();
    }, []);

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/college/teacher/classes');
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes");
        } finally {
            setLoading(false);
        }
    };

    const fetchCorrectionRequests = async () => {
        try {
            const { data } = await api.get('/college/teacher/correction-requests');
            setCorrectionRequests(data);
        } catch (error) {
            console.error("Failed to fetch corrections");
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/college/teacher/classes', newClass);
            setShowCreateModal(false);
            setNewClass({ name: '', subject: '', semester: '', startDate: new Date().toISOString().split('T')[0], targetPercentage: 75 });
            fetchClasses();
        } catch (error) {
            alert("Failed to create class");
        }
    };

    const handleJoinAction = async (classId, studentId, action) => {
        try {
            await api.post('/college/teacher/join-request', { classId, studentId, action });
            fetchClasses();
        } catch (error) {
            alert("Action failed");
        }
    };

    const handleCorrectionAction = async (requestId, action) => {
        try {
            await api.post('/college/teacher/review-correction', { requestId, action });
            fetchCorrectionRequests(); // Refresh list
        } catch (error) {
            alert("Action failed");
        }
    };

    const openAttendanceModal = (cls) => {
        setSelectedClassForAttendance(cls);
        const initialRecords = {};
        cls.students?.forEach(s => {
            initialRecords[s._id] = 'Present';
        });
        setAttendanceRecords(initialRecords);
        setAttendanceDate(new Date().toISOString().split('T')[0]);
        setShowAttendanceModal(true);
    };

    const handleSaveAttendance = async () => {
        if (!selectedClassForAttendance) return;

        setIsSaving(true);
        const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
            student: studentId,
            status
        }));

        try {
            await api.post('/college/teacher/attendance', {
                classId: selectedClassForAttendance._id,
                date: attendanceDate,
                records
            });
            setShowAttendanceModal(false);
            fetchClasses();
        } catch (e) {
            alert(e.response?.data?.message || "Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStudentAttendance = (studentId) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const markAllHoliday = () => {
        const holidayRecords = {};
        selectedClassForAttendance?.students?.forEach(s => {
            holidayRecords[s._id] = 'Holiday';
        });
        setAttendanceRecords(holidayRecords);
    };

    const totalPendingJoinRequests = classes.reduce((acc, cls) => acc + (cls.pendingStudents?.length || 0), 0);
    const totalPendingCorrections = correctionRequests.length;
    const totalNotifications = totalPendingJoinRequests + totalPendingCorrections;

    return (
        <div className="min-h-screen relative bg-[#020617] p-4 md:p-8 lg:p-10 overflow-x-hidden font-sans">
            {/* Cinematic Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-primary-600/10 blur-[130px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-600/10 blur-[130px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 transform -rotate-12 translate-y-[-2px]">
                            <Shield className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-[-4px]">Attendly</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-slate-500 font-bold uppercase text-[8px] md:text-[9px] tracking-[0.2em] opacity-80">
                                    Prof. {user.name} • Faculty Panel
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowNotificationsModal(true)}
                            className="relative p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-white/5 text-slate-400 hover:text-primary-400 border border-white/5 transition-all group"
                        >
                            <Bell className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-slate-900 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary flex-1 sm:flex-none px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-base rounded-xl md:rounded-2xl uppercase font-black tracking-widest shadow-2xl shadow-primary-500/20"
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Launch Class</span>
                        </button>
                        <button onClick={logout} className="p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 border border-rose-500/20">
                            <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb:12 md:mb-16">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card bg-gradient-to-br from-indigo-600/90 to-violet-700/90 text-white border-none relative overflow-hidden group p-6 md:p-8 shadow-2xl shadow-indigo-500/10"
                    >
                        <ClipboardList className="absolute -right-4 -bottom-4 w-28 md:w-32 h-28 md:h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Academic Modules</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter">{classes.length}</p>
                        <p className="mt-4 text-[9px] font-black uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">Active Classrooms</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card bg-slate-900/40 border-white/5 relative overflow-hidden group p-6 md:p-8"
                    >
                        <Users className="absolute -right-4 -bottom-4 w-28 md:w-32 h-28 md:h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Student Synergy</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            {classes.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                        </p>
                        <p className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest opacity-80">Connected Learners</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => setShowNotificationsModal(true)}
                        className="card bg-slate-900/40 border-white/5 relative overflow-hidden group p-6 md:p-8 cursor-pointer hover:border-amber-500/30 transition-colors"
                    >
                        <UserCheck className="absolute -right-4 -bottom-4 w-28 md:w-32 h-28 md:h-32 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Attention Required</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">{totalNotifications}</p>
                            {totalNotifications > 0 && <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-80">Pending Verifications</p>
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Your Classrooms</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 uppercase tracking-wider opacity-60">Manage registers and academic footprints</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
                    <AnimatePresence>
                        {classes.map((cls) => (
                            <motion.div
                                key={cls._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="card group hover:shadow-2xl transition-all duration-500 bg-slate-900/40 border-white/5 p-6 md:p-8 relative overflow-hidden rounded-[2rem]"
                            >
                                <div className="absolute top-0 left-0 w-1 flex h-full bg-primary-600 transition-all duration-500 group-hover:w-2" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-1 opacity-80">{cls.subject}</p>
                                        <h3
                                            onClick={() => navigate(`/teacher/classes/${cls._id}`)}
                                            className="text-xl md:text-2xl font-black text-white cursor-pointer hover:text-primary-400 transition-colors tracking-tight leading-tight line-clamp-1"
                                        >
                                            {cls.name}
                                        </h3>
                                    </div>
                                    <div className="min-w-[48px] p-2 md:p-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">SEM</p>
                                        <p className="text-base md:text-lg font-black text-primary-400 leading-none mt-1">{cls.semester}</p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-4 rounded-3xl border border-white/5 mb-8 flex justify-between items-center group-hover:bg-primary-500/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Entry Code</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-black text-slate-300 tracking-[0.2em] text-sm md:text-base">{cls.classCode}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(cls.classCode);
                                                alert("Code copied to clipboard!");
                                            }}
                                            className="p-2 rounded-xl text-slate-500 hover:text-primary-400 hover:bg-white/5 transition-all"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openAttendanceModal(cls)}
                                        className="flex-1 btn-primary py-3.5 md:py-4 rounded-2xl text-[10px] md:text-xs flex items-center justify-center gap-2 uppercase font-black tracking-widest"
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        Log Attendance
                                    </button>
                                    <button
                                        onClick={() => navigate(`/teacher/classes/${cls._id}`)}
                                        className="p-3.5 md:p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-primary-400 transition-all border border-white/5 shadow-sm"
                                    >
                                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {classes.length === 0 && !loading && (
                        <div className="col-span-full py-24 md:py-32 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-20 md:w-24 h-20 md:h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5"
                            >
                                <Plus className="w-10 h-10 text-slate-600" />
                            </motion.div>
                            <h3 className="text-2xl md:text-3xl font-black text-white/40 tracking-tight">System Ready for Classes</h3>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-8 btn-primary px-10 py-4 mx-auto uppercase tracking-widest font-black"
                            >
                                Start Your Legacy
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Class Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/5"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 to-indigo-600" />
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black dark:text-white tracking-tighter">New Class</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Setup your course portal</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:bg-slate-100 transition-colors">
                                    <XCircle className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClass} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Name</label>
                                    <input type="text" required className="input-field" placeholder="e.g. B.Tech Computer Science" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                    <input type="text" required className="input-field" placeholder="e.g. Advanced Mathematics" value={newClass.subject} onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                        <input type="text" required className="input-field" placeholder="e.g. 5th" value={newClass.semester} onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target (%)</label>
                                        <input type="number" min="0" max="100" required className="input-field" value={newClass.targetPercentage} onChange={(e) => setNewClass({ ...newClass, targetPercentage: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-primary py-5 rounded-3xl text-lg shadow-xl shadow-primary-500/20 mt-4">
                                    Launch Class
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notifications Modal */}
            <AnimatePresence>
                {showNotificationsModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative border border-white/5 max-h-[85vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black dark:text-white tracking-tighter">Action Center</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Review pending requests</p>
                                </div>
                                <button onClick={() => setShowNotificationsModal(false)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:bg-slate-100 transition-colors">
                                    <XCircle className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex gap-8 border-b dark:border-white/5 mb-8">
                                <button
                                    onClick={() => setActiveTab('join')}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'join' ? 'text-primary-600' : 'text-slate-400'}`}
                                >
                                    Joins ({totalPendingJoinRequests})
                                    {activeTab === 'join' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('corrections')}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'corrections' ? 'text-primary-600' : 'text-slate-400'}`}
                                >
                                    Corrections ({totalPendingCorrections})
                                    {activeTab === 'corrections' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                                {activeTab === 'join' && (
                                    <>
                                        {classes.map(cls => (
                                            cls.pendingStudents?.length > 0 && (
                                                <div key={cls._id} className="space-y-4">
                                                    <h3 className="font-black text-primary-600 text-[9px] uppercase tracking-widest ml-1">{cls.name}</h3>
                                                    <div className="space-y-3">
                                                        {cls.pendingStudents.map(student => (
                                                            <div key={student._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-white/5">
                                                                <div>
                                                                    <p className="font-black dark:text-white tracking-tight">{student.name}</p>
                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{student.email.split('@')[0]}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleJoinAction(cls._id, student._id, 'approve')} className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-5 h-5" /></button>
                                                                    <button onClick={() => handleJoinAction(cls._id, student._id, 'reject')} className="p-3 bg-red-500/10 text-red-600 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                        {totalPendingJoinRequests === 0 && (
                                            <div className="text-center py-20 opacity-50">
                                                <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                <p className="text-xs font-black uppercase tracking-widest">Inbox Zero</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'corrections' && (
                                    <>
                                        {correctionRequests.map(req => (
                                            <div key={req._id} className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 bg-primary-500/10 px-2 py-1 rounded-md">{req.class?.name}</span>
                                                        <p className="font-black dark:text-white mt-2 text-lg tracking-tight">{req.student?.name}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-white/5">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">"{req.reason}"</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleCorrectionAction(req._id, 'approve')} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/20 transition-all">Approve</button>
                                                    <button onClick={() => handleCorrectionAction(req._id, 'reject')} className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                        {correctionRequests.length === 0 && (
                                            <div className="text-center py-20 opacity-50">
                                                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                <p className="text-xs font-black uppercase tracking-widest">No Requests</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Attendance Modal */}
            <AnimatePresence>
                {showAttendanceModal && selectedClassForAttendance && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative border border-white/5 max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black dark:text-white tracking-tighter">Attendance</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{selectedClassForAttendance.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={markAllHoliday} className="px-5 py-3 bg-amber-500/10 text-amber-600 font-black rounded-2xl text-[10px] hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest border border-amber-500/20">
                                        Holiday
                                    </button>
                                    <button onClick={() => setShowAttendanceModal(false)} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:bg-slate-100 transition-colors">
                                        <XCircle className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Date</label>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-primary-600" />
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        className="bg-transparent font-black text-slate-900 dark:text-white outline-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 mb-8 pr-2 scrollbar-none">
                                {selectedClassForAttendance.students?.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-dotted border-slate-300 dark:border-white/10">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Class is currently empty</p>
                                    </div>
                                ) : (
                                    selectedClassForAttendance.students?.map(student => (
                                        <div
                                            key={student._id}
                                            className={`flex items-center justify-between p-5 rounded-[2rem] transition-all border duration-500 group ${attendanceRecords[student._id] === 'Present'
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : attendanceRecords[student._id] === 'Absent'
                                                    ? 'bg-red-500/5 border-red-500/20'
                                                    : 'bg-amber-500/5 border-amber-500/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 group-hover:scale-110 ${attendanceRecords[student._id] === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : attendanceRecords[student._id] === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                        : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                    }`}>
                                                    {student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black dark:text-white tracking-tight text-lg">{student.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{student.rollNumber || student.email.split('@')[0]}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setAttendanceRecords(prev => ({ ...prev, [student._id]: 'Present' }))}
                                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${attendanceRecords[student._id] === 'Present' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600'}`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => setAttendanceRecords(prev => ({ ...prev, [student._id]: 'Absent' }))}
                                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${attendanceRecords[student._id] === 'Absent' ? 'bg-red-500 text-white shadow-xl shadow-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-600'}`}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-8 border-t dark:border-white/5">
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={selectedClassForAttendance.students?.length === 0 || isSaving}
                                    className="w-full btn-primary py-6 rounded-[2rem] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl shadow-primary-500/20 relative overflow-hidden"
                                >
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                                    <span className="text-lg font-black tracking-tight">{isSaving ? "Finalizing..." : "Submit Attendance"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherDashboard;
