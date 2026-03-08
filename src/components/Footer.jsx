import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500">
                            <div className="bg-primary-600/10 p-2 rounded-xl">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                                Attendly
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                            Revolutionizing student attendance management with intelligent tracking,
                            seamless integration, and beautiful user experience. Built for modern education.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                            Platform
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/about-developer" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    About Developer
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Documentation
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                            Connect
                        </h3>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/sankalp-sachan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/sachansankalp2007"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 transition-all"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        © {currentYear} Attendly. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 animate-pulse fill-red-500" />
                        <span>by Sankalp</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
