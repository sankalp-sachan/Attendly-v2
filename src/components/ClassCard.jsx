import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { calculateAttendanceStats, getStatusColor, getProgressBarColor } from '../utils/calculations';

const ClassCard = ({ classItem, onOpen, onDelete }) => {
    const stats = calculateAttendanceStats(classItem);
    const { percentage, totalWorkingDays, presentCount } = stats;
    const isWarning = percentage < (classItem.targetPercentage || 75);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card group cursor-pointer"
            onClick={onOpen}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold dark:text-white group-hover:text-primary-500 transition-colors uppercase tracking-tight">
                        {classItem.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Started {new Date(classItem.startDate).toLocaleDateString()}
                    </p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(percentage, classItem.targetPercentage || 75)}`}>
                    {isWarning ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-black dark:text-white">
                        {percentage}%
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Target: {classItem.targetPercentage || 75}%
                    </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, percentage)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${getProgressBarColor(percentage, classItem.targetPercentage || 75)}`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase font-bold">Present</p>
                    <p className="text-lg font-bold dark:text-white">{presentCount}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Days</p>
                    <p className="text-lg font-bold dark:text-white">{totalWorkingDays}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen();
                    }}
                    className="flex-1 btn-primary text-sm py-2"
                >
                    <Calendar className="w-4 h-4" />
                    Mark Attendance
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(classItem.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default ClassCard;
