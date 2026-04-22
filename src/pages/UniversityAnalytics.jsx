import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UniversityAnalyticsReport from '../components/UniversityAnalyticsReport';

const UniversityAnalytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Protection logic
    React.useEffect(() => {
        if (!['admin', 'assistant_admin', 'hod'].includes(user?.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-primary-500/30 relative overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <nav className="flex items-center justify-between mb-12">
                    <button onClick={() => navigate(-1)} className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-widest">Back</span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter uppercase">Intelligence Hub</h1>
                    </div>
                </nav>

                <UniversityAnalyticsReport />
            </div>
        </div>
    );
};

export default UniversityAnalytics;
