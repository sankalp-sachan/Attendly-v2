
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SessionWarning = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { user, logout } = useAuth(); // Assuming 'logout' is available in useAuth context to check state or offer action

    useEffect(() => {
        // Only show if user is logged in
        if (user) {
            const lastShown = localStorage.getItem('session_warning_shown');
            const now = Date.now();

            // Show if never shown or if 24 hours have passed since last shown
            if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
                // Add a small delay so it doesn't pop up INSTANTLY on load
                const timer = setTimeout(() => setIsVisible(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('session_warning_shown', Date.now().toString());
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/40 z-[99] backdrop-blur-sm"
                    />

                    {/* Warning Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-amber-100 dark:border-amber-900/30 w-full max-w-sm pointer-events-auto relative overflow-hidden">

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400 shadow-md">
                                    <AlertTriangle className="w-7 h-7" />
                                </div>

                                <h3 className="text-lg font-bold dark:text-white mb-2">
                                    Missing Classes?
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                    If you are not seeing your classes, please <span className="font-semibold text-slate-900 dark:text-white">logout</span> and login again to refresh your session.
                                </p>

                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors text-sm"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SessionWarning;
