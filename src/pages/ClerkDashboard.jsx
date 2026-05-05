import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Upload, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Download, 
    LogOut,
    Search,
    UserPlus,
    Database,
    ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ClerkDashboard = () => {
    const { logout, user } = useAuth();
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFile(file);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const parsedData = XLSX.utils.sheet_to_json(ws);
                
                // Validate and map data structure to match the specific format
                if (parsedData.length > 0) {
                    const mappedData = parsedData.map(row => ({
                        name: row['STUDENT NAME'],
                        email: row['Email Id'],
                        rollNo: row['NO.'],
                        enrollmentNo: row['ENROLLMENT NO.'],
                        department: row['DEPARTMENT'] || '', // Optional
                        section: row['SECTION'] || '', // Optional
                        year: row['YEAR'] || '' // Optional
                    }));

                    const firstRow = mappedData[0];
                    const missingFields = [];
                    if (!firstRow.name) missingFields.push('STUDENT NAME');
                    if (!firstRow.email) missingFields.push('Email Id');
                    if (!firstRow.rollNo) missingFields.push('NO.');
                    if (!firstRow.enrollmentNo) missingFields.push('ENROLLMENT NO.');
                    
                    if (missingFields.length > 0) {
                        setError(`Missing or empty required columns: ${missingFields.join(', ')}`);
                        setData([]);
                    } else {
                        setError('');
                        setData(mappedData);
                    }
                }
            } catch (err) {
                setError('Failed to parse file. Please use a valid Excel or CSV file.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (data.length === 0) return;

        setLoading(true);
        setResults(null);
        try {
            const response = await api.post('/users/bulk-import', { students: data });
            setResults(response.data);
            setData([]);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            { 
                'STUDENT NAME': 'John Doe', 
                'Email Id': 'john@example.com', 
                'NO.': '101', 
                'ENROLLMENT NO.': 'EN101', 
                'DEPARTMENT': 'CS', 
                'SECTION': 'A', 
                'YEAR': '2024' 
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "student_import_template.xlsx");
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Clerk Panel</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Management System</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right mr-4">
                            <p className="text-xs font-black text-white">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">College Clerk</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="bg-white/5 hover:bg-red-500/10 hover:text-red-500 p-2.5 rounded-xl border border-white/5 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                {/* Hero / Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-primary-600/20 to-transparent border border-primary-500/20 p-6 rounded-[2rem] relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <UserPlus className="w-20 h-20" />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Import Students</h3>
                        <p className="text-3xl font-black text-white mb-4">Bulk Create</p>
                        <button 
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Download Template
                        </button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"
                    >
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Default Credentials</h3>
                        <p className="text-xl font-bold text-white mb-2">Password: <span className="text-primary-500 font-black">Password@123</span></p>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                            Mandatory password change will be enforced on first login.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"
                    >
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Security Note</h3>
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">AES-256 Encrypted</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                            All user records are hashed and secured in the central database.
                        </p>
                    </motion.div>
                </div>

                {/* Import Section */}
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Upload Student List</h2>
                            
                            <label className="relative group cursor-pointer block">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                />
                                <div className="border-2 border-dashed border-white/10 group-hover:border-primary-500/50 rounded-3xl p-10 flex flex-col items-center gap-4 transition-all bg-white/[0.02]">
                                    <div className="bg-primary-600/10 p-4 rounded-2xl text-primary-500 group-hover:scale-110 transition-transform">
                                        <Upload className="w-10 h-10" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-white uppercase tracking-wider">
                                            {file ? file.name : 'Select Data File'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                            Excel or CSV supported
                                        </p>
                                    </div>
                                </div>
                            </label>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </motion.div>
                            )}

                            {data.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-4"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Ready to import</p>
                                        <p className="text-xs font-black text-white uppercase tracking-widest bg-primary-600 px-3 py-1 rounded-full">
                                            {data.length} Records
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleImport}
                                        disabled={loading}
                                        className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                <span>Execute Bulk Import</span>
                                                <CheckCircle className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {results && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 space-y-4"
                            >
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <CheckCircle className="w-6 h-6" />
                                    <h3 className="text-lg font-black uppercase tracking-tight">Import Summary</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/10">
                                        <p className="text-2xl font-black text-emerald-500">{results.success}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Successful</p>
                                    </div>
                                    <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/10">
                                        <p className="text-2xl font-black text-red-500">{results.failed}</p>
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Failed</p>
                                    </div>
                                </div>
                                {results.errors.length > 0 && (
                                    <div className="max-h-32 overflow-y-auto space-y-2 mt-4 pr-2">
                                        {results.errors.map((err, i) => (
                                            <p key={i} className="text-[9px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                                                • {err}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden h-full flex flex-col">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-white tracking-tight">Preview Data</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="FILTER..." 
                                        className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-x-auto">
                                {data.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Name</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Id</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">No.</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrollment No.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((row, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-white">{row.name}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-400">{row.email}</td>
                                                    <td className="px-6 py-4 text-xs font-mono text-primary-400">{row.rollNo}</td>
                                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{row.enrollmentNo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                        <div className="bg-white/5 p-6 rounded-full">
                                            <FileText className="w-12 h-12 text-slate-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No data to display</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Upload a file to see preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClerkDashboard;
