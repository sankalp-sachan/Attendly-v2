import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, TrendingUp, AlertCircle, LogOut, Bell, Key, MessageCircle, XCircle, GraduationCap, School, ArrowRight, User, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import { useNavigate } from 'react-router-dom';

const calculatePrediction = (present, total, targetPercentageStr) => {
    if (total === 0) return { text: "No classes held yet", type: 'neutral' };
    const target = parseFloat(targetPercentageStr) / 100;
    const current = present / total;
    
    if (current < target) {
        let requiredClasses = Math.ceil((target * total - present) / (1 - target));
        if (requiredClasses < 0) requiredClasses = 0; 
        return { 
            text: `Must attend next ${requiredClasses} class${requiredClasses !== 1 ? 'es' : ''} to reach ${targetPercentageStr}%`,
            type: 'danger'
        };
    } else {
        let skippableClasses = Math.floor((present - target * total) / target);
        if (skippableClasses === 0) return {
            text: `On track. Cannot skip the next class.`,
            type: 'warning'
        };
        return {
            text: `Safe to skip ${skippableClasses} class${skippableClasses !== 1 ? 'es' : ''}`,
            type: 'success'
        };
    }
};

const StudentDashboard = () => {
    const { user, logout, updateUserProfile } = useAuth();
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

    // Profile State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        rollNo: user?.rollNo || '',
        enrollmentNo: user?.enrollmentNo || '',
        mobileNo: user?.mobileNo || '',
        section: user?.section || '',
        year: user?.year || ''
    });
    const [profileMessage, setProfileMessage] = useState('');

    // Gyan Sanchay Search State
    const [extSearchQuery, setExtSearchQuery] = useState('');
    const [extSearchResults, setExtSearchResults] = useState([]);
    const [searchingExt, setSearchingExt] = useState(false);
    const [extSearchError, setExtSearchError] = useState('');
    const [downloadingFileId, setDownloadingFileId] = useState(null);
    const [hasSearchedExt, setHasSearchedExt] = useState(false);

    const handleExtSearch = async (e) => {
        e.preventDefault();
        if (!extSearchQuery.trim()) return;

        setSearchingExt(true);
        setExtSearchError('');
        setHasSearchedExt(false);
        try {
            const { data } = await api.get(`/notes/external/search?query=${encodeURIComponent(extSearchQuery)}`);
            setExtSearchResults(data);
            setHasSearchedExt(true);
        } catch (error) {
            setExtSearchError(error.response?.data?.message || 'Search failed. Please try again.');
        } finally {
            setSearchingExt(false);
        }
    };

    const downloadExternalFile = async (result) => {
        if (result.fileType === 'link') {
            window.open(result.link, '_blank');
            return;
        }

        setDownloadingFileId(result.id);
        try {
            const response = await api.get('/notes/download-proxy', {
                params: { 
                    url: result.link, 
                    filename: `${result.title.replace(/[^a-zA-Z0-9\s]/g, '')}.${result.fileType}` 
                },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${result.title.replace(/[^a-zA-Z0-9\s]/g, '')}.${result.fileType}`);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Direct download failed:", error);
            window.open(result.link, '_blank');
        } finally {
            setDownloadingFileId(null);
        }
    };

    useEffect(() => {
        fetchStudentClasses();
    }, []);

    useEffect(() => {
        if (user) checkProfileCompletion();
    }, [user]);

    const checkProfileCompletion = () => {
        const isPlaceholder = (val) => !val || val === 'N/A' || val.toString().trim() === '';
        const isIncomplete = isPlaceholder(user?.name) ||
            isPlaceholder(user.rollNo) ||
            isPlaceholder(user.enrollmentNo) ||
            isPlaceholder(user.mobileNo) ||
            isPlaceholder(user.section) ||
            !user.year;

        if (isIncomplete) {
            setShowProfileModal(true);
        }
    };

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
            fetchStudentClasses();
            setTimeout(() => {
                setShowJoinModal(false);
                setMessage('');
            }, 1500);
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile(profileData);
            setProfileMessage('Profile updated successfully!');
            setTimeout(() => {
                setShowProfileModal(false);
                setProfileMessage('');
            }, 1500);
        } catch (error) {
            setProfileMessage('Failed to update profile.');
        }
    };

    return (
        <div className="min-h-screen relative bg-[#020617] p-4 md:p-8 lg:p-10 overflow-x-hidden font-sans">
            {/* Cinematic Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 transform -rotate-6">
                            <GraduationCap className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Attendly</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-slate-500 font-bold uppercase text-[8px] md:text-[9px] tracking-[0.2em]">Student Active ({user.name})</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 border relative ${(!user?.rollNo || user?.rollNo === 'N/A' || !user?.enrollmentNo || user?.enrollmentNo === 'N/A')
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/50 animate-pulse'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5'
                                }`}
                            title="My Profile"
                        >
                            <User className="w-4 h-4 md:w-5 md:h-5" />
                            {(!user?.rollNo || user?.rollNo === 'N/A' || !user?.enrollmentNo || user?.enrollmentNo === 'N/A') && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#020617] shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex-1 sm:flex-none btn-primary px-6 py-3 text-sm rounded-xl md:rounded-2xl"
                        >
                            <Key className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Join Class</span>
                        </button>
                        <button onClick={logout} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20">
                            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card bg-gradient-to-br from-primary-600/90 to-indigo-700/90 text-white border-none relative overflow-hidden group p-6 md:p-8"
                    >
                        <TrendingUp className="absolute -right-4 -bottom-4 w-24 md:w-32 h-24 md:h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Overall Attendance</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter">
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
                        className="card dark:bg-slate-900/40 border-white/5 relative overflow-hidden group p-6 md:p-8"
                    >
                        <BookOpen className="absolute -right-4 -bottom-4 w-24 md:w-32 h-24 md:h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Enrolled Classes</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">{enrolledClasses.length}</p>
                        <p className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Academic Path</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="card dark:bg-slate-900/40 border-white/5 relative overflow-hidden group p-6 md:p-8"
                    >
                        <AlertCircle className="absolute -right-4 -bottom-4 w-24 md:w-32 h-24 md:h-32 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Low Attendance</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            {enrolledClasses.filter(c => parseFloat(c.attendanceStats?.percentage) < c.targetPercentage).length}
                        </p>
                        <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">Focus Areas Identified</p>
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Active Courses</h2>
                        <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 uppercase tracking-wider opacity-60">Registered academic modules</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-20">
                    <AnimatePresence>
                        {enrolledClasses.map((cls) => (
                            <motion.div
                                key={cls._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="card group flex flex-col sm:flex-row gap-6 md:gap-8 items-stretch bg-slate-900/40 border-white/5 rounded-[2rem] p-6 md:p-8"
                            >
                                <div className="sm:w-32 flex flex-col items-center justify-center bg-white/5 rounded-[1.5rem] p-4 border border-white/5 transition-all duration-500 group-hover:bg-primary-500/10 group-hover:border-primary-500/20">
                                    <div className={`text-3xl md:text-4xl font-black ${parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {cls.attendanceStats?.percentage}%
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Presence</span>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3
                                                onClick={() => navigate(`/student/classes/${cls._id}`)}
                                                className="text-xl md:text-2xl font-black text-white cursor-pointer hover:text-primary-400 transition-colors tracking-tight leading-tight"
                                            >
                                                {cls.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-[10px] font-black text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">{cls.subject}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">ID: {cls.classCode}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openCorrectionModal(cls)}
                                            className="p-3 rounded-xl md:rounded-2xl bg-white/5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 border border-white/5 transition-all duration-300"
                                            title="Request Correction"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
                                            <span>Session Progress</span>
                                            <span className={parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'text-rose-500' : 'text-emerald-500 font-black'}>
                                                Target: {cls.targetPercentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2 border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cls.attendanceStats?.percentage}%` }}
                                                className={`h-full relative ${parseFloat(cls.attendanceStats?.percentage) < cls.targetPercentage ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                                            </motion.div>
                                        </div>
                                        {(() => {
                                            const prediction = calculatePrediction(
                                                cls.attendanceStats?.present || 0,
                                                cls.attendanceStats?.total || 0,
                                                cls.targetPercentage
                                            );
                                            return (
                                                <div className={`mb-4 text-[9px] font-bold uppercase tracking-widest ${
                                                    prediction.type === 'danger' ? 'text-rose-400' :
                                                    prediction.type === 'success' ? 'text-emerald-400' :
                                                    prediction.type === 'warning' ? 'text-amber-400' :
                                                    'text-slate-500'
                                                }`}>
                                                    {prediction.text}
                                                </div>
                                            );
                                        })()}
                                        <button
                                            onClick={() => navigate(`/student/classes/${cls._id}`)}
                                            className="w-full py-3 bg-white/5 hover:bg-primary-600 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-primary-500 group/btn flex items-center justify-center gap-2"
                                        >
                                            Analytics Report
                                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {enrolledClasses.length === 0 && !loading && (
                        <div className="col-span-full py-24 md:py-32 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-20 md:w-24 h-20 md:h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5"
                            >
                                <School className="w-10 h-10 text-slate-600" />
                            </motion.div>
                            <h3 className="text-2xl md:text-3xl font-black text-white/40 tracking-tight">No Active Enrolments</h3>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="mt-8 btn-primary px-10 py-4 mx-auto"
                            >
                                Unlock Your First Class
                            </button>
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 mt-16 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                            <div className="w-2 h-8 bg-amber-500 rounded-full" />
                            E-Learning & Notes Repository
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 uppercase tracking-wider opacity-60">Notes sourced from GYANSANCHAY (Official University Platform).</p>
                    </div>
                    
                    {/* External Search Bar */}
                    <form onSubmit={handleExtSearch} className="w-full md:w-auto flex-1 md:max-w-md relative group mt-4 md:mt-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            className="input-field pl-12 pr-28 border-white/5 focus:border-amber-500/50"
                            placeholder="Search Gyan Sanchay notes..."
                            value={extSearchQuery}
                            onChange={(e) => setExtSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={searchingExt}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                        >
                            {searchingExt ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* External Search Feedback */}
                {extSearchError && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold tracking-wide text-center relative z-20">
                        {extSearchError}
                    </div>
                )}
                {hasSearchedExt && extSearchResults.length === 0 && (
                    <div className="mb-8 p-6 bg-slate-900/40 border border-white/5 text-slate-400 rounded-2xl text-xs font-semibold tracking-wide text-center relative z-20">
                        No materials found on Gyan Sanchay matching your search query.
                    </div>
                )}

                {/* External Search Results */}
                {extSearchResults.length > 0 && (
                    <div className="mb-12 relative z-20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                Gyan Sanchay Results ({extSearchResults.length})
                            </h3>
                            <button
                                onClick={() => {
                                    setExtSearchResults([]);
                                    setExtSearchQuery('');
                                }}
                                className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-rose-400 transition-colors"
                            >
                                Clear Results
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {extSearchResults.map((result) => (
                                <motion.div
                                    key={`ext-${result.id}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -4 }}
                                    className="card bg-slate-900/40 border-amber-500/10 hover:border-amber-500/30 rounded-[2rem] p-6 flex flex-col justify-between group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg">
                                                {result.fileType === 'link' ? 'Read Online' : `${result.fileType.toUpperCase()} File`}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-black text-lg tracking-tight mb-2 line-clamp-2" title={result.title}>{result.title}</h4>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed mb-4 line-clamp-3">{result.description}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                                        <button
                                            onClick={() => downloadExternalFile(result)}
                                            disabled={downloadingFileId === result.id}
                                            className="w-full py-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl text-center block hover:bg-amber-400 transition-all font-sans flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {downloadingFileId === result.id ? (
                                                'Downloading...'
                                            ) : result.fileType === 'link' ? (
                                                'View Post Online'
                                            ) : (
                                                'Download Material'
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {extSearchError && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 font-bold text-xs">
                        {extSearchError}
                    </div>
                )}

                {extSearchResults.length === 0 && !searchingExt && (
                    <div className="py-12 text-center bg-slate-900/20 rounded-[2rem] border border-white/5 border-dashed mb-20">
                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-40" />
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Search for topics or subject notes above</p>
                    </div>
                )}
            </div>

            {/* Join Class Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter">Enter Pulse Code</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Connect to your academic session</p>
                                </div>
                                <button onClick={() => setShowJoinModal(false)} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all text-slate-500">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleJoinClass} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Key</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            className="input-field pl-12"
                                            placeholder="e.g. CS-2024-X"
                                            value={classCode}
                                            onChange={(e) => setClassCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {message && (
                                    <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-400 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                                        {message}
                                    </div>
                                )}
                                <button type="submit" className="w-full btn-primary py-5 rounded-2xl text-lg shadow-2xl shadow-primary-500/20 uppercase tracking-widest font-black">
                                    Sync Experience
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Correction Modal */}
            <AnimatePresence>
                {showCorrectionModal && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter">Attendance Log</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Request session verification</p>
                                </div>
                                <button onClick={() => setShowCorrectionModal(false)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 transition-all hover:bg-rose-500/20 hover:text-rose-500">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCorrectionRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field cursor-pointer"
                                        value={correctionDate}
                                        onChange={(e) => setCorrectionDate(e.target.value)}
                                        onClick={(e) => e.target.showPicker?.()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Justification</label>
                                    <textarea
                                        required
                                        className="input-field min-h-[120px] py-4 resize-none"
                                        placeholder="Briefly explain the discrepancy..."
                                        value={correctionReason}
                                        onChange={(e) => setCorrectionReason(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="w-full btn-primary py-5 rounded-2xl text-lg shadow-2xl shadow-primary-500/20 uppercase tracking-widest font-black">
                                    File Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter">My Profile</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage academic details</p>
                                    {(!user?.rollNo || user?.rollNo === 'N/A' || !user?.enrollmentNo || user?.enrollmentNo === 'N/A') && (
                                        <p className="mt-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            ⚠️ Critical Identity data missing
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => setShowProfileModal(false)} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all text-slate-500">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Your Custom Name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Roll Number</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. 21B2"
                                        value={profileData.rollNo}
                                        onChange={(e) => setProfileData({ ...profileData, rollNo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enrollment Number</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. 0111XX7085"
                                        value={profileData.enrollmentNo}
                                        onChange={(e) => setProfileData({ ...profileData, enrollmentNo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        className="input-field"
                                        placeholder="Mobile No"
                                        value={profileData.mobileNo}
                                        onChange={(e) => setProfileData({ ...profileData, mobileNo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Section</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. CS-4"
                                        value={profileData.section}
                                        onChange={(e) => setProfileData({ ...profileData, section: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Year</label>
                                    <select
                                        className="input-field bg-[#0f172a]"
                                        value={profileData.year}
                                        onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>

                                {profileMessage && (
                                    <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${profileMessage.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                        {profileMessage}
                                    </div>
                                )}

                                <button type="submit" className="w-full btn-primary py-5 rounded-2xl text-lg shadow-2xl shadow-primary-500/20 uppercase tracking-widest font-black mt-2">
                                    Save Profile
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
