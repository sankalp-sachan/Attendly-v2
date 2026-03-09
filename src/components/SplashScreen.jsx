import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
    const [phase, setPhase] = useState(0); // 0: Ambient, 1: Reveal, 2: Exit
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        let width, height, particles = [];

        const setup = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(dpr, dpr);

            // Fewer, larger, high-quality "Bokeh" particles
            particles = Array.from({ length: 80 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 40 + 20,
                color: Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.03)' : 'rgba(34, 211, 238, 0.03)',
                noise: Math.random() * 1000
            }));
        };

        setup();
        window.addEventListener('resize', setup);

        let animationFrame;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -p.size) p.x = width + p.size;
                if (p.x > width + p.size) p.x = -p.size;
                if (p.y < -p.size) p.y = height + p.size;
                if (p.y > height + p.size) p.y = -p.size;

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        const timers = [
            setTimeout(() => setPhase(1), 800),
            setTimeout(() => setPhase(2), 5500),
            setTimeout(() => onFinish && onFinish(), 7000)
        ];

        return () => {
            window.removeEventListener('resize', setup);
            cancelAnimationFrame(animationFrame);
            timers.forEach(clearTimeout);
        };
    }, [onFinish]);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center overflow-hidden"
        >
            {/* Cinematic Background Atmosphere */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />

            {/* Moving Ambient Light */}
            <motion.div
                animate={{
                    x: ['-20%', '20%', '-20%'],
                    y: ['-10%', '10%', '-10%'],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-[150vw] h-[150vh] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.1)_0%,_transparent_60%)] blur-3xl pointer-events-none"
            />

            {/* Main Content Layout */}
            <AnimatePresence>
                {phase === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                        className="relative z-10 flex flex-col items-center justify-center w-full px-8"
                    >
                        {/* Decorative HUD Elements */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <motion.div
                                initial={{ rotate: 0, scale: 0.8 }}
                                animate={{ rotate: 360, scale: 1 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="w-[600px] h-[600px] border border-cyan-500/20 rounded-full flex items-center justify-center"
                                style={{ borderStyle: 'dotted' }}
                            >
                                <div className="w-[400px] h-[400px] border border-indigo-500/10 rounded-full" />
                            </motion.div>
                        </div>

                        {/* Staggered Branding Reveal */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                            }}
                            className="flex flex-col items-center"
                        >
                            <motion.img
                                src="/pwa-192x192.png"
                                alt="Logo"
                                variants={{
                                    hidden: { opacity: 0, scale: 0.5 },
                                    visible: { opacity: 1, scale: 1 }
                                }}
                                className="w-16 h-16 md:w-20 md:h-20 mb-8 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                            />

                            <motion.span
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="text-cyan-400 text-[10px] md:text-sm font-black tracking-[1em] uppercase mb-12 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                            >
                                System Core Active
                            </motion.span>

                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.08 } }
                                }}
                                className="relative group perspective-1000 flex gap-2 md:gap-4"
                            >
                                {"ATTENDLY".split("").map((char, i) => (
                                    <motion.span
                                        key={i}
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.5, y: 20, rotateX: 90 },
                                            visible: {
                                                opacity: 1,
                                                scale: 1,
                                                y: 0,
                                                rotateX: 0,
                                                transition: { type: "spring", damping: 12, stiffness: 100 }
                                            }
                                        }}
                                        className="text-6xl md:text-9xl font-black tracking-tighter text-white relative z-20 inline-block"
                                    >
                                        {char}
                                    </motion.span>
                                ))}

                                {/* Glow behind text */}
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { scale: 0.5, opacity: 0 },
                                        visible: {
                                            scale: 1,
                                            opacity: 1,
                                            transition: { delay: 1.5, duration: 2 }
                                        }
                                    }}
                                    className="absolute -inset-10 bg-indigo-500/20 blur-[80px] rounded-full z-10"
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 0.3, 0],
                                        backgroundPosition: ['-200% 0', '200% 0']
                                    }}
                                    transition={{
                                        delay: 2.5,
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 z-30 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)',
                                        backgroundSize: '200% 100%'
                                    }}
                                />
                            </motion.div>

                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 1.2 } }
                                }}
                                className="mt-24 flex flex-col items-center"
                            >
                                <motion.div
                                    variants={{
                                        hidden: { width: 0, opacity: 0 },
                                        visible: {
                                            width: '240px',
                                            opacity: 1,
                                            transition: { duration: 1.5, ease: "circOut", delay: 1 }
                                        }
                                    }}
                                    className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
                                />

                                {/* High-Tech Loading Data Feed */}
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 10 },
                                        visible: { opacity: 1, y: 0, transition: { delay: 1.2 } }
                                    }}
                                    className="mt-8 flex flex-col items-center w-64"
                                >
                                    <div className="w-full flex justify-between items-end mb-2">
                                        <div className="flex flex-col">
                                            <motion.span
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="text-[8px] text-cyan-500 font-mono uppercase tracking-[0.2em]"
                                            >
                                                Initializing...
                                            </motion.span>
                                            <span className="text-[10px] text-white/40 font-mono uppercase tracking-[0.1em]">
                                                Secure Link: 0x82A
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-indigo-400 font-mono font-bold">
                                                LOAD: 100%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Minimalist Progress Bar */}
                                    <div className="w-full h-[2px] bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, delay: 1.2, ease: "easeInOut" }}
                                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                        />
                                    </div>

                                    <div className="w-full mt-2 flex justify-between text-[7px] text-slate-600 font-mono uppercase tracking-widest">
                                        <span>Status: Core Ready</span>
                                        <span className="animate-pulse flex items-center gap-1">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Live
                                        </span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 2.2 } }
                                    }}
                                    className="mt-10 flex items-center gap-6"
                                >
                                    <div className="h-px w-8 bg-slate-800" />
                                    <div className="flex gap-2">
                                        {["Developed", "by", "Sankalp", "Sachan"].map((word, i) => (
                                            <motion.span
                                                key={word}
                                                variants={{
                                                    hidden: { opacity: 0, y: 5 },
                                                    visible: { opacity: 1, y: 0 }
                                                }}
                                                className="text-[10px] md:text-xs text-slate-400 tracking-[0.3em] font-medium uppercase font-sans"
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </div>
                                    <div className="h-px w-8 bg-slate-800" />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vertical Scanning Glitch Effect */}
            <motion.div
                animate={{ top: ['-20%', '120%'], opacity: [0, 0.5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent z-[50]"
            />

            {/* Cinematic Lens Flare */}
            <motion.div
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 w-32 h-32 bg-cyan-500/5 blur-[80px] z-50 rounded-full"
            />
        </motion.div>
    );
};

export default SplashScreen;
