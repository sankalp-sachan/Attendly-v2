import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, PhoneOff, Users, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const VideoConference = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    // Extract state passed from navigation
    const queryParams = new URLSearchParams(location.search);
    const classId = queryParams.get('classId');
    const onlineClassId = queryParams.get('onlineClassId');
    const isTeacher = user?.role === 'teacher';

    const [isEnding, setIsEnding] = useState(false);

    const handleLeave = () => {
        if (classId) {
            navigate(isTeacher ? `/teacher/classes/${classId}` : `/student/classes/${classId}`);
        } else {
            navigate(isTeacher ? '/teacher' : '/student');
        }
    };

    const handleEndClassForAll = async () => {
        if (!onlineClassId) return handleLeave();
        
        setIsEnding(true);
        try {
            await api.put(`/online-classes/${onlineClassId}/status`, { status: 'ended' });
            handleLeave();
        } catch (error) {
            console.error("Failed to end class", error);
            handleLeave();
        } finally {
            setIsEnding(false);
        }
    };

    // Jitsi meet URL construction
    const jitsiUrl = `https://meet.jit.si/${roomId}#userInfo.displayName="${encodeURIComponent(user?.name || 'User')}"&userInfo.email="${encodeURIComponent(user?.email || '')}"&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col font-sans relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary-600/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[130px] rounded-full" />
            </div>

            {/* Top Navigation Panel */}
            <header className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 p-4 md:px-8 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLeave}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            <h1 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase leading-none">
                                Live Online Class
                            </h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">
                            Secure encrypted node
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTeacher ? (
                        <button
                            onClick={handleEndClassForAll}
                            disabled={isEnding}
                            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
                        >
                            <PhoneOff className="w-4 h-4" />
                            <span>{isEnding ? 'Ending...' : 'End for All'}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleLeave}
                            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-white/5 transition-all"
                        >
                            <PhoneOff className="w-4 h-4" />
                            <span>Leave</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Video Frame */}
            <main className="flex-1 relative z-10 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <div className="w-full h-full max-w-7xl aspect-[16/9] md:aspect-auto md:h-[calc(100vh-140px)] bg-slate-950/80 rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                    <iframe
                        src={jitsiUrl}
                        title="Live Video Conference"
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="w-full h-full border-none"
                    />
                </div>
            </main>
        </div>
    );
};

export default VideoConference;
