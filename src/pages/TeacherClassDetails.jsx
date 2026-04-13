import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, Search, Calendar, Filter, Users, ClipboardList, Info,
    ChevronDown, UserCheck, Shield, BookOpen, AlertCircle, Save,
    ArrowLeft, MoreVertical, Download, FileText, Share2, MoreHorizontal,
    Printer, Loader2, Trophy, Clock, Trash2, Edit2, History, TrendingUp, XCircle, CheckCircle,
    BarChart2, Star, ShieldCheck, Plus, Upload, FileIcon, Image, Paperclip, HelpCircle, Award, Briefcase
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
import ClassFeed from '../components/ClassFeed';

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
    const [activeTab, setActiveTab] = useState('overview'); // overview, students, history, analytics, reports, notes
    const [studentSearch, setStudentSearch] = useState('');
    const [notes, setNotes] = useState([]);
    const [showNoteUploadModal, setShowNoteUploadModal] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteDescription, setNoteDescription] = useState('');
    const [noteFile, setNoteFile] = useState(null);
    const [isUploadingNote, setIsUploadingNote] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [isFetchingQuizzes, setIsFetchingQuizzes] = useState(false);

    // AI Syllabus state
    const [syllabusText, setSyllabusText] = useState('');
    const [syllabusSummary, setSyllabusSummary] = useState('');
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);

    // Attendance Modal state (reused logic)
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Quick Stats Modal state
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsModalData, setStatsModalData] = useState({ title: '', type: '', students: [] });
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [isFetchingWeeklyReport, setIsFetchingWeeklyReport] = useState(false);
    const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);

    // Quiz Settings Modal state
    const [showQuizSettingsModal, setShowQuizSettingsModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    // Assignment state
    const [assignments, setAssignments] = useState([]);
    const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentDescription, setAssignmentDescription] = useState('');
    const [assignmentDueDate, setAssignmentDueDate] = useState('');
    const [assignmentFile, setAssignmentFile] = useState(null);
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [isFetchingSubmissions, setIsFetchingSubmissions] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSavingGrade, setIsSavingGrade] = useState(false);

    // Date filtering states
    const [historyFilterDate, setHistoryFilterDate] = useState('');
    const [reportStartDate, setReportStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
    const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isDownloadingDaily, setIsDownloadingDaily] = useState(false);

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

            // Fetch Notes
            fetchNotes();
            // Fetch Quizzes
            fetchQuizzes();
            // Fetch Assignments
            fetchAssignments();
        } catch (error) {
            console.error("Failed to fetch class details");
        } finally {
            setLoading(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const { data } = await api.get(`/notes/${classId}`);
            setNotes(data);
        } catch (error) {
            console.error("Failed to fetch notes");
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

    const fetchSubmissions = async (assignmentId) => {
        setIsFetchingSubmissions(true);
        try {
            const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to fetch submissions");
        } finally {
            setIsFetchingSubmissions(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setIsCreatingAssignment(true);
        try {
            const formData = new FormData();
            formData.append('title', assignmentTitle);
            formData.append('description', assignmentDescription);
            formData.append('dueDate', assignmentDueDate);
            formData.append('classId', classId);
            if (assignmentFile) formData.append('file', assignmentFile);

            await api.post('/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setShowAssignmentModal(false);
            setAssignmentTitle('');
            setAssignmentDescription('');
            setAssignmentDueDate('');
            setAssignmentFile(null);
            fetchAssignments();
        } catch (error) {
            alert("Failed to create assignment");
        } finally {
            setIsCreatingAssignment(false);
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        setIsSavingGrade(true);
        try {
            await api.patch(`/assignments/submissions/${gradingSubmission._id}/grade`, {
                grade,
                feedback
            });
            setGradingSubmission(null);
            setGrade('');
            setFeedback('');
            fetchSubmissions(selectedAssignment._id);
        } catch (error) {
            alert("Failed to save grade");
        } finally {
            setIsSavingGrade(false);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assignment? All submissions will be lost.")) return;
        try {
            await api.delete(`/assignments/${id}`);
            fetchAssignments();
        } catch (error) {
            alert("Failed to delete assignment");
        }
    };

    const fetchQuizzes = async () => {
        setIsFetchingQuizzes(true);
        try {
            const { data } = await api.get(`/quizzes/class/${classId}`);
            setQuizzes(data);
        } catch (error) {
            console.error("Failed to fetch quizzes");
        } finally {
            setIsFetchingQuizzes(false);
        }
    };

    const fetchWeeklyReport = async () => {
        setIsFetchingWeeklyReport(true);
        try {
            const { data } = await api.get(`/college/teacher/weekly-report/${classId}`);
            setWeeklyReport(data);
        } catch (error) {
            console.error("Failed to fetch weekly report");
        } finally {
            setIsFetchingWeeklyReport(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'weekly') {
            fetchWeeklyReport();
        }
    }, [activeTab]);

    const handleNoteUpload = async (e) => {
        e.preventDefault();
        if (!noteFile || !noteTitle) return alert("Title and file are required");

        setIsUploadingNote(true);
        const formData = new FormData();
        formData.append('note', noteFile);
        formData.append('title', noteTitle);
        formData.append('description', noteDescription);
        formData.append('classId', classId);

        try {
            await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNoteTitle('');
            setNoteDescription('');
            setNoteFile(null);
            setShowNoteUploadModal(false);
            fetchNotes();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to upload note");
        } finally {
            setIsUploadingNote(false);
        }
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.delete(`/notes/${id}`);
            fetchNotes();
        } catch (error) {
            alert("Failed to delete note");
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
            RollNo: s.rollNo || 'N/A',
            Name: s.name,
            Present: s.present,
            Total: s.total,
            Percentage: s.percentage + '%'
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Report_${classData.name}_${new Date().toLocaleDateString()}.xlsx`);
    };

    const handleExportDailyExcel = async (date) => {
        if (!date) return;
        setIsDownloadingDaily(true);
        try {
            const response = await api.get(`/college/teacher/attendance/export-daily/${classId}/${date}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_${classData.name}_${date}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert(error.response?.data?.message || "Export failed. Please ensure records exist for this date.");
        } finally {
            setIsDownloadingDaily(false);
        }
    };

    const handleExportRangeExcel = async () => {
        if (!reportStartDate || !reportEndDate) return;
        setIsDownloadingDaily(true);
        try {
            const response = await api.get(`/college/teacher/attendance/export-range/${classId}`, {
                params: { startDate: reportStartDate, endDate: reportEndDate },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_Range_${classData.name}_${reportStartDate}_to_${reportEndDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Export failed. Please ensure records exist for this range.");
        } finally {
            setIsDownloadingDaily(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Attendance Report: ${classData.name} `, 14, 15);
        doc.text(`Subject: ${classData.subject || 'N/A'} `, 14, 22);

        const tableData = analytics.studentStats.map(s => [s.rollNo || 'N/A', s.name, s.present, s.total, s.percentage + '%']);
        doc.autoTable({
            head: [['Roll No', 'Student Name', 'Present', 'Total Classes', 'Percentage']],
            body: tableData,
            startY: 30,
        });
        doc.save(`${classData.name}_Report.pdf`);
    };

    const openAttendanceModal = () => {
        const initialRecords = {};
        classData.students?.forEach(s => {
            initialRecords[s._id] = ''; // Default to unmarked
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

    const handleSummarizeSyllabus = async (mode = 'summary') => {
        if (!syllabusText.trim()) return;
        try {
            setLoadingSyllabus(true);
            const { data } = await api.post(`/college/teacher/classes/${classId}/syllabus-summary`, {
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

    const handleUpdateQuizSettings = async (quizId, settings) => {
        setIsUpdatingSettings(true);
        try {
            await api.patch(`/quizzes/${quizId}/settings`, settings);
            fetchQuizzes(); // Refresh quiz list
            setShowQuizSettingsModal(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update quiz settings");
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!classData) return <div className="p-8 text-center">Class not found</div>;

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

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={() => navigate('/teacher')}
                            className="p-3.5 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl"
                        >
                            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
                                    {classData?.name}
                                </h1>
                                <div className="h-6 w-[2px] bg-slate-800 hidden sm:block" />
                                <span className="font-mono bg-primary-600/10 text-primary-400 border border-primary-500/20 px-3 py-1 rounded-lg text-[10px] md:text-xs font-black tracking-widest uppercase">
                                    {classData?.classCode}
                                </span>
                            </div>
                            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] opacity-80">
                                {classData?.semester} Registry • Faculty Management Node
                            </p>
                        </div>
                    </div>

                    {canMarkAttendance && (
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={openAttendanceModal}
                                className="btn-primary flex-1 sm:flex-none px-8 py-4 rounded-2xl text-[10px] md:text-xs uppercase font-black tracking-widest shadow-2xl shadow-primary-500/20"
                            >
                                <ClipboardList className="w-5 h-5" />
                                <span>Mark Attendance</span>
                            </button>
                        </div>
                    )}
                </header>

                {/* Responsive Tab Navigation (Hamburger Style) */}
                <div className="relative mb-12 flex justify-center">
                    <button
                        onClick={() => setIsTabMenuOpen(!isTabMenuOpen)}
                        className="flex items-center gap-4 px-8 py-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl hover:bg-slate-800 transition-all group"
                    >
                        <div className="flex flex-col gap-1">
                            <motion.div 
                                animate={isTabMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-primary-400 rounded-full" 
                            />
                            <motion.div 
                                animate={isTabMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-6 h-0.5 bg-primary-400 rounded-full" 
                            />
                            <motion.div 
                                animate={isTabMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-primary-400 rounded-full" 
                            />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none mb-1">Navigation Menu</p>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                                {activeTab === 'weekly' ? 'Weekly Report' : activeTab}
                            </h3>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-500 ${isTabMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isTabMenuOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsTabMenuOpen(false)}
                                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    className="absolute top-full mt-4 z-50 w-full max-w-2xl bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {['overview', 'weekly', 'feed', 'students', 'history', 'analytics', 'reports', 'notes', 'quizzes', 'assignments'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTab(tab);
                                                    setIsTabMenuOpen(false);
                                                }}
                                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all ${activeTab === tab
                                                    ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {tab === 'overview' && <BarChart2 className="w-6 h-6" />}
                                                {tab === 'weekly' && <Calendar className="w-6 h-6" />}
                                                {tab === 'feed' && <Share2 className="w-6 h-6" />}
                                                {tab === 'students' && <Users className="w-6 h-6" />}
                                                {tab === 'history' && <History className="w-6 h-6" />}
                                                {tab === 'analytics' && <TrendingUp className="w-6 h-6" />}
                                                {tab === 'reports' && <Download className="w-6 h-6" />}
                                                {tab === 'notes' && <FileText className="w-6 h-6" />}
                                                {tab === 'quizzes' && <HelpCircle className="w-6 h-6" />}
                                                {tab === 'assignments' && <Briefcase className="w-6 h-6" />}
                                                
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {tab === 'weekly' ? 'Weekly' : tab}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'feed' && (
                        <ClassFeed classId={classId} />
                    )}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl"
                            >
                                <Users className="w-10 h-10 text-primary-400 mb-6 opacity-80" />
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Total Managed Learners</h3>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">{classData.students?.length || 0}</p>
                                <p className="mt-2 text-[10px] font-bold text-primary-400 uppercase tracking-widest opacity-80">Enrolled Registry</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl"
                            >
                                <Calendar className="w-10 h-10 text-emerald-400 mb-6 opacity-80" />
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Academic Checkpoints</h3>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">{history.length}</p>
                                <p className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">Sessions Logged</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="card p-8 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl"
                            >
                                <CheckCircle className="w-10 h-10 text-indigo-400 mb-6 opacity-80" />
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Performance Spectrum</h3>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                    {analytics.studentStats.length > 0
                                        ? `${Math.min(...analytics.studentStats.map(s => s.percentage))}% - ${Math.max(...analytics.studentStats.map(s => s.percentage))}% `
                                        : '0%'}
                                </p>
                                <p className="mt-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-80">Engagement Range</p>
                            </motion.div>

                            <div className="md:col-span-3 card p-8 md:p-10 bg-slate-900/40 border-white/5 shadow-2xl relative overflow-hidden">
                                <h3 className="text-xl md:text-2xl font-black mb-8 text-white tracking-tighter flex items-center gap-3">
                                    <BarChart2 className="w-6 h-6 text-primary-400" />
                                    Attendance Momentum
                                </h3>
                                <div className="h-[350px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.dailyAnalytics}>
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#475569"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                                tickFormatter={(str) => {
                                                    const date = new Date(str);
                                                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                }}
                                            />
                                            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} unit="%" dx={-10} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                                    color: '#fff'
                                                }}
                                                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="attendance"
                                                stroke="url(#lineGradient)"
                                                strokeWidth={5}
                                                dot={{ r: 4, fill: '#020617', stroke: '#3b82f6', strokeWidth: 2 }}
                                                activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="md:col-span-3 mt-4 card p-6 md:p-8 bg-slate-900/40 border-white/5 relative overflow-hidden flex flex-col gap-4 shadow-2xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400 border border-violet-500/20">
                                        <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">AI Syllabus Intelligence</h3>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Paste your syllabus to instantly extract key modules and objectives</p>
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
                                        <div className="flex-1 bg-violet-500/5 border border-violet-500/20 rounded-[1.5rem] p-6 relative overflow-y-auto max-h-[220px] custom-scrollbar shadow-inner">
                                            <span className="absolute -top-3 left-6 px-3 py-1 bg-[#020617] border border-violet-500/30 text-[8px] font-black uppercase text-violet-400 rounded-lg tracking-[0.2em] shadow-lg">Groq Insight</span>
                                            <div className="text-sm text-violet-200/90 leading-relaxed whitespace-pre-wrap mt-2 font-medium">
                                                {syllabusSummary}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="space-y-8">
                            <div className="relative group max-w-2xl">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Scan principal identities..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="input-field pl-14 bg-slate-900/50"
                                />
                            </div>
                            <div className="bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl overflow-x-auto scrollbar-none">
                                {classData.students?.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <Users className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                        <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No learners synchronized</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead className="bg-black/20">
                                            <tr>
                                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Principal Identity</th>
                                                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Engagement Level</th>
                                                {canManageRoles && <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Administrative Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {analytics.studentStats
                                                .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                                                .map(student => (
                                                    <tr key={student.studentId} className="hover:bg-primary-500/[0.03] transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 font-black border border-white/5 group-hover:text-primary-400 transition-colors uppercase">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-white text-base tracking-tight flex items-center gap-3">
                                                                        {student.rollNo && student.rollNo !== 'N/A' ? student.rollNo : student.name}
                                                                        <div className="flex gap-1.5">
                                                                            {classData.CRs?.some(id => (id._id || id) === student.studentId) && (
                                                                                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest">CR (REP)</span>
                                                                            )}
                                                                            {classData.mentors?.some(id => (id._id || id) === student.studentId) && (
                                                                                <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest">Mentor</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {student.rollNo && student.rollNo !== 'N/A' && (
                                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 truncate max-w-xs lowercase first-letter:uppercase">
                                                                            {student.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${student.percentage}%` }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        className={`h-full rounded-full ${student.percentage < 75 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                                                    />
                                                                </div>
                                                                <span className={`text-xs font-black tracking-tighter ${student.percentage < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{student.percentage}%</span>
                                                            </div>
                                                        </td>
                                                        {canManageRoles && (
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleAssignRole(student.studentId, 'cr', classData.CRs?.some(id => (id._id || id) === student.studentId) ? 'remove' : 'assign')}
                                                                        title={classData.CRs?.some(id => (id._id || id) === student.studentId) ? "Revoke CR" : "Promote to CR"}
                                                                        className={`p-2.5 rounded-xl transition-all border ${classData.CRs?.some(id => (id._id || id) === student.studentId)
                                                                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                                                            : 'bg-white/5 text-slate-500 border-white/10 hover:text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/20'
                                                                            }`}
                                                                    >
                                                                        <Star className={`w-4 h-4 ${classData.CRs?.some(id => (id._id || id) === student.studentId) ? 'fill-amber-500' : ''}`} />
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleAssignRole(student.studentId, 'mentor', classData.mentors?.some(id => (id._id || id) === student.studentId) ? 'remove' : 'assign')}
                                                                        title={classData.mentors?.some(id => (id._id || id) === student.studentId) ? "Revoke Mentor" : "Promote to Mentor"}
                                                                        className={`p-2.5 rounded-xl transition-all border ${classData.mentors?.some(id => (id._id || id) === student.studentId)
                                                                            ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                                                                            : 'bg-white/5 text-slate-500 border-white/10 hover:text-primary-400 hover:bg-primary-400/10 hover:border-primary-400/20'
                                                                            }`}
                                                                    >
                                                                        <ShieldCheck className="w-4 h-4" />
                                                                    </button>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card bg-slate-900/40 border-white/5 shadow-2xl p-8"
                            >
                                <h3 className="text-xl font-black mb-8 text-white tracking-tighter flex items-center gap-3">
                                    <BarChart2 className="w-5 h-5 text-primary-400" />
                                    Identity Performance Index
                                </h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.studentStats} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={16}>
                                                {analytics.studentStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.percentage < 75 ? '#f43f5e' : '#10b981'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            <div className="space-y-6">
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    onClick={() => {
                                        setStatsModalData({ title: 'Critical Personnel', type: 'critical', students: analytics.studentStats.filter(s => s.percentage < 75) });
                                        setShowStatsModal(true);
                                    }}
                                    className="p-6 bg-rose-500/5 hover:bg-rose-500/10 rounded-[2rem] border border-rose-500/20 cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10 group-hover:scale-110 transition-transform">
                                            <AlertCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-rose-400 uppercase tracking-widest text-xs mb-1">Status: Critical</h4>
                                            <p className="text-3xl font-black text-white px-1 tracking-tighter">{analytics.studentStats.filter(s => s.percentage < 75).length}</p>
                                        </div>
                                    </div>
                                    <Plus className="w-6 h-6 text-rose-500/40 group-hover:text-rose-500 transition-colors" />
                                </motion.div>

                                <motion.div
                                    whileHover={{ x: 10 }}
                                    onClick={() => {
                                        setStatsModalData({ title: 'Elite Performance', type: 'good', students: analytics.studentStats.filter(s => s.percentage >= 75) });
                                        setShowStatsModal(true);
                                    }}
                                    className="p-6 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                                            <CheckCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-emerald-400 uppercase tracking-widest text-xs mb-1">Status: Stable</h4>
                                            <p className="text-3xl font-black text-white px-1 tracking-tighter">{analytics.studentStats.filter(s => s.percentage >= 75).length}</p>
                                        </div>
                                    </div>
                                    <Plus className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                </motion.div>

                                <div className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl">
                                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.25em] mb-4">Class Intelligence</h3>
                                    <div className="flex items-center gap-4 py-2 border-b border-white/5">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                        <span className="text-xs text-slate-400 font-bold">Average Engagement: <span className="text-white">{(analytics.studentStats.reduce((a, b) => a + parseFloat(b.percentage || 0), 0) / (analytics.studentStats.length || 1)).toFixed(1)}%</span></span>
                                    </div>
                                    <div className="flex items-center gap-4 py-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                                        <span className="text-xs text-slate-400 font-bold">Predicted Trend: <span className="text-white">Upward (Active)</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'weekly' && (
                        <div className="space-y-8">
                            {isFetchingWeeklyReport ? (
                                <div className="p-20 text-center">
                                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Aggregating Weekly Intelligence...</p>
                                </div>
                            ) : !weeklyReport ? (
                                <div className="p-20 text-center">
                                    <AlertCircle className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No weekly data available</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl">
                                            <Calendar className="w-10 h-10 text-primary-400 mb-6" />
                                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Week Starting</h3>
                                            <p className="text-2xl font-black text-white">{new Date(weeklyReport.weekStarting).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl">
                                            <History className="w-10 h-10 text-emerald-400 mb-6" />
                                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Sessions This Week</h3>
                                            <p className="text-4xl font-black text-white">{weeklyReport.totalSessions}</p>
                                        </div>
                                        <div className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl">
                                            <Users className="w-10 h-10 text-rose-400 mb-6" />
                                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Most Absent</h3>
                                            <p className="text-4xl font-black text-white">{weeklyReport.mostAbsent.length}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Most Absent List */}
                                        <div className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl">
                                            <h3 className="text-xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                                <XCircle className="w-6 h-6 text-rose-500" />
                                                High Absence Registry (This Week)
                                            </h3>
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {weeklyReport.mostAbsent.map((student, idx) => (
                                                    <div key={student.studentId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-black text-sm">{student.name}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{student.rollNo}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-rose-400 font-black text-lg">{student.absent}</p>
                                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Missed</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {weeklyReport.mostAbsent.length === 0 && (
                                                    <p className="text-center text-slate-500 font-black uppercase tracking-widest py-10">All students present this week!</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Weekly Performance Overview */}
                                        <div className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl">
                                            <h3 className="text-xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                                                Weekly Enrollment Performance
                                            </h3>
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                {weeklyReport.weeklyStats
                                                    .sort((a,b) => b.percentage - a.percentage)
                                                    .map(student => (
                                                    <div key={student.studentId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                                        <div>
                                                            <p className="text-white font-black text-sm">{student.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${student.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${student.percentage}%` }}></div>
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-400 font-mono">{student.percentage}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4 items-center">
                                                            <div className="text-center">
                                                                <p className="text-emerald-400 font-black text-sm">{student.present}</p>
                                                                <p className="text-[8px] text-slate-500 font-bold uppercase">Pres</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-rose-400 font-black text-sm">{student.absent}</p>
                                                                <p className="text-[8px] text-slate-500 font-bold uppercase">Abs</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="card bg-slate-900/40 border-white/5 shadow-2xl p-10 flex flex-col items-center text-center group"
                            >
                                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                                    <ClipboardList className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Structured Dataset</h3>
                                <p className="text-slate-500 mb-8 font-bold text-sm leading-relaxed max-w-xs">Deploy the complete attendance architecture in Microsoft Excel compliant format.</p>
                                <button onClick={exportToExcel} className="w-full btn-secondary py-4 rounded-2xl flex items-center justify-center gap-3 group/btn">
                                    <Download className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Download .XLSX</span>
                                </button>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -8 }}
                                className="card bg-slate-900/40 border-white/5 shadow-2xl p-10 flex flex-col items-center text-center group"
                            >
                                <div className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-[2rem] flex items-center justify-center mb-8 border border-primary-500/10 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Custom Range Registry</h3>
                                <p className="text-slate-500 mb-6 font-bold text-sm leading-relaxed max-w-xs">Extract students data for a selected chronological range in Excel format.</p>
                                <div className="w-full space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Start Date</label>
                                            <input 
                                                type="date"
                                                value={reportStartDate}
                                                max={reportEndDate}
                                                onChange={(e) => setReportStartDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-black text-[10px] outline-none focus:border-primary-500/50 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">End Date</label>
                                            <input 
                                                type="date"
                                                value={reportEndDate}
                                                min={reportStartDate}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setReportEndDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-black text-[10px] outline-none focus:border-primary-500/50 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleExportRangeExcel}
                                        disabled={isDownloadingDaily || !reportStartDate || !reportEndDate}
                                        className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 group/btn disabled:opacity-50"
                                    >
                                        {isDownloadingDaily ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" />}
                                        <span className="text-[10px] uppercase font-black tracking-widest">Export Range</span>
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -8 }}
                                className="card bg-slate-900/40 border-white/5 shadow-2xl p-10 flex flex-col items-center text-center group"
                            >
                                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 border border-rose-500/10 group-hover:scale-110 transition-transform">
                                    <Download className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Executive Dossier</h3>
                                <p className="text-slate-500 mb-8 font-bold text-sm leading-relaxed max-w-xs">Generate a professional, print-ready PDF audit containing visual insights and list.</p>
                                <button onClick={exportToPDF} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors group/btn shadow-xl shadow-rose-600/20">
                                    <Download className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" />
                                    <span className="text-[10px] uppercase font-black tracking-widest">Export PDF Archive</span>
                                </button>
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 shadow-2xl">
                                <h3 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3 w-full sm:w-auto">
                                    <History className="w-6 h-6 text-emerald-400" />
                                    Chronological Audit Log
                                </h3>
                                <div className="relative w-full sm:w-64 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
                                    <input 
                                        type="date"
                                        value={historyFilterDate}
                                        onChange={(e) => setHistoryFilterDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-white font-black text-xs outline-none focus:border-primary-500/50 transition-all cursor-pointer"
                                    />
                                    {historyFilterDate && (
                                        <button 
                                            onClick={() => setHistoryFilterDate('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {history.filter(record => !historyFilterDate || record.date.includes(historyFilterDate)).length === 0 ? (
                                <div className="p-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5 border-dashed">
                                    <Clock className="w-16 h-16 text-slate-800 mx-auto mb-4 opacity-40" />
                                    <p className="text-slate-600 font-black uppercase tracking-[0.25em] text-sm">Chronological void - No matching records found</p>
                                </div>
                            ) : (
                                <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                                    <div className="divide-y divide-white/5">
                                        {history.filter(record => !historyFilterDate || record.date.includes(historyFilterDate)).map(record => (
                                            <motion.div
                                                key={record._id}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                                className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-colors group"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
                                                        <CheckCircle className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white text-lg tracking-tight mb-1">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] flex items-center gap-3">
                                                            <span className="text-emerald-400/80">{record.records.filter(r => r.status === 'Present').length} Present Identities</span>
                                                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                            <span>{record.records.length} Total Population</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedLog(record);
                                                        setShowLogModal(true);
                                                    }}
                                                    className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all w-full sm:w-auto text-center"
                                                >
                                                    Review Log
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                    <FileIcon className="w-6 h-6 text-primary-400" />
                                    Shared Academic Assets
                                </h3>
                                <button
                                    onClick={() => setShowNoteUploadModal(true)}
                                    className="btn-primary px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload New Asset</span>
                                </button>
                            </div>

                            {notes.length === 0 ? (
                                <div className="p-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5">
                                    <Paperclip className="w-16 h-16 text-slate-800 mx-auto mb-4 opacity-40" />
                                    <p className="text-slate-600 font-black uppercase tracking-[0.25em] text-sm">No assets deployed to this registry yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                    {note.fileType === 'image' ? <Image className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                                                </div>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={`${api.defaults.baseURL.replace('/api', '')}${note.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                    {(isTeacher || note.teacher._id === user?._id) && (
                                                        <button
                                                            onClick={() => handleDeleteNote(note._id)}
                                                            className="p-2 rounded-lg bg-white/5 text-rose-500 hover:bg-rose-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-lg tracking-tight mb-2 truncate" title={note.title}>{note.title}</h4>
                                                <p className="text-slate-500 text-xs font-bold leading-relaxed mb-4 line-clamp-2">{note.description || 'No description provided.'}</p>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-slate-400 font-black">
                                                            {note.teacher?.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{note.teacher?.name}</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-600 font-bold uppercase">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'quizzes' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                    <HelpCircle className="w-6 h-6 text-primary-400" />
                                    Evaluation Matrix
                                </h3>
                                <button
                                    onClick={() => navigate(`/teacher/classes/${classId}/quiz/create`)}
                                    className="btn-primary px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Forge New Quiz</span>
                                </button>
                            </div>

                            {quizzes.length === 0 ? (
                                <div className="p-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5">
                                    <Award className="w-16 h-16 text-slate-800 mx-auto mb-4 opacity-40" />
                                    <p className="text-slate-600 font-black uppercase tracking-[0.25em] text-sm">No quizzes deployed to this registry</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {quizzes.map((quiz) => (
                                        <motion.div
                                            key={quiz._id}
                                            whileHover={{ y: -5 }}
                                            className="card p-6 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500">
                                                    <HelpCircle className="w-8 h-8" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/teacher/classes/${classId}/quiz/${quiz._id}/results`)}
                                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                                                        title="View Results"
                                                    >
                                                        <BarChart2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuiz(quiz);
                                                            setShowQuizSettingsModal(true);
                                                        }}
                                                        className="p-2 rounded-lg bg-white/5 text-indigo-400 hover:bg-indigo-400/10 transition-colors"
                                                        title="Control Settings"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const response = await api.get(`/quizzes/${quiz._id}/export`, { responseType: 'blob' });
                                                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.setAttribute('download', `Quiz_Results_${quiz.title}.xlsx`);
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                            } catch (error) {
                                                                alert("Export failed");
                                                            }
                                                        }}
                                                        className="p-2 rounded-lg bg-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                                        title="Export Excel"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-lg tracking-tight mb-2 truncate" title={quiz.title}>{quiz.title}</h4>
                                                <p className="text-slate-500 text-xs font-bold leading-relaxed mb-4 line-clamp-2">{quiz.description || 'Knowledge evaluation module.'}</p>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-slate-500" />
                                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{quiz.duration} MIN</span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-600 font-bold uppercase">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                    <Briefcase className="w-6 h-6 text-primary-400" />
                                    Project Deployments
                                </h3>
                                <button
                                    onClick={() => setShowAssignmentModal(true)}
                                    className="btn-primary px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Deploy Task</span>
                                </button>
                            </div>

                            {assignments.length === 0 ? (
                                <div className="p-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-white/5">
                                    <BookOpen className="w-16 h-16 text-slate-800 mx-auto mb-4 opacity-40" />
                                    <p className="text-slate-600 font-black uppercase tracking-[0.25em] text-sm">No tasks assigned to this registry</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assignments.map((assignment) => (
                                        <motion.div
                                            key={assignment._id}
                                            whileHover={{ y: -5 }}
                                            className="card p-6 bg-slate-900/40 border-white/5 relative overflow-hidden group shadow-2xl flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500">
                                                    <Briefcase className="w-8 h-8" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAssignment(assignment);
                                                            fetchSubmissions(assignment._id);
                                                            setShowSubmissionsModal(true);
                                                        }}
                                                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                                                        title="View Submissions"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                                        className="p-2 rounded-lg bg-white/5 text-rose-500 hover:bg-rose-500/10 transition-colors"
                                                        title="Delete Assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-lg tracking-tight mb-2 truncate" title={assignment.title}>{assignment.title}</h4>
                                                <p className="text-slate-500 text-xs font-bold leading-relaxed mb-4 line-clamp-2">{assignment.description || 'Deliverable evaluation module.'}</p>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-rose-400" />
                                                        <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest">
                                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {assignment.fileUrl && (
                                                        <a 
                                                            href={`${api.defaults.baseURL.replace('/api', '')}${assignment.fileUrl}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all border border-primary-500/10 group/btn"
                                                        >
                                                            <Paperclip className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">See Assignment</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Modal */}
            <AnimatePresence>
                {showAttendanceModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAttendanceModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-start shrink-0">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-1 uppercase">Mark Attendance</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{classData.name} • Session Registry</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={markAllHoliday}
                                        className="px-5 py-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black rounded-xl text-[9px] hover:bg-amber-500/20 transition-all uppercase tracking-widest"
                                    >
                                        Mark Global Holiday
                                    </button>
                                    <button
                                        onClick={() => setShowAttendanceModal(false)}
                                        className="p-3 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 md:px-10 py-6 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chronological Timestamp</span>
                                <div className="relative group w-full sm:w-auto">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-white font-black text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all w-full sm:w-64 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {classData.students?.length === 0 ? (
                                    <div className="p-20 text-center opacity-40 italic text-slate-500">No identities synchronized for this registry.</div>
                                ) : (
                                    classData.students?.slice().sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true })).map((student, index) => (
                                        <div
                                            key={index}
                                            className={`flex flex-row items-center justify-between p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] transition-all border duration-500 group ${attendanceRecords[student._id] === 'Present'
                                                ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                                                : attendanceRecords[student._id] === 'Absent'
                                                    ? 'bg-rose-500/[0.03] border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                                                    : attendanceRecords[student._id] === 'Holiday'
                                                        ? 'bg-amber-500/[0.03] border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                                                        : 'bg-white/[0.01] border-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
                                                <div className={`w-8 h-8 md:w-11 md:h-11 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-base border transition-colors ${attendanceRecords[student._id] === 'Present'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : attendanceRecords[student._id] === 'Absent'
                                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                        : attendanceRecords[student._id] === 'Holiday'
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            : 'bg-white/5 text-slate-500 border-white/5'
                                                    }`}>
                                                    {student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-white text-[13px] md:text-base tracking-tight truncate leading-none">
                                                        {student.rollNo && student.rollNo !== 'N/A' ? (student.rollNo.length > 3 ? student.rollNo.slice(-3) : student.rollNo) : student.name}
                                                    </p>
                                                    {student.rollNo && student.rollNo !== 'N/A' && (
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1 truncate">
                                                            {student.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 md:gap-2 shrink-0">
                                                <button
                                                    onClick={() => setAttendanceRecords(prev => ({ ...prev, [student._id]: 'Present' }))}
                                                    className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all border flex items-center justify-center ${attendanceRecords[student._id] === 'Present'
                                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                        : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'}`}
                                                    title="Mark Present"
                                                >
                                                    <Check className="w-4 h-4 md:w-6 md:h-6" />
                                                </button>
                                                <button
                                                    onClick={() => setAttendanceRecords(prev => ({ ...prev, [student._id]: 'Absent' }))}
                                                    className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl transition-all border flex items-center justify-center ${attendanceRecords[student._id] === 'Absent'
                                                        ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                                        : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'}`}
                                                    title="Mark Absent"
                                                >
                                                    <X className="w-4 h-4 md:w-6 md:h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 md:p-10 border-t border-white/5 shrink-0 bg-black/20">
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={
                                        classData.students?.length === 0 ||
                                        isSaving ||
                                        Object.values(attendanceRecords).some(status => status === '')
                                    }
                                    className="w-full btn-primary h-16 rounded-[1.5rem] flex items-center justify-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed group"
                                >
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Commit Entry to Block</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Log Detail Modal */}
            <AnimatePresence>
                {showLogModal && selectedLog && (
                    <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Attendance Log</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">
                                        {new Date(selectedLog.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleExportDailyExcel(selectedLog.date)}
                                        disabled={isDownloadingDaily}
                                        className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all border border-emerald-500/10 flex items-center gap-2 group"
                                        title="Download Excel for this date"
                                    >
                                        {isDownloadingDaily ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Export XLSX</span>
                                    </button>
                                    <button
                                        onClick={() => setShowLogModal(false)}
                                        className="p-3 rounded-xl hover:bg-white/5 text-slate-400 group"
                                    >
                                        <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-none">
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Present</p>
                                        <p className="text-2xl font-black text-white tracking-tighter">{selectedLog.records.filter(r => r.status === 'Present').length}</p>
                                    </div>
                                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Absent</p>
                                        <p className="text-2xl font-black text-white tracking-tighter">{selectedLog.records.filter(r => r.status === 'Absent').length}</p>
                                    </div>
                                </div>

                                {selectedLog.records.map((record, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' :
                                                record.status === 'Absent' ? 'bg-rose-500/20 text-rose-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {record.student?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm tracking-tight">
                                                    {record.student?.rollNo || record.student?.name}
                                                </p>
                                                {record.student?.rollNo && (
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{record.student?.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' :
                                            record.status === 'Absent' ? 'bg-rose-500/10 text-rose-500' :
                                                'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Stats Modal */}
            <AnimatePresence>
                {showStatsModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowStatsModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className={`text-2xl font-black tracking-tighter uppercase ${statsModalData.type === 'critical' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {statsModalData.title}
                                    </h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{statsModalData.students.length} Principal Identities Categorized</p>
                                </div>
                                <button
                                    onClick={() => setShowStatsModal(false)}
                                    className="p-3 rounded-xl hover:bg-white/5 text-slate-400"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-none">
                                {statsModalData.students?.length === 0 ? (
                                    <p className="text-center text-slate-600/50 italic py-10 uppercase font-black text-xs tracking-widest">Category Empty</p>
                                ) : (
                                    statsModalData.students.map(student => (
                                        <div key={student.studentId} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors group">
                                            <div>
                                                <p className="font-black text-white text-sm tracking-tight">
                                                    {(student.rollNo || student.enrollmentNo)
                                                        ? `${student.rollNo || 'N/A'} / ${student.enrollmentNo || 'N/A'}`
                                                        : student.name}
                                                </p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black w-14 text-center border ${statsModalData.type === 'critical'
                                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                }`}>
                                                {student.percentage}%
                                            </div>
                                        </div >
                                    ))
                                )}
                            </div >
                        </motion.div >
                    </div >
                )}
            </AnimatePresence >

            {/* Note Upload Modal */}
            <AnimatePresence>
                {showNoteUploadModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[120] p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNoteUploadModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 p-8 md:p-10"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Deploy Asset</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">Registry: {classData.name}</p>
                                </div>
                                <button onClick={() => setShowNoteUploadModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleNoteUpload} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Designation</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Unit 1 - System Architecture"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        className="input-field bg-white/5 border-white/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deployment Context (Optional)</label>
                                    <textarea
                                        placeholder="Enter brief description of the shared material..."
                                        value={noteDescription}
                                        onChange={(e) => setNoteDescription(e.target.value)}
                                        className="input-field bg-white/5 border-white/10 min-h-[100px] py-4 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payload Source (PDF, PPT, Image)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            required
                                            accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png"
                                            onChange={(e) => setNoteFile(e.target.files[0])}
                                            className="hidden"
                                            id="note-file-upload"
                                        />
                                        <label
                                            htmlFor="note-file-upload"
                                            className="flex flex-col items-center justify-center w-full min-h-[120px] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary-500/50 transition-all cursor-pointer group"
                                        >
                                            {noteFile ? (
                                                <div className="flex flex-col items-center gap-2 p-4">
                                                    <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-400">
                                                        <CheckCircle className="w-8 h-8" />
                                                    </div>
                                                    <span className="text-xs text-white font-black truncate max-w-[200px]">{noteFile.name}</span>
                                                    <span className="text-[8px] text-slate-500 font-bold uppercase">Change File</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-slate-600 mb-2 group-hover:text-primary-400 group-hover:scale-110 transition-all" />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Academic Payload</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploadingNote}
                                    className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isUploadingNote ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span className="text-[11px] font-black uppercase tracking-widest">Finalize Deployment</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assignment Creation Modal */}
            <AnimatePresence>
                {showAssignmentModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[130] p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAssignmentModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 p-8 md:p-10"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Initialize Task</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">Registry: {classData.name}</p>
                                </div>
                                <button onClick={() => setShowAssignmentModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 font-black">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAssignment} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Designation</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Research Paper: AI Ethics"
                                        value={assignmentTitle}
                                        onChange={(e) => setAssignmentTitle(e.target.value)}
                                        className="input-field bg-black/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contextual Brief</label>
                                    <textarea
                                        placeholder="Define objectives and constraints..."
                                        value={assignmentDescription}
                                        onChange={(e) => setAssignmentDescription(e.target.value)}
                                        className="input-field bg-black/20 min-h-[100px] py-4 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Termination Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={assignmentDueDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setAssignmentDueDate(e.target.value)}
                                            className="input-field bg-black/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reference Asset</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setAssignmentFile(e.target.files[0])}
                                            className="hidden"
                                            id="assignment-file-upload-2"
                                        />
                                        <label
                                            htmlFor="assignment-file-upload-2"
                                            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary-500/50 transition-all cursor-pointer truncate"
                                        >
                                            {assignmentFile ? (
                                                <span className="text-[10px] text-white font-black truncate">{assignmentFile.name}</span>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 text-slate-600" />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Upload Asset</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreatingAssignment}
                                    className="btn-primary w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                                >
                                    {isCreatingAssignment ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Deploy to Registry"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Submissions Modal */}
            <AnimatePresence>
                {showSubmissionsModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[130] p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSubmissionsModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Response Registry</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">Task: {selectedAssignment?.title}</p>
                                </div>
                                <button onClick={() => setShowSubmissionsModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {isFetchingSubmissions ? (
                                    <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
                                ) : submissions.length === 0 ? (
                                    <div className="p-20 text-center opacity-40 font-black uppercase text-sm tracking-widest">No responses synchronized yet.</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {submissions.map((sub) => (
                                            <div key={sub._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center font-black text-lg border border-primary-500/10">
                                                            {sub.student?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-black text-base">{sub.student?.name}</h4>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                                                                {sub.student?.rollNo} • {new Date(sub.submittedAt).toLocaleString()}
                                                            </p>
                                                            <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 text-slate-300 text-sm italic">
                                                                {sub.responseText || "No text feedback provided."}
                                                            </div>
                                                            {sub.fileUrl && (
                                                                <a 
                                                                   href={`${api.defaults.baseURL.replace('/api', '')}${sub.fileUrl}`} 
                                                                   target="_blank"
                                                                   className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-xl border border-primary-500/10 hover:bg-primary-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                                                >
                                                                   <Paperclip className="w-4 h-4" />
                                                                   Review Asset: {sub.fileName}
                                                                </a>
                                                            )}
                                                            {sub.feedback && (
                                                                <div className="mt-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[10px] text-emerald-400/80 italic font-medium">
                                                                    Faculty Feedback: {sub.feedback}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                                        {gradingSubmission?._id === sub._id ? (
                                                            <form onSubmit={handleGradeSubmission} className="w-64 space-y-3 bg-black/40 p-4 rounded-2xl border border-primary-500/30">
                                                                <input 
                                                                   type="text" 
                                                                   placeholder="Grade (e.g. A+)" 
                                                                   value={grade}
                                                                   onChange={(e) => setGrade(e.target.value)}
                                                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-black text-xs"
                                                                />
                                                                <textarea 
                                                                   placeholder="Feedback..." 
                                                                   value={feedback}
                                                                   onChange={(e) => setFeedback(e.target.value)}
                                                                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs h-20 resize-none"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button type="submit" disabled={isSavingGrade} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase">
                                                                        {isSavingGrade ? "..." : "Save"}
                                                                    </button>
                                                                    <button onClick={() => setGradingSubmission(null)} className="flex-1 py-2 bg-white/5 text-slate-400 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <>
                                                                {sub.grade ? (
                                                                    <div className="text-right">
                                                                        <div className="text-2xl font-black text-emerald-400 tracking-tighter">{sub.grade}</div>
                                                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">Verified Score</p>
                                                                        <button onClick={() => {
                                                                            setGradingSubmission(sub);
                                                                            setGrade(sub.grade);
                                                                            setFeedback(sub.feedback || '');
                                                                        }} className="mt-2 text-[9px] text-primary-400 hover:text-primary-300 font-bold uppercase tracking-widest">Update Grade</button>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                       onClick={() => setGradingSubmission(sub)}
                                                                       className="px-6 py-3 bg-primary-500/10 text-primary-400 rounded-xl border border-primary-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary-500/20"
                                                                    >
                                                                       Evaluate Response
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
 
            {/* Quiz Settings Modal */}
            <AnimatePresence>
                {showQuizSettingsModal && selectedQuiz && (
                    <div className="fixed inset-0 flex items-center justify-center z-[130] p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQuizSettingsModal(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 p-8 md:p-10"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Quiz Controls</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">{selectedQuiz.title}</p>
                                </div>
                                <button onClick={() => setShowQuizSettingsModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Backtracking Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                                            <History className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Backtracking</p>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Allow question re-visits</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateQuizSettings(selectedQuiz._id, { backtrackingEnabled: !selectedQuiz.backtrackingEnabled })}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${selectedQuiz.backtrackingEnabled ? 'bg-primary-600' : 'bg-slate-700'}`}
                                    >
                                        <motion.div
                                            animate={{ x: selectedQuiz.backtrackingEnabled ? 24 : 2 }}
                                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                                        />
                                    </button>
                                </div>

                                {/* Results Visibility Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Result Release</p>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Show total score instantly</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateQuizSettings(selectedQuiz._id, { showResult: !selectedQuiz.showResult })}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${selectedQuiz.showResult ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                    >
                                        <motion.div
                                            animate={{ x: selectedQuiz.showResult ? 24 : 2 }}
                                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                                        />
                                    </button>
                                </div>

                                <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
                                    <div className="flex gap-3 items-start">
                                        <Info className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed">
                                            Changes to these controls take effect immediately for all active learners and future attempts.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherClassDetails;
