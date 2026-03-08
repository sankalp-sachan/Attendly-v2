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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Teacher Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Prof. {user.name} • {user.department?.name || 'Faculty'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setShowNotificationsModal(true)}
                            className="relative p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 hover:text-primary-600 shadow-sm border border-slate-200 dark:border-slate-800 transition-all"
                        >
                            <Bell className="w-6 h-6" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary flex-1 md:flex-none"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Class</span>
                        </button>
                        <button onClick={logout} className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card p-6 border-none bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/20">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg"><ClipboardList className="w-6 h-6" /></div>
                        </div>
                        <h3 className="text-4xl font-black">{classes.length}</h3>
                        <p className="opacity-80 font-bold uppercase text-xs tracking-widest mt-1">Active Classes</p>
                    </div>
                    <div className="card p-6 border-none bg-white dark:bg-slate-900 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Users className="w-6 h-6" /></div>
                        </div>
                        <h3 className="text-4xl font-black dark:text-white">
                            {classes.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                        </h3>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Total Students</p>
                    </div>
                    <div className="card p-6 border-none bg-white dark:bg-slate-900 shadow-xl cursor-pointer hover:ring-2 ring-primary-500 transition-all" onClick={() => setShowNotificationsModal(true)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><UserCheck className="w-6 h-6" /></div>
                            {totalNotifications > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ACTION NEEDED</span>}
                        </div>
                        <h3 className="text-4xl font-black dark:text-white">{totalNotifications}</h3>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Pending Actions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {classes.map((cls) => (
                            <motion.div
                                key={cls._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card group hover:shadow-2xl transition-all duration-300 border-t-4 border-t-primary-500 p-0 overflow-hidden"
                            >
                                <div className="p-6">
                                    <h3
                                        onClick={() => navigate(`/teacher/classes/${cls._id}`)}
                                        className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors"
                                    >
                                        {cls.name}
                                    </h3>
                                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">{cls.subject}</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Semester {cls.semester}</p>
                                    <div className="mt-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Code</span>
                                        <span className="font-mono font-black text-slate-700 dark:text-slate-300 tracking-wider">{cls.classCode}</span>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <button
                                            onClick={() => openAttendanceModal(cls)}
                                            className="flex-1 mr-2 py-2 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition"
                                        >
                                            Mark Attendance
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(cls.classCode);
                                                alert("Code copied!");
                                            }}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white transition"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Class Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl">
                        <h2 className="text-2xl font-black mb-6 dark:text-white">Create New Class</h2>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Class Name</label>
                                <input type="text" required className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" placeholder="e.g. B.Tech Computer Science" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                                <input type="text" required className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" placeholder="e.g. Advanced Mathematics" value={newClass.subject} onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Semester</label>
                                <input type="text" required className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" placeholder="e.g. 5th Semester" value={newClass.semester} onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Attendance (%)</label>
                                <input type="number" min="0" max="100" required className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" value={newClass.targetPercentage} onChange={(e) => setNewClass({ ...newClass, targetPercentage: e.target.value })} />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 btn-primary rounded-2xl">Create Class</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Notifications Modal (Join + Correction Requests) */}
            {showNotificationsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black dark:text-white">Action Center</h2>
                            <button onClick={() => setShowNotificationsModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><XCircle className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                            <button
                                onClick={() => setActiveTab('join')}
                                className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'join' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Join Requests ({totalPendingJoinRequests})
                            </button>
                            <button
                                onClick={() => setActiveTab('corrections')}
                                className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'corrections' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Corrections ({totalPendingCorrections})
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activeTab === 'join' && (
                                <>
                                    {classes.map(cls => (
                                        cls.pendingStudents?.length > 0 && (
                                            <div key={cls._id}>
                                                <h3 className="font-bold text-primary-600 mb-3 text-sm uppercase tracking-widest">{cls.name}</h3>
                                                <div className="space-y-3">
                                                    {cls.pendingStudents.map(student => (
                                                        <div key={student._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                                            <div>
                                                                <p className="font-bold dark:text-white">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.email}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleJoinAction(cls._id, student._id, 'approve')} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"><CheckCircle className="w-5 h-5" /></button>
                                                                <button onClick={() => handleJoinAction(cls._id, student._id, 'reject')} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"><XCircle className="w-5 h-5" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                    {totalPendingJoinRequests === 0 && <div className="text-center py-10"><p className="text-slate-500 font-medium">No pending join requests.</p></div>}
                                </>
                            )}

                            {activeTab === 'corrections' && (
                                <>
                                    {correctionRequests.map(req => (
                                        <div key={req._id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">{req.class?.name}</span>
                                                    <p className="font-bold dark:text-white mt-2">{req.student?.name}</p>
                                                </div>
                                                <span className="text-xs font-black text-slate-400">{new Date(req.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 italic mb-4">"{req.reason}"</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleCorrectionAction(req._id, 'approve')} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition">Approve</button>
                                                <button onClick={() => handleCorrectionAction(req._id, 'reject')} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                    {correctionRequests.length === 0 && <div className="text-center py-10"><p className="text-slate-500 font-medium">No pending correction requests.</p></div>}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Attendance Modal */}
            {showAttendanceModal && selectedClassForAttendance && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] p-8 shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black dark:text-white mb-1">Mark Attendance</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedClassForAttendance.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={markAllHoliday} className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 font-bold rounded-xl text-xs hover:bg-amber-200 transition-colors uppercase tracking-widest">
                                    Mark Holiday
                                </button>
                                <button onClick={() => setShowAttendanceModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <XCircle className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Date:</label>
                            <input
                                type="date"
                                value={attendanceDate}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="bg-transparent font-bold text-slate-900 dark:text-white outline-none text-right"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-6 pr-2">
                            {selectedClassForAttendance.students?.length === 0 ? (
                                <p className="text-center text-slate-500 py-10">No students enrolled in this class yet.</p>
                            ) : (
                                selectedClassForAttendance.students?.map(student => (
                                    <div
                                        key={student._id}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${attendanceRecords[student._id] === 'Present' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : attendanceRecords[student._id] === 'Absent' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${attendanceRecords[student._id] === 'Present' ? 'bg-emerald-100 text-emerald-600' : attendanceRecords[student._id] === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {student?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold dark:text-white">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setAttendanceRecords(prev => ({ ...prev, [student._id]: 'Present' }))}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${attendanceRecords[student._id] === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => setAttendanceRecords(prev => ({ ...prev, [student._id]: 'Absent' }))}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${attendanceRecords[student._id] === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                            >
                                                Absent
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleSaveAttendance}
                                disabled={selectedClassForAttendance.students?.length === 0 || isSaving}
                                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSaving ? "Saving..." : "Save Attendance record"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
