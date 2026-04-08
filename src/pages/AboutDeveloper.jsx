 
import React from 'react';
import { motion } from 'framer-motion';
import { SiGithub, SiLinkedin, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { MdOutgoingMail } from 'react-icons/md';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const SocialLink = ({ href, icon: Icon, label, colorClass }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={`p-4 rounded-2xl transition-all border ${colorClass} backdrop-blur-md shadow-2xl relative overflow-hidden group`}
        title={label}
    >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Icon className="w-6 h-6 relative z-10" />
    </motion.a>
);

const AboutDeveloper = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary-500/30 relative overflow-hidden flex flex-col">
            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0f172a,transparent_50%)] opacity-40"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] mix-blend-screen animate-spin-slow origin-center"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="flex-grow p-4 sm:p-6 lg:p-12 relative z-10 flex flex-col">
                <div className="max-w-3xl mx-auto w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="space-y-12">
                        {/* Profile Section */}
                        <div className="text-center relative">
                            {/* Decorative background blur behind profile */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 blur-[80px] rounded-full pointer-events-none"></div>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center"
                            >
                                {/* Glowing background effect */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360],
                                    }}
                                    transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-[-10%] bg-gradient-to-r from-primary-500/40 via-purple-500/40 to-pink-500/40 rounded-full blur-[30px] opacity-70"
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
                                    className="relative w-full h-full overflow-hidden border-2 border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.3)] bg-slate-900 z-10"
                                >
                                    <img
                                        src="/developer.jpeg"
                                        alt="Sankalp Sachan"
                                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                                    />
                                </motion.div>
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 mb-4 tracking-tighter drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                            >
                                Sankalp Sachan
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                                className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm"
                            >
                                Architect / Full Stack Developer
                            </motion.p>
                        </div>

                        {/* About Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] -mr-32 -mt-32 transition-opacity opacity-0 group-hover:opacity-100"></div>
                            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest relative z-10">Creative Objective</h2>
                            <p className="text-slate-400 leading-relaxed font-medium text-lg relative z-10">
                                Passionate open-source contributor and full-stack developer dedicated to architecting beautiful, highly functional, and user-centric scalable applications. Focused on engineering solutions that merge sophisticated aesthetics with deep analytical capabilities to make a tangible difference.
                            </p>
                        </motion.div>

                        {/* Social Links - Icons Only */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-6"
                        >
                            <SocialLink
                                href="mailto:attendlyhelp@gmail.com"
                                icon={MdOutgoingMail}
                                label="Gmail"
                                colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            />
                            <SocialLink
                                href="https://wa.me/+919005432625"
                                icon={SiWhatsapp}
                                label="WhatsApp"
                                colorClass="text-emerald-500 bg-emerald-600/10 border-emerald-600/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                            />
                            <SocialLink
                                href="https://sankalpsachan.vercel.app"
                                icon={ExternalLink}
                                label="Portfolio"
                                colorClass="text-primary-400 bg-primary-500/10 border-primary-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                            />
                            <SocialLink
                                href="https://github.com/sankalp-sachan"
                                icon={SiGithub}
                                label="GitHub"
                                colorClass="text-slate-100 bg-white/5 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                            />
                            <SocialLink
                                href="https://www.linkedin.com/in/sachansankalp2007"
                                icon={SiLinkedin}
                                label="LinkedIn"
                                colorClass="text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(96,165,250,0.15)] hover:shadow-[0_0_30px_rgba(96,165,250,0.3)]"
                            />
                            <SocialLink
                                href="https://instagram.com/_sankalpsachan35_"
                                icon={SiInstagram}
                                label="Instagram"
                                colorClass="text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-[0_0_20px_rgba(244,114,182,0.15)] hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]"
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
