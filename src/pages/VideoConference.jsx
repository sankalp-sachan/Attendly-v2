import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';
import api from '../utils/api';

const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const VideoConference = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const queryParams = new URLSearchParams(location.search);
    const classId = queryParams.get('classId');
    const onlineClassId = queryParams.get('onlineClassId');
    const isTeacher = user?.role === 'teacher';

    const [isEnding, setIsEnding] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState({}); // socketId -> { name, stream }
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [screenShareActive, setScreenShareActive] = useState(false);

    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const peerConnections = useRef({}); // socketId -> RTCPeerConnection
    const streamRef = useRef(null);
    const screenStreamRef = useRef(null);

    const handleLeave = () => {
        cleanup();
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
            handleLeave();
        }
    };

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

    useEffect(() => {
        const initMediaAndSocket = async () => {
            try {
                // Get User Media
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                streamRef.current = stream;
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Connect to socket signaling server
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const socketUrl = isLocal ? 'http://localhost:5000' : 'https://attendly-v2-backend.onrender.com';
                socketRef.current = io(socketUrl);

                socketRef.current.emit('join-room', {
                    roomId,
                    userId: user?._id,
                    name: user?.name || 'User'
                });

                // 1. Receive existing users list
                socketRef.current.on('all-users', (users) => {
                    users.forEach(otherUser => {
                        createPeerConnection(otherUser.socketId, otherUser.name, true);
                    });
                });

                // 2. New user joined
                socketRef.current.on('user-joined', ({ socketId, name }) => {
                    createPeerConnection(socketId, name, false);
                });

                // 3. Receive WebRTC Offer
                socketRef.current.on('receive-offer', async ({ offer, senderSocketId, senderName }) => {
                    const pc = createPeerConnection(senderSocketId, senderName, false);
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socketRef.current.emit('send-answer', { targetSocketId: senderSocketId, answer });
                });

                // 4. Receive WebRTC Answer
                socketRef.current.on('receive-answer', async ({ answer, senderSocketId }) => {
                    const pc = peerConnections.current[senderSocketId];
                    if (pc) {
                        await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    }
                });

                // 5. Receive ICE Candidate
                socketRef.current.on('receive-ice-candidate', async ({ candidate, senderSocketId }) => {
                    const pc = peerConnections.current[senderSocketId];
                    if (pc) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                // 6. User disconnected
                socketRef.current.on('user-disconnected', ({ socketId }) => {
                    if (peerConnections.current[socketId]) {
                        peerConnections.current[socketId].close();
                        delete peerConnections.current[socketId];
                    }
                    setRemoteUsers(prev => {
                        const updated = { ...prev };
                        delete updated[socketId];
                        return updated;
                    });
                });

            } catch (err) {
                console.error("Failed to acquire user media", err);
                alert("Please enable camera and microphone access to join the class.");
                handleLeave();
            }
        };

        initMediaAndSocket();

        return () => cleanup();
    }, [roomId]);

    const createPeerConnection = (socketId, remoteName, isInitiator) => {
        if (peerConnections.current[socketId]) {
            return peerConnections.current[socketId];
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnections.current[socketId] = pc;

        // Add local tracks to peer connection
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, streamRef.current);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('send-ice-candidate', {
                    targetSocketId: socketId,
                    candidate: event.candidate
                });
            }
        };

        // Handle remote streams
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteUsers(prev => ({
                ...prev,
                [socketId]: { name: remoteName, stream: remoteStream }
            }));
        };

        // If initiator, send offer
        if (isInitiator) {
            pc.onnegotiationneeded = async () => {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socketRef.current.emit('send-offer', {
                        targetSocketId: socketId,
                        offer,
                        senderName: user?.name || 'User'
                    });
                } catch (e) {
                    console.error("Failed to create offer", e);
                }
            };
        }

        return pc;
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoMuted(!videoTrack.enabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!screenShareActive) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                setScreenShareActive(true);

                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                Object.values(peerConnections.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                // Handle screen share stop from browser bar
                screenTrack.onended = () => {
                    stopScreenShare();
                };
            } catch (e) {
                console.error("Failed screen share", e);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setScreenShareActive(false);

        // Revert back to local camera track
        if (streamRef.current) {
            const cameraTrack = streamRef.current.getVideoTracks()[0];
            Object.values(peerConnections.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(cameraTrack);
                }
            });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = streamRef.current;
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary-600/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[130px] rounded-full" />
            </div>

            <header className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 p-4 md:px-8 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                    <button onClick={handleLeave} className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            <h1 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase leading-none">Custom Classroom Node</h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTeacher ? (
                        <button onClick={handleEndClassForAll} disabled={isEnding} className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase flex items-center gap-2 tracking-widest shadow-lg shadow-rose-500/20 transition-all">
                            <PhoneOff className="w-4 h-4" />
                            <span>{isEnding ? 'Ending...' : 'End for All'}</span>
                        </button>
                    ) : (
                        <button onClick={handleLeave} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase flex items-center gap-2 tracking-widest border border-white/5 transition-all">
                            <PhoneOff className="w-4 h-4" />
                            <span>Leave</span>
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 relative z-10 p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {/* Local Video */}
                <div className="relative bg-slate-950/80 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden aspect-video flex flex-col justify-end">
                    <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="relative p-6 flex items-center justify-between z-20">
                        <span className="text-xs font-black uppercase tracking-widest text-white/90 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                            You ({user?.name || 'User'})
                        </span>
                    </div>
                </div>

                {/* Remote Videos */}
                {Object.entries(remoteUsers).map(([socketId, data]) => (
                    <div key={socketId} className="relative bg-slate-950/80 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden aspect-video flex flex-col justify-end">
                        <RemoteVideo stream={data.stream} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="relative p-6 flex items-center justify-between z-20">
                            <span className="text-xs font-black uppercase tracking-widest text-white/90 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                                {data.name}
                            </span>
                        </div>
                    </div>
                ))}
            </main>

            {/* Floating Controls Bar */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
                <button onClick={toggleAudio} className={`p-4 rounded-2xl transition-all ${audioMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                    {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-2xl transition-all ${videoMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                    {videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <button onClick={toggleScreenShare} className={`p-4 rounded-2xl transition-all ${screenShareActive ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                    {screenShareActive ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

const RemoteVideo = ({ stream }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />;
};

export default VideoConference;
