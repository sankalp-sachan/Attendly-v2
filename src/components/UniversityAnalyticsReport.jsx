import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    Shield, Upload, FileSpreadsheet, Download, RefreshCw,
    TrendingUp, Database, LayoutDashboard, Filter, BarChart3,
    ArrowUpRight, ArrowDownRight, Activity, Zap, Award
} from 'lucide-react';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const UniversityAnalyticsReport = () => {
    const { user } = useAuth();
    const [liveData, setLiveData] = useState([]);
    const [importedData, setImportedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [viewMode, setViewMode] = useState('live'); // 'live' or 'imported'

    useEffect(() => {
        fetchLiveData();
        fetchArchivedData();
    }, []);

    const fetchArchivedData = async () => {
        try {
            const res = await api.get('/analytics/department-wise?mode=archived');
            if (res.data && res.data.length > 0) {
                setImportedData(res.data);
                if (res.data[0].fileName) {
                    setUploadedFileName(res.data[0].fileName);
                }
            }
        } catch (error) {
            console.error("Failed to fetch archived analytics", error);
        }
    };

    const fetchLiveData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/analytics/department-wise');
            setLiveData(res.data);
        } catch (error) {
            console.error("Failed to fetch live analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await api.post('/analytics/import-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImportedData(res.data.analytics);
            setUploadedFileName(res.data.fileName || selectedFiles.map(f => f.name).join(', '));
            setViewMode('imported');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to upload dataset");
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleExcel = () => {
        const headers = [['Department', 'Course', 'TotalStudents', 'PresentStudents', 'Date']];
        const rows = [
            ['Computer Science', 'B.Tech', '120', '105', '2024-05-10'],
            ['Mechanical', 'B.Tech', '100', '80', '2024-05-10'],
            ['Electrical', 'M.Tech', '50', '48', '2024-05-10'],
            ['Civil', 'B.Tech', '90', '72', '2024-05-10']
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, "SampleData");
        XLSX.writeFile(wb, "University_Attendance_Sample.xlsx");
    };

    const currentData = useMemo(() => {
        return viewMode === 'live' ? liveData : importedData;
    }, [viewMode, liveData, importedData]);

    const stats = useMemo(() => {
        if (!currentData || currentData.length === 0) return { avg: 0, total: 0, topDept: 'N/A', count: 0 };
        
        const totalPresent = currentData.reduce((acc, curr) => acc + (curr.present || curr.presentRecords || 0), 0);
        const totalAll = currentData.reduce((acc, curr) => acc + (curr.total || curr.totalRecords || 1), 0);
        const sorted = [...currentData].sort((a,b) => b.percentage - a.percentage);
        
        return {
            avg: ((totalPresent / totalAll) * 100).toFixed(1),
            total: totalAll,
            topDept: sorted[0]?.department || 'N/A',
            count: currentData.length
        };
    }, [currentData]);

    if (loading && !importedData) {
        return (
            <div className="py-32 flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-500/10 border-t-primary-500 rounded-full animate-spin"></div>
                    <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Processing Intelligence Architecture...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {/* Executive Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-indigo-500/5 opacity-50"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary-600 rounded-2xl shadow-xl shadow-primary-600/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
                            <button 
                                onClick={() => setViewMode('live')}
                                className={`px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'live' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Live Engine
                            </button>
                            <button 
                                onClick={() => setViewMode('imported')}
                                className={`px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'imported' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Archive Data
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                         <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.25em]">Registry Synchronization: <span className="text-white">Active</span></p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4 w-full lg:w-auto">
                    <button 
                        onClick={downloadSampleExcel}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest group/btn"
                    >
                        <FileSpreadsheet className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Download Schema
                    </button>
                    
                    {['admin', 'assistant_admin'].includes(user?.role) && (
                        <div className="flex flex-col gap-2">
                             <label className="flex-1 lg:flex-none cursor-pointer group flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-2xl shadow-2xl shadow-primary-600/20 transition-all text-white text-[10px] font-black uppercase tracking-widest relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                {uploading ? 'Processing...' : 'Import Dataset'}
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={uploading} multiple />
                            </label>
                            {uploadedFileName && (
                                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest text-center truncate max-w-[150px]">
                                    Active: {uploadedFileName}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        label: 'Engagement Coefficient', 
                        val: `${stats.avg}%`, 
                        icon: TrendingUp, 
                        color: 'text-emerald-400',
                        sub: 'Global Average'
                    },
                    { 
                        label: 'Operational Sectors', 
                        val: stats.count, 
                        icon: Database, 
                        color: 'text-indigo-400',
                        sub: 'Departments Mapped'
                    },
                    { 
                        label: 'Primary Node', 
                        val: stats.topDept, 
                        icon: Award, 
                        color: 'text-amber-400',
                        sub: 'Highest Performance'
                    },
                    { 
                        label: 'Registry Volume', 
                        val: stats.total.toLocaleString(), 
                        icon: Shield, 
                        color: 'text-primary-400',
                        sub: 'Total Entities'
                    }
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -8, scale: 1.02 }} 
                        className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl backdrop-blur-xl"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                            <stat.icon className="w-24 h-24" />
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} border border-white/5 mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
                        <p className="text-3xl font-black tracking-tighter text-white mb-2">{stat.val}</p>
                        <div className="flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Neural Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metric Distribution */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 bg-slate-900/40 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-primary-500" />
                                Efficiency Gradient
                            </h2>
                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">Departmental Attendance Index</p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {viewMode === 'live' ? 'Real-time' : 'Archived'}
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentData}>
                                <defs>
                                    {COLORS.map((color, i) => (
                                        <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                                            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                <XAxis 
                                    dataKey="department" 
                                    stroke="#475569" 
                                    fontSize={8} 
                                    fontWeight={900} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => val.length > 12 ? val.slice(0, 10) + '...' : val} 
                                />
                                <YAxis stroke="#475569" fontSize={8} fontWeight={900} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '20px', 
                                        backdropBlur: '12px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                    }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="percentage" radius={[10, 10, 0, 0]} barSize={34}>
                                    {currentData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#barGrad-${index % COLORS.length})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Load Analysis */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 bg-slate-900/40 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                                Resource Allocation
                            </h2>
                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">Volume Distribution by Sector</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={currentData} 
                                    cx="45%" cy="50%" 
                                    innerRadius={80} outerRadius={110} 
                                    paddingAngle={8} 
                                    dataKey="total" 
                                    nameKey="department"
                                    stroke="none"
                                >
                                    {currentData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '16px',
                                        fontSize: '10px'
                                    }} 
                                />
                                <Legend 
                                    layout="vertical" 
                                    align="right" 
                                    verticalAlign="middle"
                                    iconType="circle"
                                    formatter={(val) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors ml-3">{val.length > 20 ? val.slice(0, 18) + '...' : val}</span>}
                                    wrapperStyle={{ paddingLeft: '40px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Comprehensive Data Grids */}
            <div className="bg-slate-900/40 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl backdrop-blur-3xl">
                <div className="p-10 border-b border-white/5 bg-black/40 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">Strategic Sector Metrics</h2>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">Historical and Real-time performance audit</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all">
                             <Filter className="w-4 h-4" />
                        </button>
                        <button className="px-6 py-3 bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                             <Download className="w-4 h-4" />
                             Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-900/60 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                <th className="px-10 py-6">Intelligence Sector</th>
                                <th className="px-10 py-6">Engagement Status</th>
                                <th className="px-10 py-6">Node Population</th>
                                <th className="px-10 py-6 text-right">Coefficient</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(currentData ? [...currentData].sort((a, b) => b.percentage - a.percentage) : []).map((item, i) => (
                                <tr key={i} className="hover:bg-primary-500/[0.03] transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary-400 group-hover:scale-110 transition-transform">
                                                {item.department.charAt(0)}
                                            </div>
                                            <span className="font-black text-white text-sm tracking-tight capitalize">{item.department}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.percentage}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className={`h-full rounded-full ${item.percentage > 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white tracking-tight">{item.presentStudents || item.presentRecords || item.present} / {item.totalStudents || item.totalRecords || item.total}</span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Personnel Synchronized</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-black tracking-tighter ${item.percentage >= 75 ? 'text-emerald-400' : 'text-primary-400'}`}>{item.percentage}%</span>
                                                {item.percentage >= 75 ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-primary-400" />}
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Efficiency Node</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UniversityAnalyticsReport;

