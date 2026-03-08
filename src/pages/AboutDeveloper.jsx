import React from 'react';
import { motion } from 'framer-motion';
import { SiGithub, SiLinkedin, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { MdOutgoingMail } from 'react-icons/md';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SocialLink = ({ href, icon: Icon, label, colorClass }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`p-4 rounded-full transition-all ${colorClass} shadow-sm hover:shadow-md`}
        title={label}
    >
        <Icon className="w-6 h-6" />
    </motion.a>
);

import Footer from '../components/Footer';

const AboutDeveloper = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <div className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-8 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="space-y-8">
                        {/* Profile Section */}
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center"
                            >
                                {/* Glowing background effect */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360],
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-primary-500/50 via-purple-500/50 to-pink-500/50 rounded-full blur-2xl"
                                />

                                {/* Shape shifting container */}
                                <motion.div
                                    animate={{
                                        borderRadius: [
                                            "60% 40% 30% 70%/60% 30% 70% 40%",
                                            "30% 60% 70% 40%/50% 60% 30% 60%",
                                            "60% 40% 30% 70%/60% 30% 70% 40%"
                                        ]
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="relative w-full h-full overflow-hidden border-4 border-white/20 dark:border-white/10 shadow-2xl bg-slate-900"
                                >
                                    <img
                                        src="/developer.jpeg"
                                        alt="Sankalp Sachan"
                                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                    />
                                </motion.div>
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2"
                            >
                                Sankalp Sachan
                            </motion.h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                                Full Stack Developer
                            </p>
                        </div>

                        {/* About Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">About Me</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Passionate open-source contributor and full-stack developer dedicated to building beautiful, functional, and user-centric applications. Creating solutions that make a difference.
                            </p>
                        </motion.div>

                        {/* Social Links - Icons Only */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <SocialLink
                                href="mailto:attendlyhelp@gmail.com"
                                icon={MdOutgoingMail}
                                label="Gmail"
                                colorClass="text-green-500 hover:text-green-600 bg-green-500/10 hover:bg-green-500/20"
                            />
                            <SocialLink
                                href="https://wa.me/+919005432625"
                                icon={SiWhatsapp}
                                label="WhatsApp"
                                colorClass="text-green-500 hover:text-green-600 bg-green-500/10 hover:bg-green-500/20"
                            />
                            <SocialLink
                                href="https://sankalpsachan.vercel.app"
                                icon={ExternalLink}
                                label="Portfolio"
                                colorClass="text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-600/20"
                            />
                            <SocialLink
                                href="https://github.com/sankalp-sachan"
                                icon={SiGithub}
                                label="GitHub"
                                colorClass="text-slate-800 dark:text-white hover:text-slate-600 bg-slate-500/10 hover:bg-slate-500/20"
                            />
                            <SocialLink
                                href="https://www.linkedin.com/in/sachansankalp2007"
                                icon={SiLinkedin}
                                label="LinkedIn"
                                colorClass="text-blue-600 hover:text-blue-700 bg-blue-600/10 hover:bg-blue-600/20"
                            />
                            <SocialLink
                                href="https://instagram.com/_sankalpsachan35_"
                                icon={SiInstagram}
                                label="Instagram"
                                colorClass="text-pink-600 hover:text-pink-700 bg-pink-600/10 hover:bg-pink-600/20"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutDeveloper;
