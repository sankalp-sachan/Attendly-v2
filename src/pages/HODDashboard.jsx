import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Building, BarChart3, Bell, Settings, LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-5">
                        <div className="bg-gradient-to-br from-indigo-600 to-primary-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">HOD Strategic Panel</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                Department of {user?.departmentName || 'Your Department'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-4 hidden md:block">
                            <p className="font-black dark:text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <button onClick={logout} className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group">
                            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Faculty', val: analytics?.teachersCount || 0, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/10' },
                        { label: 'Active Classes', val: analytics?.classesCount || 0, icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
                        { label: 'Avg Attendance', val: `${analytics?.avgAttendance || 0}%`, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                        { label: 'System Alerts', val: notifications.length, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' }
                    ].map((stat, i) => (
                        <div key={i} className="card p-6 bg-white dark:bg-slate-900 border-none shadow-xl flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black dark:text-white leading-none">{stat.val}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Tabs */}
                <div className="flex gap-4 mb-8 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit">
                    {['faculty', 'classes'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${tab === t ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {tab === 'faculty' && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h2 className="text-xl font-black dark:text-white">Department Faculty</h2>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{analytics?.teachers?.length || 0} Members</span>
                                </div>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Classes</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {analytics?.teachers?.map((t) => (
                                            <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold dark:text-white">{t.name}</div>
                                                    <div className="text-xs text-slate-500">{t.email}</div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-black dark:text-white">
                                                        {analytics?.classes?.filter(c => c.user === t._id).length}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {t.isApproved ? 'Verified' : 'Reviewing'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {tab === 'classes' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analytics?.classes?.map((c) => (
                                    <div key={c._id} className="card p-6 bg-white dark:bg-slate-900 border-none shadow-xl group hover:-translate-y-1 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-2xl text-primary-600 font-black text-xs">
                                                {c.classCode}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SEM {c.semester}</div>
                                        </div>
                                        <h3 className="text-xl font-black dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{c.name}</h3>
                                        <p className="text-sm font-bold text-slate-500 mb-4">{c.subject}</p>
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {analytics?.teachers?.find(t => t._id === c.user)?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    {analytics?.teachers?.find(t => t._id === c.user)?.name}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 px-2 py-1 rounded-lg uppercase">
                                                {c.students?.length} Students
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-black dark:text-white mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" />
                                Notifications
                            </h2>
                            <div className="space-y-4">
                                {notifications.map(notif => (
                                    <div key={notif._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-amber-400 group hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{notif.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">{notif.message}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <CheckCircle className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">All clear!</p>
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
