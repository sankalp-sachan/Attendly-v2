import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, Calendar, AlertCircle, ShieldCheck, Star } from 'lucide-react';
import api from '../utils/api';

const StudentClassDetails = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const isUserCR = classData?.CRs?.some(id => (id._id || id) === user?._id);
    const isUserMentor = classData?.mentors?.some(id => (id._id || id) === user?._id);

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const { data } = await api.get(`/college/student/classes/${classId}`);
                setClassData(data.class);
                setStats(data.stats);
                setHistory(data.history);
            } catch (error) {
                console.error("Failed to fetch class details");
            } finally {
                setLoading(false);
            }
        };
        fetchClassDetails();
    }, [classId]);

    if (loading) return (
        <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!classData) return <div className="p-8 text-center text-slate-500">Class not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student')}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{classData.name}</h1>
                                {isUserCR && <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] uppercase font-black flex items-center gap-1"><Star className="w-3 h-3" /> Class Rep</span>}
                                {isUserMentor && <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[10px] uppercase font-black flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Mentor</span>}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                                <span className="text-primary-500">{classData.subject}</span>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <span>Prof. {classData.user?.name}</span>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <span>Semester {classData.semester}</span>
                            </p>
                        </div>
                    </div>
                    {(isUserCR || isUserMentor) && (
                        <button
                            onClick={() => navigate(`/teacher/classes/${classId}`)}
                            className="btn-primary"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span>Manage Class (Mark Attendance)</span>
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-2xl shadow-primary-500/20 relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Overall Attendance</h3>
                        <p className="text-5xl font-black mb-1">{stats.percentage}%</p>
                        <div className="h-1.5 w-full bg-white/20 rounded-full mt-4">
                            <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${stats.percentage}%` }} />
                        </div>
                    </div>
                    <div className="card p-6 border-none bg-white dark:bg-slate-900 shadow-xl">
                        <Calendar className="w-8 h-8 text-emerald-500 mb-4" />
                        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Classes Attended</h3>
                        <p className="text-4xl font-black dark:text-white">{stats.present} / {stats.total}</p>
                    </div>
                    <div className="card p-6 border-none bg-white dark:bg-slate-900 shadow-xl">
                        <AlertCircle className="w-8 h-8 text-amber-500 mb-4" />
                        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Target</h3>
                        <p className="text-4xl font-black dark:text-white">{classData.targetPercentage}%</p>
                    </div>
                </div>

                <h2 className="text-xl font-black dark:text-white mb-6">Attendance History</h2>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    {history.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No attendance records yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {history.map(record => (
                                <div key={record._id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {record.status === 'Present' ? 'P' : 'A'}
                                        </div>
                                        <div>
                                            <p className="font-bold dark:text-white">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentClassDetails;
