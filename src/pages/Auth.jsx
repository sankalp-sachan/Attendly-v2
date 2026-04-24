import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [institute, setInstitute] = useState('');
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);

    const { login, register, googleLogin, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login Flow
                await login(email, password);
                navigate('/');
            } else {
                // Register Flow
                await register(email, password, name, institute, role, department);
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const userData = await googleLogin(credentialResponse.credential);
            if (userData.institute === 'Google User' || !userData.institute) {
                setIsOnboarding(true);
                setLoading(false);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || "Google Login Failed");
            setLoading(false);
        }
    };

    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await updateUserProfile({ institute });
            navigate('/');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-[#020617] flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden font-sans">
            {/* Ultra-Cinematic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-600/20 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-150 mix-blend-overlay"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 bg-white/5 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
            >
                {/* Holographic Scan Beam */}
                <motion.div
                    animate={{
                        top: ["-100%", "200%"],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "linear"
                    }}
                    className="absolute left-0 right-0 h-[30%] bg-gradient-to-b from-transparent via-primary-500/10 to-transparent pointer-events-none z-20"
                />

                {/* Branding Section */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-primary-600/10 to-transparent relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.2),transparent)] group-hover:scale-150 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="bg-primary-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/50 mb-10"
                        >
                            <GraduationCap className="w-8 h-8" />
                        </motion.div>
                        <h2 className="text-6xl font-black text-white leading-none tracking-tighter mb-6">
                            Smart <br />
                            Attendance <br />
                            <span className="text-primary-500">Simplified.</span>
                        </h2>
                        <p className="text-slate-400 text-lg font-medium max-w-xs leading-relaxed">
                            Log in to access your dashboard, track classes, and manage attendance with ease.
                        </p>
                    </div>

                    <div className="relative z-10 mt-20">
                        {/* Premium Developer Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-40 animate-pulse"></div>
                                <div className="relative w-12 h-12 rounded-full border border-white/20 bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(79,70,229,0.3),transparent)] animate-spin-slow"></div>
                                    <User className="w-6 h-6 text-primary-400 relative z-10" />
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* Auth Form Section */}
                <div className="p-6 md:p-12 lg:p-16 flex flex-col justify-center bg-white/5 lg:border-l border-white/5">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="bg-primary-600 p-2.5 rounded-xl text-white shadow-xl shadow-primary-500/20">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Attendly</h1>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                            {isOnboarding ? 'Complete Profile' : (isLogin ? 'Welcome Back.' : 'Get Started.')}
                        </h3>
                        {/* Tab Switcher - Compact */}
                        {!isOnboarding && (
                            <div className="flex bg-slate-800/50 p-1 rounded-xl md:rounded-2xl mt-5 w-fit border border-white/5 relative">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all relative z-10 ${isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Log In
                                    {isLogin && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary-600 rounded-lg md:rounded-xl shadow-lg shadow-primary-500/20 z-[-1]"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all relative z-10 ${!isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Register
                                    {!isLogin && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary-600 rounded-lg md:rounded-xl shadow-lg shadow-primary-500/20 z-[-1]"
                                        />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5 md:space-y-6">
                        {isOnboarding ? (
                            <form onSubmit={handleOnboardingSubmit} className="space-y-5 md:space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Institute Verification</label>
                                    <div className="relative group">
                                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                        <input type="text" required value={institute} onChange={e => setInstitute(e.target.value)} placeholder="University Name" className="input-field pl-12" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full btn-primary py-4 md:py-5 rounded-2xl text-base md:text-lg shadow-2xl shadow-primary-500/20">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Complete Setup'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                <AnimatePresence mode="wait">
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-5 md:space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Identity</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                                    <input type="text" required={!isLogin} value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="input-field pl-12" />
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/30 p-1.5 rounded-2xl md:rounded-[2rem] border border-white/5 grid grid-cols-2 gap-1.5 md:gap-2">
                                                <button type="button" onClick={() => setRole('student')} className={`py-2.5 md:py-3 rounded-xl md:rounded-[1.5rem] text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${role === 'student' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:text-white'}`}>Student</button>
                                                <button type="button" onClick={() => setRole('teacher')} className={`py-2.5 md:py-3 rounded-xl md:rounded-[1.5rem] text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${role === 'teacher' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:text-white'}`}>Teacher</button>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Academic Institute</label>
                                                <div className="relative group">
                                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                                    <input type="text" required={!isLogin} value={institute} onChange={e => setInstitute(e.target.value)} placeholder="e.g. SRM University" className="input-field pl-12" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4 md:space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Account Access</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="input-field pl-12" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Keyword</label>
                                            {isLogin && <button type="button" className="text-[8px] md:text-[9px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400 transition-colors">Forgot?</button>}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-12" />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-xl md:rounded-2xl text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 md:gap-3">
                                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-red-500 rounded-full animate-pulse" />
                                        {error}
                                    </motion.div>
                                )}

                                <button type="submit" disabled={loading} className="w-full btn-primary py-4 md:py-5 rounded-xl md:rounded-[2rem] text-base md:text-lg shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden group">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <span className="relative z-10">{isLogin ? 'Open Dashboard' : 'Create My Account'}</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {!isOnboarding && (
                            <div className="pt-4 md:pt-6 relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-600">
                                    <span className="bg-[#0f172a] px-3 md:px-4 rounded-full">Secure Gateway</span>
                                </div>
                                <div className="mt-6 md:mt-8 flex justify-center w-full bg-slate-800/40 hover:bg-slate-800/60 transition-colors border border-white/5 p-3 md:p-4 rounded-2xl md:rounded-3xl cursor-pointer overflow-hidden">
                                    <div className="scale-90 md:scale-100">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setError('Gateway Access Refused')}
                                            theme="filled_blue"
                                            shape="circle"
                                            width="280"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Footer Attribution - Mobile Only */}
            <div className="lg:hidden mt-6 text-center space-y-3">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Encrypted Protocol AES-256</p>
                <a
                    href="https://sankalpsachan.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1.5 rounded-full border border-white/5"
                >
                    <span className="text-[9px] font-black text-slate-500">By Sankalp Sachan</span>
                </a>
            </div>
        </div>
    );
};

export default Auth;

