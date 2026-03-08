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
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
    >
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            {description}
        </p>
    </motion.div>
);

const AboutApp = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <div className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header with Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm mb-6"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center max-w-2xl mx-auto"
                        >
                            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                About Attendly
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Your personal academic companion for effortless attendance tracking and management.
                            </p>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-16">

                        {/* Working Guidance Section */}
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">How It Works</h2>
                                <p className="text-slate-500 dark:text-slate-400">Simple steps to get started with Attendly</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        step: "01",
                                        title: "Create Classes",
                                        desc: "Add your subjects with target attendance percentage requirements."
                                    },
                                    {
                                        step: "02",
                                        title: "Mark Attendance",
                                        desc: "Daily updates for present, absent, or holiday status with one click."
                                    },
                                    {
                                        step: "03",
                                        title: "Track Progress",
                                        desc: "Visual analytics show you exactly where you stand with attendance goals."
                                    }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group"
                                    >
                                        <div className="absolute -right-4 -top-4 text-9xl font-black text-slate-100 dark:text-slate-800 opacity-50 z-0 select-none">
                                            {item.step}
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Key Features</h2>
                                <p className="text-slate-500 dark:text-slate-400">Everything you need to stay organized</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FeatureCard
                                    icon={Shield}
                                    title="Privacy First"
                                    description="Your data stays on your device. We use local storage to ensure your attendance records are private and secure."
                                    delay={0.1}
                                />
                                <FeatureCard
                                    icon={Zap}
                                    title="Smart Alerts"
                                    description="Get notified when your attendance drops below your target threshold, so you never miss a critical class."
                                    delay={0.2}
                                />
                                <FeatureCard
                                    icon={Smartphone}
                                    title="PWA Ready"
                                    description="Install Attendly on your mobile device for a native app-like experience. Works offline too!"
                                    delay={0.3}
                                />
                                <FeatureCard
                                    icon={Globe}
                                    title="Modern UI"
                                    description="A beautiful, responsive interface designed with the latest web technologies for a smooth experience."
                                    delay={0.4}
                                />
                                <FeatureCard
                                    icon={CheckCircle}
                                    title="Detailed Stats"
                                    description="Comprehensive insights into your attendance history, including total classes, holidays, and percentage."
                                    delay={0.5}
                                />
                                <FeatureCard
                                    icon={BookOpen}
                                    title="Academic Focus"
                                    description="Built specifically for students to manage multiple courses and academic requirements efficiently."
                                    delay={0.6}
                                />
                            </div>
                        </div>

                        {/* Vision / Mission */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="bg-gradient-to-br from-primary-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                                <h2 className="text-3xl font-bold">Built for Students, by Students</h2>
                                <p className="text-primary-100 text-lg leading-relaxed">
                                    "Attendly was born out of the need for a simple, distraction-free way to keep track of college attendance. We believe that managing your academic life shouldn't be a chore."
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
