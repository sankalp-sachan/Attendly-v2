import { startOfDay, isBefore, isAfter, parseISO, format, eachDayOfInterval, isSameDay } from 'date-fns';

export const calculateAttendanceStats = (classData) => {
    const { attendance, startDate } = classData;
    const dateToParse = startDate || new Date().toISOString().split('T')[0];
    const start = startOfDay(parseISO(dateToParse));
    const today = startOfDay(new Date());

    let totalWorkingDays = 0;
    let presentCount = 0;
    let absentCount = 0;
    let holidayCount = 0;

    // We only count days from startDate to today that are marked or should be marked?
    // Actually, usually working days = days from start to today minus holidays.
    // The user marks each day.

    Object.entries(attendance).forEach(([dateStr, status]) => {
        const date = parseISO(dateStr);

        // Only count if date is within [startDate, today]
        if (!isBefore(date, start) && !isAfter(date, today)) {
            if (status === 'present') {
                presentCount++;
                totalWorkingDays++;
            } else if (status === 'absent') {
                absentCount++;
                totalWorkingDays++;
            } else if (status === 'holiday') {
                holidayCount++;
            }
        }
    });

    const percentage = totalWorkingDays > 0
        ? parseFloat(((presentCount / totalWorkingDays) * 100).toFixed(2))
        : 0;

    return {
        totalWorkingDays,
        presentCount,
        absentCount,
        holidayCount,
        percentage
    };
};

export const getStatusColor = (percentage, target) => {
    if (percentage >= target) return 'text-green-500 bg-green-500/10';
    if (percentage >= target - 5) return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
};

export const getProgressBarColor = (percentage, target) => {
    if (percentage >= target) return 'bg-green-500';
    if (percentage >= target - 5) return 'bg-amber-500';
    return 'bg-red-500';
};
