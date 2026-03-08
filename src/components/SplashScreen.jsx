import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <div className="bg-primary-600 p-6 rounded-3xl text-white shadow-2xl shadow-primary-500/20 mb-6 relative">
                    {/* Outer ring effect similar to the screenshot */}
                    <div className="absolute inset-0 border-4 border-white/20 rounded-3xl -m-1"></div>
                    <GraduationCap className="w-16 h-16" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                    ATTENDLY
                </h1>
            </motion.div>

            <div className="absolute bottom-10 flex flex-col items-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-400">
                    Developed by
                </p>
                <p className="text-sm font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                    Sankalp Sachan
                </p>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
