import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Calendar, ClipboardList, Settings,
    Share2, Plus, CheckCircle, XCircle, Clock, Save, BarChart2,
    Download, ShieldCheck, UserPlus, Star, AlertCircle, Search, Loader2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TeacherClassDetails = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const isTeacher = user?.role === 'teacher';
    const isMentor = user?.role === 'mentor';
    const isCR = user?.role === 'cr';
    const canMarkAttendance = isTeacher || isCR || isMentor;
    const canManageRoles = isTeacher;
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState({ studentStats: [], dailyAnalytics: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, students, history, analytics, reports
    const [studentSearch, setStudentSearch] = useState('');

    // Attendance Modal state (reused logic)
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Quick Stats Modal state
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsModalData, setStatsModalData] = useState({ title: '', type: '', students: [] });

    useEffect(() => {
        fetchClassDetails();
    }, [classId]);

    const fetchClassDetails = async () => {
        try {
            const { data } = await api.get(`/college/teacher/classes/${classId}`);
            setClassData(data.class);
            setHistory(data.history);

            // Fetch Analytics
            const { data: analyticsData } = await api.get(`/college/teacher/analytics/${classId}`);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Failed to fetch class details");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async (studentId, role, action = 'assign') => {
        try {
            const endpoint = `/college/teacher/${action}-${role}`;
            await api.post(endpoint, { classId, [role === 'cr' ? 'studentId' : 'mentorId']: studentId });
            alert(`${role.toUpperCase()} ${action === 'assign' ? 'assigned' : 'removed'} successfully!`);
            fetchClassDetails();
        } catch (error) {
            alert(`Failed to ${action} role`);
        }
    };

    const exportToExcel = () => {
        const data = analytics.studentStats.map(s => ({
            Name: s.name,
            Present: s.present,
            Total: s.total,
            Percentage: s.percentage + '%'
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `${classData.name}_Attendance.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Attendance Report: ${classData.name}`, 14, 15);
        doc.text(`Subject: ${classData.subject || 'N/A'}`, 14, 22);

        const tableData = analytics.studentStats.map(s => [s.name, s.present, s.total, s.percentage + '%']);
        doc.autoTable({
            head: [['Student Name', 'Present', 'Total Classes', 'Percentage']],
            body: tableData,
            startY: 30,
        });
        doc.save(`${classData.name}_Report.pdf`);
    };

    const openAttendanceModal = () => {
        const initialRecords = {};
        classData.students?.forEach(s => {
            initialRecords[s._id] = 'Present';
        });
        setAttendanceRecords(initialRecords);
        setAttendanceDate(new Date().toISOString().split('T')[0]);
        setShowAttendanceModal(true);
    };

    const toggleStudentAttendance = (studentId) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const markAllHoliday = () => {
        const holidayRecords = {};
        classData?.students?.forEach(s => {
            holidayRecords[s._id] = 'Holiday';
        });
        setAttendanceRecords(holidayRecords);
    };

    const handleSaveAttendance = async () => {
        setIsSaving(true);
        const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
            student: studentId,
            status
        }));

        try {
            await api.post('/college/teacher/attendance', {
                classId: classData._id,
                date: attendanceDate,
                records
            });
            setShowAttendanceModal(false);
            fetchClassDetails(); // Refresh history
        } catch (e) {
            alert(e.response?.data?.message || "Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!classData) return <div className="p-8 text-center">Class not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{classData?.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {classData?.semester} • <span className="font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">{classData?.classCode}</span>
                        </p>
                    </div>
                    {canMarkAttendance && (
                        <div className="flex gap-2">
                            <button
                                onClick={openAttendanceModal}
                                className="btn-primary"
                            >
                                <ClipboardList className="w-5 h-5" />
                                <span>Mark Attendance</span>
                            </button>
                        </div>
                    )}
                </header>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
                    {['overview', 'students', 'history', 'analytics', 'reports'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card p-6 bg-white dark:bg-slate-900 border-none shadow-xl">
                                <Users className="w-8 h-8 text-primary-500 mb-4" />
                                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Total Students</h3>
                                <p className="text-3xl font-black dark:text-white">{classData.students?.length || 0}</p>
                            </div>
                            <div className="card p-6 bg-white dark:bg-slate-900 border-none shadow-xl">
                                <Calendar className="w-8 h-8 text-emerald-500 mb-4" />
                                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Classes Conducted</h3>
                                <p className="text-3xl font-black dark:text-white">{history.length}</p>
                            </div>
                            <div className="card p-6 bg-white dark:bg-slate-900 border-none shadow-xl">
                                <CheckCircle className="w-8 h-8 text-indigo-500 mb-4" />
                                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Attendance Range</h3>
                                <p className="text-3xl font-black dark:text-white">
                                    {analytics.studentStats.length > 0
                                        ? `${Math.min(...analytics.studentStats.map(s => s.percentage))}% - ${Math.max(...analytics.studentStats.map(s => s.percentage))}%`
                                        : '0%'}
                                </p>
                            </div>
                            <div className="md:col-span-3 card p-6 bg-white dark:bg-slate-900 border-none shadow-xl">
                                <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                                    <BarChart2 className="w-6 h-6 text-primary-500" />
                                    Attendance Trend
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.dailyAnalytics}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={4} dot={{ r: 6, fill: '#2563EB' }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search student by name..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                />
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                {classData.students?.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">No students enrolled yet.</div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                                                {canManageRoles && <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {analytics.studentStats
                                                .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                                                .map(student => (
                                                    <tr key={student.studentId}>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold dark:text-white flex items-center gap-2">
                                                                {student.name}
                                                                {classData.CRs?.some(id => (id._id || id) === student.studentId) && <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">CR</span>}
                                                                {classData.mentors?.some(id => (id._id || id) === student.studentId) && <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">Mentor</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="w-full max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${student.percentage < 75 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                    style={{ width: `${student.percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-bold mt-1 block ${student.percentage < 75 ? 'text-red-500' : 'text-emerald-500'}`}>{student.percentage}%</span>
                                                        </td>
                                                        {canManageRoles && (
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    {classData.CRs?.some(id => (id._id || id) === student.studentId) ? (
                                                                        <button
                                                                            onClick={() => handleAssignRole(student.studentId, 'cr', 'remove')}
                                                                            title="Remove CR"
                                                                            className="p-2 rounded-xl bg-amber-500 text-white hover:bg-red-500 transition-colors shadow-lg shadow-amber-500/30 hover:shadow-red-500/30"
                                                                        >
                                                                            <Star className="w-4 h-4" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleAssignRole(student.studentId, 'cr', 'assign')}
                                                                            title="Assign CR"
                                                                            className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 hover:bg-amber-100 transition-colors"
                                                                        >
                                                                            <Star className="w-4 h-4" />
                                                                        </button>
                                                                    )}

                                                                    {classData.mentors?.some(id => (id._id || id) === student.studentId) ? (
                                                                        <button
                                                                            onClick={() => handleAssignRole(student.studentId, 'mentor', 'remove')}
                                                                            title="Remove Mentor"
                                                                            className="p-2 rounded-xl bg-indigo-500 text-white hover:bg-red-500 transition-colors shadow-lg shadow-indigo-500/30 hover:shadow-red-500/30"
                                                                        >
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleAssignRole(student.studentId, 'mentor', 'assign')}
                                                                            title="Assign Mentor"
                                                                            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                                        >
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-6">
                                <h3 className="text-xl font-bold mb-6 dark:text-white">Individual Performance</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.studentStats} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                                                {analytics.studentStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.percentage < 75 ? '#EF4444' : '#10B981'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-6">
                                <h3 className="text-xl font-bold mb-6 dark:text-white">Quick Stats</h3>
                                <div className="space-y-6">
                                    <div
                                        onClick={() => {
                                            setStatsModalData({ title: 'Critical (Below 75%)', type: 'critical', students: analytics.studentStats.filter(s => s.percentage < 75) });
                                            setShowStatsModal(true);
                                        }}
                                        className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800 cursor-pointer hover:ring-2 ring-red-500 transition-all"
                                    >
                                        <div className="flex items-center gap-3 text-red-600 mb-2">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-bold">Critical (Below 75%)</span>
                                        </div>
                                        <p className="text-3xl font-black text-red-600">{analytics.studentStats.filter(s => s.percentage < 75).length}</p>
                                        <p className="text-xs text-red-500 font-medium">Students need immediate attention.</p>
                                    </div>
                                    <div
                                        onClick={() => {
                                            setStatsModalData({ title: 'Good Standing', type: 'good', students: analytics.studentStats.filter(s => s.percentage >= 75) });
                                            setShowStatsModal(true);
                                        }}
                                        className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 cursor-pointer hover:ring-2 ring-emerald-500 transition-all"
                                    >
                                        <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-bold">Good Standing</span>
                                        </div>
                                        <p className="text-3xl font-black text-emerald-600">{analytics.studentStats.filter(s => s.percentage >= 75).length}</p>
                                        <p className="text-xs text-emerald-500 font-medium">Students with healthy attendance.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                    <ClipboardList className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white mb-2">Excel Export</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Download the complete attendance sheet in Microsoft Excel format (.xlsx).</p>
                                <button onClick={exportToExcel} className="w-full btn-secondary py-4 rounded-2xl flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download Excel
                                </button>
                            </div>
                            <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Download className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white mb-2">PDF Report</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Generate a professional PDF report with summaries and student list.</p>
                                <button onClick={exportToPDF} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">No attendance records found.</div>
                            ) : (
                                history.map(record => (
                                    <div key={record._id} className="card p-4 flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold dark:text-white">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                                <p className="text-xs text-slate-500">{record.records.filter(r => r.status === 'Present').length} Present • {record.records.length} Total</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Modal */}
            {showAttendanceModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] p-8 shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black dark:text-white mb-1">Mark Attendance</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{classData.name}</p>
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
                            {classData.students?.length === 0 ? (
                                <p className="text-center text-slate-500 py-10">No students enrolled in this class yet.</p>
                            ) : (
                                classData.students?.map(student => (
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
                                disabled={classData.students?.length === 0 || isSaving}
                                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSaving ? "Saving..." : "Save Attendance record"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Quick Stats Modal */}
            {showStatsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h2 className={`text-2xl font-black mb-1 ${statsModalData.type === 'critical' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {statsModalData.title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{statsModalData.students.length} Students</p>
                            </div>
                            <button onClick={() => setShowStatsModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
                            {statsModalData.students?.length === 0 ? (
                                <p className="text-center text-slate-500 py-10">No students in this category.</p>
                            ) : (
                                statsModalData.students.map(student => (
                                    <div key={student.studentId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="font-bold dark:text-white text-sm">{student.name}</p>
                                        <div className={`px-3 py-1 rounded-full text-xs font-black w-14 text-center ${statsModalData.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {student.percentage}%
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TeacherClassDetails;
