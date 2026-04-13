import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Attendly AI. How can I help you with your classes or attendance today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState(() => localStorage.getItem('ai-assistant-pos') || 'bottom-right');
    const chatEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        localStorage.setItem('ai-assistant-pos', position);
    }, [position]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/college/ai/chat', {
                messages: [...messages, userMsg].slice(-6) // Keep context short
            });
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            const detail = error.response?.data?.details ? ` (${error.response.data.details})` : "";
            setMessages(prev => [...prev, { role: 'assistant', content: `I'm having trouble connecting right now.${detail} Please ensure your API key is correctly set in the server environment.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Toggle Button Wrapper */}
            <div className={`fixed bottom-0 left-0 right-0 p-6 flex pointer-events-none z-[99999] ${position === 'bottom-right' ? 'justify-end' : 'justify-start'}`}>
                <motion.button
                    layout
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className={`w-14 h-14 rounded-full bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center border border-white/20 transition-all pointer-events-auto ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                >
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <div className={`absolute -top-1 ${position === 'bottom-right' ? '-right-1' : '-left-1'} w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#020617]`} />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className={`fixed bottom-0 left-0 right-0 p-6 flex pointer-events-none z-[10000] ${position === 'bottom-right' ? 'justify-end' : 'justify-start'}`}>
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="w-[350px] md:w-[400px] h-[550px] bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-600 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Attendly AI</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            <span className="text-[8px] text-white/70 font-bold uppercase tracking-[0.2em]">Active Inference Engine</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPosition(prev => prev === 'bottom-right' ? 'bottom-left' : 'bottom-right')}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white flex items-center gap-2 mr-2"
                                        title="Change Position"
                                    >
                                        <div className="flex gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${position === 'bottom-left' ? 'bg-white' : 'bg-white/20'}`} />
                                            <div className={`w-1.5 h-1.5 rounded-full ${position === 'bottom-right' ? 'bg-white' : 'bg-white/20'}`} />
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/50">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx}
                                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${msg.role === 'user' ? 'bg-primary-500' : 'bg-slate-800'} text-white shadow-lg`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                                ? 'bg-primary-600 text-white rounded-tr-none' 
                                                : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-white shadow-lg">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-6 bg-slate-900/50 border-t border-white/5 flex gap-3">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistant;
