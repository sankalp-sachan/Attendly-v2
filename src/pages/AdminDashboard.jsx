import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Users, Trash2, LogOut, Search, Building, Plus, User as UserIcon, List
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
            await api.put(`/admin/users/${userId}/role`, updates);
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full glass border-b dark:border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Shield className="w-10 h-10 text-primary-600" />
                            <div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                    ADMIN CONSOLE
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {isAdmin ? 'Full Access' : 'Assistant Access'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={logout} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className="card bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none relative overflow-hidden group shadow-2xl shadow-primary-500/20"
                    >
                        <Users className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Total Managed Users</h3>
                        <p className="text-5xl font-black tracking-tighter">{users.length}</p>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full">Across all roles</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5 }}
                        className="card dark:bg-slate-900 border-none relative overflow-hidden group shadow-xl"
                    >
                        <Building className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Departments</h3>
                        <p className="text-5xl font-black tracking-tighter dark:text-white">{departments.length}</p>
                        <p className="mt-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">Active Academic Units</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5 }}
                        className="card dark:bg-slate-900 border-none relative overflow-hidden group shadow-xl"
                    >
                        <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">System Status</h3>
                        <p className="text-5xl font-black tracking-tighter dark:text-white">Active</p>
                        <p className="mt-2 text-xs font-bold text-amber-500 uppercase tracking-widest">Online & Secure</p>
                    </motion.div>
                </div>

                {/* Dashboard Nav */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-none">
                    {['users', 'departments'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-8 py-4 rounded-2xl font-black transition-all capitalize whitespace-nowrap ${tab === t ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 'users' && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field pl-14"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-24">Identify</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile & Credentials</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role Level</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Dept</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Access Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-primary-500/5 transition-colors group">
                                            <td className="px-8 py-6 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto group-hover:scale-110 transition-transform duration-500">
                                                    <UserIcon className="w-7 h-7" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black dark:text-white text-lg tracking-tight leading-none mb-1">{u.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                                                    className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-primary-600 outline-none w-fit border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-primary-500"
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
                                                    className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 outline-none w-full border border-slate-100 dark:border-white/5"
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
                                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.isApproved ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-lg shadow-amber-500/10'}`}
                                                >
                                                    {u.isApproved ? 'Verified' : 'Review Required'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {isAdmin && u._id !== user._id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            className="p-3 bg-red-500/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                            title="Terminate User Account"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'departments' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black dark:text-white">College Departments</h2>
                            <button
                                onClick={() => setShowDeptModal(true)}
                                className="btn-primary"
                            >
                                <Plus className="w-5 h-5" />
                                Add Department
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments.map(dept => (
                                <div key={dept._id} className="card p-8 border-l-4 border-primary-500 shadow-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 font-black">
                                            {dept.code || 'DEPT'}
                                        </div>
                                        <h3 className="text-xl font-bold dark:text-white">{dept.name}</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{dept.description || 'No description provided.'}</p>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                                        {/* Placeholder stats */}
                                        <span>Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Department Modal */}
            {showDeptModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl">
                        <h2 className="text-2xl font-black mb-6 dark:text-white">New Department</h2>
                        <form onSubmit={handleCreateDept} className="space-y-4">
                            <input
                                placeholder="Department Name (e.g. Computer Science)"
                                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none dark:text-white"
                                value={newDept.name}
                                onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Short Code (e.g. CSE)"
                                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none dark:text-white"
                                value={newDept.code}
                                onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none dark:text-white h-32"
                                value={newDept.description}
                                onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                            />
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 py-4 font-black text-slate-400">Cancel</button>
                                <button type="submit" className="flex-1 py-4 btn-primary rounded-2xl shadow-lg shadow-primary-500/30">Create</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
