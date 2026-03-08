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
                {/* Dashboard Nav */}
                <div className="flex gap-4 mb-8">
                    {['users', 'departments'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-3 rounded-2xl font-black transition-all capitalize ${tab === t ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary-500 dark:text-white shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-xl overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center w-16">Avatar</th>
                                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User Details</th>
                                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role Assigned</th>
                                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Department</th>
                                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold dark:text-white leading-tight">{u.name}</p>
                                                <p className="text-xs text-slate-500 leading-tight">{u.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                                                    className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-black uppercase text-primary-600 outline-none w-full"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="cr">CR</option>
                                                    <option value="mentor">Mentor</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="hod">HOD</option>
                                                    <option value="assistant_admin">Assistant</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.department?._id || u.department || ''}
                                                    onChange={(e) => handleUpdateUser(u._id, { department: e.target.value })}
                                                    className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none w-full"
                                                >
                                                    <option value="">None</option>
                                                    {departments.map(d => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleUpdateUser(u._id, { isApproved: !u.isApproved })}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                                                >
                                                    {u.isApproved ? 'Approved' : 'Pending'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isAdmin && u._id !== user._id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            className="p-2 text-slate-400 hover:text-red-500 transition-all"
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
