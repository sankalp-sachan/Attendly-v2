import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Shield, Upload, FileSpreadsheet, Download, RefreshCw,
    TrendingUp, Database, LayoutDashboard, Filter, BarChart3
} from 'lucide-react';
import api from '../utils/api';
import * as XLSX from 'xlsx';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const UniversityAnalyticsReport = () => {
    const [liveData, setLiveData] = useState([]);
    const [importedData, setImportedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('live'); // 'live' or 'imported'

    useEffect(() => {
        fetchLiveData();
    }, []);

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
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/analytics/import-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImportedData(res.data.analytics);
            setViewMode('imported');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to upload excel");
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleExcel = () => {
        const headers = [['Department', 'Course', 'TotalStudents', 'PresentStudents', 'Date']];
        const rows = [
            ['Computer Science', 'B.Tech', '120', '105', '2024-05-10'],
            ['Mechanical', 'B.Tech', '100', '80', '2024-05-10'],
            ['Electrical', 'M.Tech', '50', '48', '2024-05-10']
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, "SampleData");
        XLSX.writeFile(wb, "University_Attendance_Sample.xlsx");
    };

    const currentData = viewMode === 'live' ? liveData : importedData;

    if (loading && !importedData) {
        return (
            <div className="py-20 flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Computing Analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setViewMode('live')}
                        className={`px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Live Registry
                    </button>
                    <button 
                        onClick={() => importedData && setViewMode('imported')}
                        className={`px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${!importedData ? 'opacity-30 cursor-not-allowed' : ''} ${viewMode === 'imported' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Imported View
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={downloadSampleExcel}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Sample XLS
                    </button>
                    <label className="flex-1 md:flex-none cursor-pointer group flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl shadow-xl shadow-primary-500/10 transition-all text-white text-[10px] font-black uppercase tracking-widest">
                        {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Import Data
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        label: 'Global Average', 
                        val: `${(
                            (currentData?.reduce((acc, curr) => acc + (curr.present || curr.presentRecords || 0), 0) / 
                             currentData?.reduce((acc, curr) => acc + (curr.total || curr.totalRecords || 1), 0)) * 100
                        ).toFixed(1)}%`, 
                        icon: TrendingUp, 
                        color: 'text-emerald-400' 
                    },
                    { label: 'Academic Sectors', val: currentData?.length || 0, icon: Database, color: 'text-indigo-400' },
                    { label: 'Total Registry', val: currentData?.reduce((acc, curr) => acc + (curr.total || curr.totalRecords || 0), 0), icon: Shield, color: 'text-primary-400' }
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                            <stat.icon className="w-16 h-16" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</h3>
                        <p className="text-3xl font-black tracking-tighter text-white">{stat.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        Metric Map
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="department" stroke="#475569" fontSize={8} fontWeight={900} axisLine={false} tickLine={false} tickFormatter={(val) => val.slice(0, 10)} />
                                <YAxis stroke="#475569" fontSize={8} fontWeight={900} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} cursor={{ fill: '#ffffff05' }} />
                                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} barSize={30}>
                                    {currentData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                        Load Distribution
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={currentData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={50} outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey={viewMode === 'live' ? "totalRecords" : "total"} 
                                    nameKey="department"
                                >
                                    {currentData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                                <Legend 
                                    layout="vertical" 
                                    align="right" 
                                    verticalAlign="middle"
                                    iconType="circle"
                                    formatter={(val) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">{val.length > 15 ? val.slice(0, 15) + '...' : val}</span>}
                                    wrapperStyle={{ paddingLeft: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/5">
                <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <h2 className="text-sm font-black uppercase tracking-widest">Core Sector Metrics</h2>
                </div>
                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/60 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">
                                <th className="px-8 py-5">Intel Sector</th>
                                <th className="px-8 py-5">Volume</th>
                                <th className="px-8 py-5 text-right">Coefficient</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(currentData ? [...currentData].sort((a, b) => b.percentage - a.percentage) : []).map((item, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5 font-black text-white text-xs uppercase tracking-wider">{item.department}</td>
                                    <td className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.presentStudents || item.presentRecords || item.present} / {item.totalStudents || item.totalRecords || item.total}</td>
                                    <td className="px-8 py-5 text-right font-black text-primary-400 text-xs">{item.percentage}%</td>
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
