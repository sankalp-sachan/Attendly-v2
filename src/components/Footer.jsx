import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#050B14] border-t border-white/10 pt-20 pb-10 relative overflow-hidden z-20">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-900/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-500/10 p-3 rounded-2xl border border-primary-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <GraduationCap className="w-8 h-8 text-primary-400" />
                            </div>
                            <span className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                Attendly
                            </span>
                        </div>
                        <p className="text-slate-400 text-base leading-relaxed max-w-md font-medium">
                            Architecting the future of academic engagement through intelligent tracking,
                            seamless spatial integration, and an unparalleled cinematic user experience.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-primary-500"></span>
                            Platform
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500/0 group-hover:bg-primary-500 transition-colors"></span>
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/about-developer" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500/0 group-hover:bg-primary-500 transition-colors"></span>
                                    About Developer
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500/0 group-hover:bg-primary-500 transition-colors"></span>
                                    Documentation
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-purple-500"></span>
                            Connect
                        </h3>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/sankalp-sachan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all group"
                            >
                                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/sachansankalp2007"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all group"
                            >
                                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm font-medium text-slate-500 tracking-wide">
                        © {currentYear} Attendly. V2 Architected Context.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <span>Engineered with</span>
                        <Heart className="w-4 h-4 text-rose-500 animate-pulse fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                        <span>by</span>
                        <span className="text-white font-bold ml-1">Sankalp</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
