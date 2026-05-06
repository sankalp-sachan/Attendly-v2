import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [section, setSection] = useState('');
    const [year, setYear] = useState('');
    const [institute, setInstitute] = useState('');
    const [departmentsList, setDepartmentsList] = useState([]);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { changePassword, logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const { data } = await api.get('/admin/departments');
                setDepartmentsList(data);
            } catch (err) {
                console.error("Failed to fetch departments");
            }
        };
        fetchDepts();
        
        // Pre-fill fields if they exist
        if (user) {
            setName(user.name?.startsWith('Student ') ? '' : user.name || '');
            setEmail(user.email?.endsWith('@attendly.com') ? '' : user.email || '');
            setInstitute(user.institute || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (newPassword.length < 6) {
            return setError('New password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await api.put('/users/change-password', {
                currentPassword,
                newPassword,
                name,
                email,
                department,
                section,
                year,
                institute
            });
            
            setSuccess('Profile completed successfully! Redirecting...');
            setTimeout(() => {
                // Refresh local storage user data or logout/login
                window.location.reload(); // Simplest way to refresh auth state
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-[#020617] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10 my-10"
            >
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/50 mb-6">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter text-center uppercase">
                            Complete Your Profile
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 text-center">
                            Please fill in your details and set a new password to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Profile Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Full Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Email Address</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Department</label>
                                <select required value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50">
                                    <option value="">Select Department</option>
                                    {departmentsList.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Section</label>
                                <input type="text" required value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. A" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Year</label>
                                <input type="text" required value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2nd Year" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Institute Name</label>
                                <input type="text" required value={institute} onChange={e => setInstitute(e.target.value)} placeholder="e.g. SRM University" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-white/5 pt-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Current (Temporary) Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Temporary Password" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500/50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">New Password</label>
                                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Confirm Password</label>
                                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary-500/50" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4" />
                                {success}
                            </motion.div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-primary-600 hover:bg-primary-500 py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    <span>Save & Start Using Attendly</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                        <button 
                            onClick={logout}
                            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                        >
                            Sign Out and Setup Later
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ChangePassword;
