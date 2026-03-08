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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Hub</h1>
                        <p className="text-slate-500 dark:text-slate-400">Track your progress and attendance</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex-1 md:flex-none btn-primary"
                        >
                            <Key className="w-5 h-5" />
                            <span>Join Class</span>
                        </button>
                        <button onClick={logout} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card p-6 bg-gradient-to-br from-primary-600 to-indigo-600 text-white border-none">
                        <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Overall Attendance</h3>
                        <p className="text-4xl font-black mt-2">
                            {enrolledClasses.length > 0 ? (enrolledClasses.reduce((acc, cls) => acc + parseFloat(cls.attendanceStats?.percentage || 0), 0) / enrolledClasses.length).toFixed(1) : 0}%
                        </p>
                    </div>
                    <div className="card p-6 border-none bg-emerald-500 text-white">
                        <BookOpen className="w-8 h-8 mb-4 opacity-50" />
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Enrolled Classes</h3>
                        <p className="text-4xl font-black mt-2">{enrolledClasses.length}</p>
                    </div>
                    <div className="card p-6 border-none bg-amber-500 text-white">
                        <AlertCircle className="w-8 h-8 mb-4 opacity-50" />
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Low Attendance Alerts</h3>
                        <p className="text-4xl font-black mt-2">
                            {enrolledClasses.filter(c => parseFloat(c.attendanceStats?.percentage) < c.targetPercentage).length}
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-black mb-6 dark:text-white">Active Classes</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {enrolledClasses.map((cls) => (
                            <motion.div
                                key={cls._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card p-6 flex flex-col md:flex-row gap-6 items-center"
                            >
                                <div className="w-24 h-24 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex flex-col items-center justify-center text-primary-600">
                                    <span className="text-2xl font-black">{cls.attendanceStats?.percentage}%</span>
                                    <span className="text-[10px] font-bold uppercase">Present</span>
                                </div>
                                <div className="flex-1 text-center md:text-left w-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3
                                                onClick={() => navigate(`/student/classes/${cls._id}`)}
                                                className="text-xl font-bold dark:text-white cursor-pointer hover:text-primary-600 transition-colors"
                                            >
                                                {cls.name}
                                            </h3>
                                            <p className="text-sm font-bold text-primary-600/80 uppercase tracking-widest">{cls.subject}</p>
                                            <div className="flex justify-between items-center mt-2 mb-2">
                                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500 font-bold text-xs">
                                                    {cls.classCode}
                                                </div>
                                                <div className="flex gap-2">
                                                    {cls.CRs?.some(id => (id._id || id) === user?._id) && (
                                                        <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">CR</span>
                                                    )}
                                                    {cls.mentors?.some(id => (id._id || id) === user?._id) && (
                                                        <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">Mentor</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-xs mt-1">Prof. {cls.user?.name}</p>
                                        </div>
                                        <button
                                            onClick={() => openCorrectionModal(cls)}
                                            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                                            title="Request Correction"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${cls.attendanceStats?.percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                                        <span>Target: {cls.targetPercentage}%</span>
                                        <span>{cls.attendanceStats?.present}/{cls.attendanceStats?.total} Classes</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {enrolledClasses.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center animate-pulse">
                            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No classes enrolled yet</h3>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="mt-4 text-primary-600 font-bold hover:underline"
                            >
                                Join your first class using a code
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Join Class Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Key className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 dark:text-white">Join Class</h2>
                        <p className="text-slate-500 text-sm mb-6">Enter the 6-character code provided by your teacher.</p>

                        <form onSubmit={handleJoinClass} className="space-y-4">
                            <input
                                type="text"
                                maxLength={6}
                                required
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                placeholder="E.G. AB12CD"
                                className="w-full text-center text-2xl font-black tracking-[0.5em] py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white uppercase"
                            />
                            {message && (
                                <p className={`text-sm font-bold ${message.includes('sent') ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {message}
                                </p>
                            )}
                            <button type="submit" className="w-full btn-primary py-4 rounded-2xl">
                                Send Join Request
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowJoinModal(false); setMessage(''); }}
                                className="w-full text-slate-500 font-bold text-sm py-2"
                            >
                                Close
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Correction Request Modal */}
            {showCorrectionModal && selectedClassForCorrection && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black dark:text-white">Request Correction</h2>
                            <button onClick={() => setShowCorrectionModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            Submit a request for attendance correction in <strong>{selectedClassForCorrection.name}</strong>.
                        </p>

                        <form onSubmit={handleCorrectionRequest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    value={correctionDate}
                                    onChange={(e) => setCorrectionDate(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reason</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={correctionReason}
                                    onChange={(e) => setCorrectionReason(e.target.value)}
                                    placeholder="e.g. I was present but marked absent due to..."
                                    className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary py-4 rounded-2xl mt-4"
                            >
                                Submit Request
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
