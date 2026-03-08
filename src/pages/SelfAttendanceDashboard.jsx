import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GraduationCap, Settings, Bell, BellOff, Sun, Moon, Search, Download, LogOut, User as UserIcon, Shield, School, AlertTriangle, Menu, X, Share, PlusSquare, Info } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';
import ClassCard from '../components/ClassCard';
import Modal from '../components/Modal';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { calculateAttendanceStats } from '../utils/calculations';

const SelfAttendanceDashboard = () => {
    const { isInstallable, showInstallPrompt, isIOS, isStandalone } = usePWAInstall();
    const [isIOSInstallModalOpen, setIsIOSInstallModalOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const {
        classes,
        addClass,
        removeClass,
        updateAttendance,
        updateClass,
        darkMode,
        toggleDarkMode,
        notificationsEnabled,
        requestNotificationPermission,
        sendNotification
    } = useAttendance();

    // Check for alerts on app open
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        classes.forEach(c => {
            const stats = calculateAttendanceStats(c);
            const isBelowThreshold = stats.percentage < (c.targetPercentage || 75);
            const alreadyNotifiedToday = c.lastNotificationDate === todayStr;

            if (isBelowThreshold && stats.totalWorkingDays > 0 && !alreadyNotifiedToday) {
                sendNotification(
                    '⚠️ Attendance Alert!',
                    `Your attendance in '${c.name}' is ${stats.percentage}%. Maintain at least ${c.targetPercentage || 75}%.`
                );
                updateClass(c.id, { lastNotificationDate: todayStr });
            }
        });
    }, [classes.length]); // Run on mount or when classes are added/removed

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [newClass, setNewClass] = useState({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        targetPercentage: 75
    });

    const handleAddClass = (e) => {
        e.preventDefault();
        if (!newClass.name || !newClass.startDate) return;
        addClass(newClass);
        setIsAddModalOpen(false);
        setNewClass({
            name: '',
            startDate: new Date().toISOString().split('T')[0],
            targetPercentage: 75
        });
    };

    const handleMarkAttendance = (date, status) => {
        updateAttendance(selectedClassId, date, status);

        const classData = classes.find(c => c.id === selectedClassId);
        if (!classData) return;

        const updatedAttendance = { ...classData.attendance };
        if (status === null) delete updatedAttendance[date];
        else updatedAttendance[date] = status;

        const stats = calculateAttendanceStats({ ...classData, attendance: updatedAttendance });
        const todayStr = new Date().toISOString().split('T')[0];
        const isBelowThreshold = stats.percentage < (classData.targetPercentage || 75);
        const alreadyNotifiedToday = classData.lastNotificationDate === todayStr;

        if (isBelowThreshold && status !== 'holiday' && !alreadyNotifiedToday) {
            sendNotification(
                '⚠️ Attendance Alert!',
                `Your attendance in '${classData.name}' is ${stats.percentage}%. Maintain at least ${classData.targetPercentage || 75}%.`
            );

            updateClass(selectedClassId, { lastNotificationDate: todayStr });
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedClass = classes.find(c => c.id === selectedClassId);

    return (
        <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full glass border-b dark:border-slate-800 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/about-developer')}>
                        <div className="bg-primary-600 p-2 rounded-xl text-white">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent hidden sm:block">
                            ATTENDLY
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 text-primary-600 bg-primary-100 dark:bg-primary-900/30 rounded-xl transition-all flex items-center gap-2 px-3"
                                title="Admin Panel"
                            >
                                <Shield className="w-5 h-5" />
                                <span className="text-xs font-bold hidden md:block">Admin Panel</span>
                            </button>
                        ) : (
                            <div className="p-2 text-green-500 bg-green-500/10 rounded-xl flex items-center gap-2" title="Notifications Forced On">
                                <Bell className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase hidden sm:block">Protected</span>
                            </div>
                        )}

                        {!isStandalone && (
                            <button
                                onClick={() => {
                                    if (isInstallable) {
                                        showInstallPrompt();
                                    } else if (isIOS) {
                                        setIsIOSInstallModalOpen(true);
                                    } else {
                                        alert("To install, look for the 'Add to Home Screen' or 'Install' option in your browser menu.");
                                    }
                                }}
                                className="p-2 text-primary-600 bg-primary-100 dark:bg-primary-900/30 rounded-xl transition-all flex items-center gap-2 px-3"
                                title="Install App"
                            >
                                <Download className="w-5 h-5" />
                                <span className="text-xs font-bold hidden md:block">Install</span>
                            </button>
                        )}

                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={() => navigate('/about-app')}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                title="About App"
                            >
                                <Info className="w-5 h-5" />
                            </button>
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                title="Toggle Theme"
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                title="Log Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => {
                                                    toggleDarkMode();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                                            >
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                                                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold dark:text-white">Theme</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{darkMode ? 'Light Mode' : 'Dark Mode'}</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={logout}
                                                className="flex items-center gap-3 w-full p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left group"
                                            >
                                                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full group-hover:bg-white dark:group-hover:bg-red-900/50 transition-colors">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-red-600 dark:text-red-400">Log Out</p>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all text-sm sm:text-base"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Class</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {classes.some(c => calculateAttendanceStats(c).percentage < (c.targetPercentage || 75)) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400"
                    >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold">
                            Warning: Some of your classes are below the target attendance percentage.
                        </p>
                    </motion.div>
                )}

                <div className="mb-8">
                    <h2 className="text-3xl font-black dark:text-white mb-2">Welcome back, {user?.name || 'User'}! 👋</h2>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        {user?.institute && (
                            <span className="flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
                                <School className="w-4 h-4" />
                                {user.institute}
                            </span>
                        )}
                        <span>Track your progress and stay on top of your attendance.</span>
                    </p>
                </div>

                {classes.length > 0 && (
                    <div className="mb-8 relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white shadow-sm"
                        />
                    </div>
                )}

                {classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-full mb-6">
                            <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-bold dark:text-white mb-2">No classes yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8">
                            Start by adding your first class to track your attendance goals.
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary"
                        >
                            <Plus className="w-5 h-5" />
                            Add First Class
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredClasses.map((c) => (
                                <ClassCard
                                    key={c.id}
                                    classItem={c}
                                    onOpen={() => {
                                        setSelectedClassId(c.id);
                                        setIsCalendarOpen(true);
                                    }}
                                    onDelete={(id) => {
                                        if (window.confirm('Are you sure you want to delete this class? All attendance data will be lost.')) {
                                            removeClass(id);
                                        }
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Class"
            >
                <form onSubmit={handleAddClass} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            Class Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Physics 101"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            required
                            value={newClass.startDate}
                            onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            Target Attendance (%)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="50"
                                max="100"
                                step="5"
                                value={newClass.targetPercentage}
                                onChange={(e) => setNewClass({ ...newClass, targetPercentage: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <span className="text-xl font-black text-primary-600 w-12 text-center">
                                {newClass.targetPercentage}%
                            </span>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full btn-primary py-4">
                            Create Class
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                title={selectedClass?.name || 'Attendance'}
            >
                {selectedClass && (
                    <AttendanceCalendar
                        classItem={selectedClass}
                        onMark={handleMarkAttendance}
                    />
                )}
            </Modal>
        </div>
    );
};

export default SelfAttendanceDashboard;
