import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, Trash2, LogOut, Search, Building, Plus, User as UserIcon, List, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
    const { user, logout, deleteUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [tab, setTab] = useState('users'); // 'users', 'departments', 'audit'
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';
    const isAssistant = user?.role === 'assistant_admin';

    useEffect(() => {
        if (!isAdmin && !isAssistant) {
            navigate('/');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);
            const deptRes = await api.get('/admin/departments');
            setDepartments(deptRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            await api.put(`/ admin / users / ${userId}/role`, updates);
            fetchData();
        } catch (error) {
            alert("Failed to update user");
        }
    };

    const handleDeleteUser = async (u) => {
        if (!isAdmin) {
            alert("Only full admins can delete users.");
            return;
        }
        if (window.confirm(`Delete ${u.name}?`)) {
            try {
                await deleteUser(u._id);
                fetchData();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleCreateDept = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/departments', newDept);
            setShowDeptModal(false);
            setNewDept({ name: '', code: '', description: '' });
            fetchData();
        } catch (error) {
            alert("Failed to create department");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAdmin && !isAssistant) return null;

    return (
        <div className="min-h-screen relative bg-[#020617] flex flex-col font-sans overflow-x-hidden">
            {/* Cinematic Background Atmosphere */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.2, 0.15] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/20 transform -rotate-12">
                            <Shield className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-none">Attendly</h1>
                            <p className="text-[8px] md:text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mt-1">
                                {isAdmin ? 'Root Archive' : 'System Assistant'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right mr-2">
                            <p className="text-xs font-black text-white tracking-tight leading-none">{user.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Administrator</p>
                        </div>
                        <button onClick={logout} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl md:rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 relative z-10">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="card bg-gradient-to-br from-primary-600/90 to-indigo-700/90 text-white border-none relative overflow-hidden group p-8 shadow-2xl shadow-primary-500/10"
                    >
                        <Users className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Registry Size</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter">{users.length}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">Active Entities</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5 }}
                        className="card bg-slate-900/40 border-white/5 relative overflow-hidden group p-8"
                    >
                        <Building className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Faculty Sectors</h3>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">{departments.length}</p>
                        <p className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest opacity-80">Academic Clusters</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5 }}
                        className="card bg-slate-900/40 border-white/5 relative overflow-hidden group p-8"
                    >
                        <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Security Ledger</h3>
                        <div className="flex items-center gap-3">
                            <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">Active</p>
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-80">Vault Synchronized</p>
                    </motion.div>
                </div>

                {/* Dashboard Nav */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-none">
                    {['users', 'departments'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-8 py-3.5 rounded-2xl font-black transition-all capitalize whitespace-nowrap text-xs tracking-widest border ${tab === t ? 'bg-primary-600 text-white border-primary-500 shadow-2xl shadow-primary-500/30' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'}`}
                        >
                            {t} Perspective
                        </button>
                    ))}
                </div>

                {tab === 'users' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative max-w-md w-full group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search registry by name/email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field pl-14 bg-slate-900/50"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl overflow-x-auto scrollbar-none">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-black/20">
                                        <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-center w-24">Avatar</th>
                                        <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Principal Identity</th>
                                        <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Privilege Level</th>
                                        <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Assigned Sector</th>
                                        <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Protocol</th>
                                        <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-primary-500/[0.03] transition-colors group">
                                            <td className="px-8 py-6 text-center">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 mx-auto group-hover:scale-110 group-hover:text-primary-400 transition-all duration-500 border border-white/5">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-white text-base tracking-tight leading-none mb-1.5">{u.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{u.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                                                    className="bg-black/20 dark:bg-slate-950 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-primary-400 outline-none w-fit border border-white/5 focus:ring-1 focus:ring-primary-500/50 transition-all"
                                                >
                                                    <option value="student">STUDENT</option>
                                                    <option value="cr">CR (REP)</option>
                                                    <option value="mentor">FACULTY MENTOR</option>
                                                    <option value="teacher">PROFESSOR</option>
                                                    <option value="hod">H.O.D</option>
                                                    <option value="assistant_admin">SYSTEM ASST</option>
                                                    <option value="admin">ROOT ADMIN</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select
                                                    value={u.department?._id || u.department || ''}
                                                    onChange={(e) => handleUpdateUser(u._id, { department: e.target.value })}
                                                    className="bg-black/20 dark:bg-slate-950 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-slate-400 outline-none w-full max-w-[200px] border border-white/5 focus:ring-1 focus:ring-primary-500/30 transition-all"
                                                >
                                                    <option value="">UNCATEGORIZED</option>
                                                    {departments.map(d => (
                                                        <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => handleUpdateUser(u._id, { isApproved: !u.isApproved })}
                                                    className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${u.isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10 animate-pulse'}`}
                                                >
                                                    {u.isApproved ? 'Verified' : 'Verification Needed'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    {isAdmin && u._id !== user._id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"
                                                            title="Terminate Account"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {tab === 'departments' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Academic Backbone</h2>
                                <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 uppercase tracking-wider opacity-60">Manage faculty clusters and modules</p>
                            </div>
                            <button
                                onClick={() => setShowDeptModal(true)}
                                className="btn-primary px-8 py-4 text-xs rounded-2xl flex items-center gap-3 w-full sm:w-auto"
                            >
                                <Plus className="w-4 h-4" />
                                Sync Department
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
                            {departments.map(dept => (
                                <motion.div key={dept._id} whileHover={{ y: -5 }} className="card p-8 bg-slate-900/40 border-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                        <Building className="w-20 h-20 text-white" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="px-4 py-2 bg-primary-500/10 rounded-xl text-primary-400 font-black text-xs border border-primary-500/20 shadow-lg shadow-primary-500/5">
                                            {dept.code || 'SYS'}
                                        </div>
                                        <h3 className="text-xl font-black text-white tracking-tight">{dept.name}</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 relative z-10">{dept.description || 'No specialized metadata provided for this cluster.'}</p>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-600 border-t border-white/5 pt-6 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            Operational
                                        </div>
                                        <span className="opacity-40">System Node #{(dept._id.slice(-4)).toUpperCase()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Department Modal */}
            <AnimatePresence>
                {showDeptModal && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 font-sans">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative border border-white/10"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter">Sync Sector</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Register new academic footprint</p>
                                </div>
                                <button onClick={() => setShowDeptModal(false)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/20 transition-all">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateDept} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Name</label>
                                    <input
                                        placeholder="e.g. Mechanical Engineering"
                                        className="input-field"
                                        value={newDept.name}
                                        onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Code</label>
                                    <input
                                        placeholder="e.g. MECH"
                                        className="input-field"
                                        value={newDept.code}
                                        onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Functional Outline</label>
                                    <textarea
                                        placeholder="Describe the department's academic scope..."
                                        className="input-field min-h-[120px] py-4 resize-none"
                                        value={newDept.description}
                                        onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full btn-primary py-5 rounded-2xl text-lg shadow-2xl shadow-primary-500/20 uppercase tracking-widest font-black">
                                    Authorize Sector
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
