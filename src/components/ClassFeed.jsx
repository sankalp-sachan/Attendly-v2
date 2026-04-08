import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, MessageSquare, Megaphone, Trash2, 
    CornerDownRight, MoreVertical, Shield, User,
    Clock, AlertCircle, CheckCircle2, MessageCircle
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ClassFeed = ({ classId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMsg, setNewMsg] = useState('');
    const [msgType, setMsgType] = useState('question'); // announcement or question
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    useEffect(() => {
        fetchMessages();
    }, [classId]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/class-messages/${classId}`);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages");
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;

        setIsPosting(true);
        try {
            const { data } = await api.post(`/class-messages/${classId}`, {
                content: newMsg,
                type: isTeacher ? msgType : 'question'
            });
            setMessages([data, ...messages]);
            setNewMsg('');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post message");
        } finally {
            setIsPosting(false);
        }
    };

    const handleReply = async (messageId) => {
        if (!replyContent.trim()) return;

        try {
            const { data } = await api.post(`/class-messages/reply/${messageId}`, {
                content: replyContent
            });
            setMessages(messages.map(m => m._id === messageId ? data : m));
            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            alert("Failed to post reply");
        }
    };

    const handleDelete = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await api.delete(`/class-messages/${messageId}`);
            setMessages(messages.filter(m => m._id !== messageId));
        } catch (error) {
            alert("Failed to delete message");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 opacity-50">
            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Syncing Class Feed...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Post Input Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-slate-900/60 border-white/5 p-6 shadow-2xl overflow-visible"
            >
                <form onSubmit={handlePost} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-primary-400" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Collaborative Hub</h3>
                        </div>
                        
                        {isTeacher && (
                            <div className="flex bg-black/40 p-1 rounded-xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => setMsgType('question')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${msgType === 'question' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Question
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMsgType('announcement')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${msgType === 'announcement' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Announcement
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <textarea
                            value={newMsg}
                            onChange={(e) => setNewMsg(e.target.value)}
                            placeholder={isTeacher ? (msgType === 'announcement' ? "Broadcast a message to everyone..." : "Start a discussion or share a resource...") : "Stitch a question for your mentor..."}
                            className="input-field bg-black/20 min-h-[120px] py-4 pr-14 group-focus-within:bg-black/40 transition-all text-sm font-medium"
                        />
                        <button
                            disabled={isPosting || !newMsg.trim()}
                            className="absolute bottom-4 right-4 p-3 bg-primary-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Messages Feed */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {messages.length === 0 ? (
                        <div className="text-center p-20 bg-slate-900/40 rounded-[2.5rem] border border-dashed border-white/5">
                            <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">The frequency is silent...</p>
                        </div>
                    ) : (
                        messages.map((message, idx) => (
                            <motion.div
                                key={message._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative card p-6 md:p-8 bg-slate-900/40 border-white/5 shadow-2xl hover:border-white/10 transition-all ${message.type === 'announcement' ? 'border-l-4 border-l-emerald-500/50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                {message.sender?.profileImage ? (
                                                    <img src={message.sender.profileImage} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <User className="w-6 h-6 text-slate-500" />
                                                )}
                                            </div>
                                            {message.sender?.role === 'teacher' && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-[#0f172a] transform scale-90">
                                                    <Shield className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm tracking-tight flex items-center gap-2">
                                                {message.sender?.name}
                                                {message.type === 'announcement' && (
                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest flex items-center gap-1">
                                                        <Megaphone className="w-2.5 h-2.5" /> Announcement
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(message.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {(isTeacher || message.sender?._id === user?._id) && (
                                            <button 
                                                onClick={() => handleDelete(message._id)}
                                                className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                    {message.content}
                                </div>

                                {/* Replies Section */}
                                <div className="mt-8 space-y-4">
                                    {message.replies?.map((reply) => (
                                        <div key={reply._id} className="flex gap-4 items-start pl-6 border-l border-white/5">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black uppercase text-slate-500 flex-shrink-0">
                                                {reply.sender?.name ? reply.sender.name.charAt(0) : 'U'}
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-[1.5rem] flex-grow">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{reply.sender?.name}</span>
                                                    <span className="text-[8px] text-slate-600 font-bold">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {replyingTo === message._id ? (
                                        <div className="flex gap-3 pl-6 mt-4">
                                            <input
                                                autoFocus
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Thread a reply..."
                                                className="input-field py-3 text-xs bg-black/40 h-auto"
                                                onKeyDown={(e) => e.key === 'Enter' && handleReply(message._id)}
                                            />
                                            <button
                                                onClick={() => handleReply(message._id)}
                                                className="bg-primary-500 text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="bg-slate-800 text-white p-3 rounded-2xl transition-all"
                                            >
                                                <CornerDownRight className="w-4 h-4 transform rotate-180" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReplyingTo(message._id)}
                                            className="ml-6 flex items-center gap-2 text-[10px] font-black text-primary-400/60 hover:text-primary-400 uppercase tracking-widest transition-all"
                                        >
                                            <CornerDownRight className="w-3 h-3" />
                                            Synthesize Reply
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ClassFeed;
