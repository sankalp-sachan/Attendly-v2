import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    isAfter,
    isBefore,
    parseISO,
    startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X as CloseIcon, Coffee } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const AttendanceCalendar = ({ classItem, onMark }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const startDate = startOfDay(parseISO(classItem.startDate));
    const today = startOfDay(new Date());

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold dark:text-white">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 dark:text-slate-400" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 dark:text-slate-400" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDateView = startOfWeek(monthStart);
        const endDateView = endOfWeek(monthEnd);

        const rows = [];
        let day = startDateView;

        while (day <= endDateView) {
            let days = [];
            for (let i = 0; i < 7; i++) {
                const currentDate = day;
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(currentDate, monthStart);
                const isToday = isSameDay(currentDate, today);
                const isLocked = isBefore(currentDate, startDate) || isAfter(currentDate, today);
                const status = classItem.attendance[dateStr];

                days.push(
                    <div
                        key={dateStr}
                        className={cn(
                            "relative h-14 md:h-20 border border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center transition-all",
                            !isCurrentMonth && "bg-slate-50/30 dark:bg-slate-900/10 opacity-30",
                            isLocked && "opacity-30 cursor-not-allowed",
                            !isLocked && "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer",
                            status === 'present' && "bg-green-500/10 dark:bg-green-500/20",
                            status === 'absent' && "bg-red-500/10 dark:bg-red-500/20",
                            status === 'holiday' && "bg-amber-500/10 dark:bg-amber-500/20"
                        )}
                        onClick={() => !isLocked && handleDateClick(dateStr)}
                    >
                        <span className={cn(
                            "text-sm font-medium",
                            isToday && "text-primary-500 font-bold underline decoration-2 underline-offset-4",
                            !isCurrentMonth ? "text-slate-300 dark:text-slate-700" : "dark:text-slate-300"
                        )}>
                            {format(currentDate, 'd')}
                        </span>

                        {status && (
                            <div className="mt-1">
                                {status === 'present' && <Check className="w-4 h-4 text-green-500" />}
                                {status === 'absent' && <CloseIcon className="w-4 h-4 text-red-500" />}
                                {status === 'holiday' && <Coffee className="w-4 h-4 text-amber-500" />}
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
        }
        return <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">{rows}</div>;
    };

    const [selectedDate, setSelectedDate] = useState(null);

    const handleDateClick = (dateStr) => {
        setSelectedDate(dateStr);
    };

    return (
        <div className="select-none">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {/* Quick Mark Modal/Overlay */}
            {selectedDate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-slide-up">
                        <h4 className="text-lg font-bold mb-4 dark:text-white text-center">
                            {format(parseISO(selectedDate), 'do MMMM')}
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => { onMark(selectedDate, 'present'); setSelectedDate(null); }}
                                className="flex items-center justify-between p-4 rounded-xl border-2 border-green-100 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                            >
                                <span className="font-bold text-green-600 dark:text-green-400">Present</span>
                                <Check className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                                onClick={() => { onMark(selectedDate, 'absent'); setSelectedDate(null); }}
                                className="flex items-center justify-between p-4 rounded-xl border-2 border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            >
                                <span className="font-bold text-red-600 dark:text-red-400">Absent</span>
                                <CloseIcon className="w-5 h-5 text-red-600" />
                            </button>
                            <button
                                onClick={() => { onMark(selectedDate, 'holiday'); setSelectedDate(null); }}
                                className="flex items-center justify-between p-4 rounded-xl border-2 border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                            >
                                <span className="font-bold text-amber-600 dark:text-amber-400">Holiday</span>
                                <Coffee className="w-5 h-5 text-amber-600" />
                            </button>
                            <button
                                onClick={() => { onMark(selectedDate, null); setSelectedDate(null); }}
                                className="mt-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                Clear Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceCalendar;
