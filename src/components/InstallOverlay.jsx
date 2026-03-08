import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const InstallOverlay = () => {
    const { isInstallable, showInstallPrompt } = usePWAInstall();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isInstallable) {
            // Check if user has dismissed it recently
            const lastDismissed = localStorage.getItem('install_prompt_dismissed');
            const now = Date.now();

            // If never dismissed or dismissed more than 24 hours ago
            if (!lastDismissed || now - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
                const timer = setTimeout(() => setIsVisible(true), 2000); // Show after 2 seconds
                return () => clearTimeout(timer);
            }
        }
    }, [isInstallable]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('install_prompt_dismissed', Date.now().toString());
    };

    const handleInstall = async () => {
        await showInstallPrompt();
        setIsVisible(false); // Hide after install interaction
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

                    {/* Floating Modal / Bottom Sheet */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-[100] p-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/20">
                                    <Smartphone className="w-8 h-8" />
                                </div>

                                <h3 className="text-xl font-bold dark:text-white mb-2">
                                    Install App
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                    Install Attendly for a better experience, offline access, and instant notifications.
                                </p>

                                <button
                                    onClick={handleInstall}
                                    className="w-full btn-primary py-3 mb-3 text-base"
                                >
                                    <Download className="w-5 h-5" />
                                    Install Now
                                </button>

                                <button
                                    onClick={handleDismiss}
                                    className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default InstallOverlay;
