import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Building, BarChart3, Bell, Settings, LogOut, CheckCircle, XCircle, Clock, ChevronRight, FileText, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const HODDashboard = () => {
    const { user, logout } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [tab, setTab] = useState('faculty'); // faculty, classes

    useEffect(() => {
        const fetchHODData = async () => {
            try {
                const analyticsRes = await api.get('/college/hod/analytics');
                setAnalytics(analyticsRes.data);
                const notifRes = await api.get('/college/notifications');
                setNotifications(notifRes.data);
            } catch (error) {
                console.error("Failed to fetch HOD data");
            } finally {
                setLoading(false);
            }
        };
        fetchHODData();
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary-500/30 relative overflow-hidden flex flex-col">
            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0f172a,transparent_50%)] opacity-40"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] mix-blend-screen animate-spin-slow origin-center"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1 flex flex-col">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="bg-gradient-to-br from-indigo-500/20 to-primary-500/20 p-4 md:p-5 rounded-3xl text-primary-400 border border-primary-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                            <Shield className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">Strategic Command</h1>
                            <p className="text-slate-400 font-bold flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.2em]">
                                <Building className="w-4 h-4 text-primary-500" />
                                Department of {user?.departmentName || 'Your Department'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 relative z-10 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                            <p className="font-black text-white text-lg tracking-tight">{user?.name}</p>
                            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.3em] flex items-center md:justify-end gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {user?.role || 'HOD'}
                            </p>
                        </div>
                        <button onClick={logout} className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group/logout border border-rose-500/20 hover:border-transparent hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                            <LogOut className="w-5 h-5 group-hover/logout:-translate-x-1 transition-transform" />
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Faculty', val: analytics?.teachersCount || 0, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20', shadow: 'shadow-primary-500/10' },
                        { label: 'Active Classes', val: analytics?.classesCount || 0, icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', shadow: 'shadow-indigo-500/10' },
                        { label: 'Avg Attendance', val: `${analytics?.avgAttendance || 0}%`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10' },
                        { label: 'System Alerts', val: notifications.length, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/10' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`card p-6 md:p-8 bg-slate-900/40 border-white/5 shadow-2xl flex flex-col gap-4 relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>
                            <div className={`p-4 rounded-2xl w-fit ${stat.bg} ${stat.color} border ${stat.border}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="mt-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{stat.val}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content Tabs */}
                <div className="flex gap-2 mb-10 p-2 bg-slate-900/50 backdrop-blur-md rounded-2xl w-fit border border-white/5 overflow-x-auto max-w-full hide-scrollbar">
                    {['faculty', 'classes'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`relative px-8 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all whitespace-nowrap overflow-hidden ${tab === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab === t && (
                                <motion.div
                                    layoutId="hodTabIndicator"
                                    className="absolute inset-0 bg-primary-600/20 border border-primary-500/30 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{t}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    <div className="lg:col-span-2 space-y-6">
                        {tab === 'faculty' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/40 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 backdrop-blur-sm"
                            >
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                        <Users className="w-6 h-6 text-primary-500" />
                                        Department Roster
                                    </h2>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-lg border border-white/10">{analytics?.teachers?.length || 0} Faculty</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900/60 border-b border-white/5">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Assigned Modules</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Clearance Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {analytics?.teachers?.map((t) => (
                                                <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center font-black text-sm border border-primary-500/20 group-hover:scale-110 transition-transform">
                                                                {t.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-white text-sm md:text-base tracking-tight">{t.name}</div>
                                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-300">
                                                            {analytics?.classes?.filter(c => c.user === t._id).length} Modules
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 border ${t.isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                            {t.isApproved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {t.isApproved ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!analytics?.teachers || analytics.teachers.length === 0) && (
                                                <tr>
                                                    <td colSpan="3" className="px-8 py-16 text-center text-slate-500 font-black text-sm uppercase tracking-widest italic opacity-50">
                                                        No roster data found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {tab === 'classes' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analytics?.classes?.map((c) => (
                                    <motion.div
                                        key={c._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -8 }}
                                        className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-400 font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                                {c.classCode}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-lg">SEM {c.semester}</div>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">{c.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">{c.subject}</p>

                                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {analytics?.teachers?.find(t => t._id === c.user)?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                    {analytics?.teachers?.find(t => t._id === c.user)?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                <Users className="w-3 h-3" />
                                                {c.students?.length || 0}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                                {(!analytics?.classes || analytics.classes.length === 0) && (
                                    <div className="col-span-full card p-16 text-center border-white/5 bg-slate-900/40">
                                        <Building className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 font-black text-sm uppercase tracking-widest">No active modules</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900/40 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 backdrop-blur-sm sticky top-8">
                            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 tracking-tight">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <Bell className="w-5 h-5" />
                                </div>
                                System Logs
                            </h2>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {notifications.map((notif, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        key={notif._id}
                                        className="p-5 bg-black/20 rounded-2xl border-l-[3px] border-amber-500 border-y border-y-white/5 border-r border-r-white/5 group hover:bg-white/[0.02] transition-colors relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <h4 className="font-black text-white text-sm tracking-tight mb-1 relative z-10">{notif.title}</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed font-medium relative z-10">{notif.message}</p>
                                        <div className="flex items-center gap-2 mt-3 relative z-10">
                                            <Clock className="w-3 h-3 text-slate-600" />
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <CheckCircle className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">All Systems Nominal</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
