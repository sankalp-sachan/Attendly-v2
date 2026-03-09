import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Shield, Zap, Smartphone, Globe, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="card bg-slate-900/40 p-8 pt-10 rounded-[2.5rem] border border-white/5 shadow-2xl group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 mb-6 border border-primary-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-medium text-sm">
            {description}
        </p>
    </motion.div>
);

const AboutApp = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary-500/30 relative overflow-hidden flex flex-col">
            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0f172a,transparent_50%)] opacity-40"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] mix-blend-screen animate-spin-slow origin-center"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="flex-grow p-4 sm:p-6 lg:p-12 relative z-10 flex flex-col">
                <div className="max-w-6xl mx-auto w-full">
                    {/* Header with Back Button */}
                    <div className="mb-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm mb-10 group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center max-w-3xl mx-auto"
                        >
                            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 mb-6 tracking-tighter drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                About Attendly
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 font-bold uppercase tracking-[0.2em]">
                                Your personal academic companion for effortless attendance tracking and management.
                            </p>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-24">

                        {/* Working Guidance Section */}
                        <div className="space-y-12">
                            <div className="text-center">
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">System Architecture</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Sequence of Operations</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        step: "01",
                                        title: "Initialize Nodes",
                                        desc: "Add your subjects with target attendance percentage requirements to the blockchain."
                                    },
                                    {
                                        step: "02",
                                        title: "Log Data",
                                        desc: "Daily updates for present, absent, or holiday status with encrypted one-click hashing."
                                    },
                                    {
                                        step: "03",
                                        title: "Analyze Output",
                                        desc: "Visual analytics show you exactly where you stand with calculated goals and trends."
                                    }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative p-8 md:p-10 bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-2xl backdrop-blur-sm hover:border-white/10 transition-colors"
                                    >
                                        <div className="absolute right-[-10%] top-[-10%] text-[10rem] font-black text-white/5 z-0 select-none group-hover:scale-110 transition-transform duration-700">
                                            {item.step}
                                        </div>
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl mb-6 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                                                {item.step}
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{item.title}</h3>
                                            <p className="text-slate-400 leading-relaxed font-medium text-sm">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="space-y-12">
                            <div className="text-center">
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Core Specifications</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Feature Arsenal Modules</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FeatureCard
                                    icon={Shield}
                                    title="Privacy First"
                                    description="Your data stays encrypted. We use secure storage protocols to ensure your attendance records are private."
                                    delay={0.1}
                                />
                                <FeatureCard
                                    icon={Zap}
                                    title="Smart Alerts"
                                    description="Get push notifications when your engagement metric drops below critical thresholds."
                                    delay={0.2}
                                />
                                <FeatureCard
                                    icon={Smartphone}
                                    title="Progressive App"
                                    description="Deploy Attendly on any interface for a native app equivalent experience. Offline mode embedded."
                                    delay={0.3}
                                />
                                <FeatureCard
                                    icon={Globe}
                                    title="Cinematic UI"
                                    description="A high-fidelity, responsive interface engineered using spatial computing design principles."
                                    delay={0.4}
                                />
                                <FeatureCard
                                    icon={CheckCircle}
                                    title="Deep Analytics"
                                    description="Comprehensive insights into your history, visualizing total sessions, holidays, and indices."
                                    delay={0.5}
                                />
                                <FeatureCard
                                    icon={BookOpen}
                                    title="Academic AI"
                                    description="Algorithmic focus built exclusively to manage multi-course parameters and requirements."
                                    delay={0.6}
                                />
                            </div>
                        </div>

                        {/* Vision / Mission */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="bg-gradient-to-br from-indigo-900/40 to-primary-900/40 rounded-[3rem] p-10 sm:p-16 text-center text-white relative overflow-hidden border border-white/5 shadow-2xl backdrop-blur-md"
                        >
                            <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[80px]"></div>
                            <div className="absolute bottom-[-50%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[80px]"></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Engineered for Excellence</h2>
                                <p className="text-slate-300 md:text-xl leading-relaxed font-medium">
                                    "Attendly was architected out of the necessity for a streamlined, noise-free method to track academic engagement. We assert that managing institutional metrics should be elegant, fluid, and completely autonomous."
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutApp;
