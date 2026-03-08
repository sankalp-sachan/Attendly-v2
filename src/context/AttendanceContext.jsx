import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { calculateAttendanceStats } from '../utils/calculations';
import api from '../utils/api';

const AttendanceContext = createContext();

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};

export const AttendanceProvider = ({ children }) => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        // Force notifications to be enabled in app state for all users
        setNotificationsEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
    }, [user]);

    // Fetch Classes from Backend (Syncing)
    useEffect(() => {
        const fetchClasses = async () => {
            if (user) {
                try {
                    const { data } = await api.get('/attendance');
                    // Normalize _id to id for frontend compatibility
                    const formattedClasses = data.map(c => ({
                        ...c,
                        id: c._id || c.id
                    }));
                    setClasses(formattedClasses);
                } catch (error) {
                    console.error("Failed to sync attendance data:", error);
                }
            } else {
                setClasses([]);
            }
        };
        fetchClasses();
    }, [user]);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('dark_mode');
        return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const checkPermission = async () => {
            if ('Notification' in window) {
                if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        setNotificationsEnabled(true);
                        localStorage.setItem('notifications_enabled', 'true');
                    }
                } else if (Notification.permission === 'granted') {
                    setNotificationsEnabled(true);
                    localStorage.setItem('notifications_enabled', 'true');
                } else {
                    setNotificationsEnabled(false);
                    localStorage.setItem('notifications_enabled', 'false');
                }
            }
        };
        checkPermission();
    }, []);

    // Old Daily Notification Logic Removed - using Service Worker Trigger instead

    useEffect(() => {
        localStorage.setItem('dark_mode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const addClass = async (newClass) => {
        try {
            const { data } = await api.post('/attendance', newClass);
            const formatted = { ...data, id: data._id || data.id };
            setClasses(prev => [...prev, formatted]);
        } catch (error) {
            console.error("Error adding class:", error);
            alert("Failed to create class. Please try again.");
        }
    };

    const removeClass = async (id) => {
        try {
            await api.delete(`/attendance/${id}`);
            setClasses(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error removing class:", error);
        }
    };

    const updateAttendance = async (classId, date, status) => {
        // Optimistic Update
        setClasses(prev => prev.map(c => {
            if (c.id === classId) {
                const newAttendance = { ...c.attendance };
                if (status === null) {
                    delete newAttendance[date];
                } else {
                    newAttendance[date] = status;
                }
                return { ...c, attendance: newAttendance };
            }
            return c;
        }));

        // Backend Update
        try {
            await api.put(`/attendance/${classId}/mark`, { date, status });
        } catch (error) {
            console.error("Error marking attendance:", error);
            // Revert state if necessary, but omitting for simplicity/UX speed
        }
    };

    const updateClass = async (classId, updates) => {
        // Optimistic Update
        setClasses(prev => prev.map(c =>
            c.id === classId ? { ...c, ...updates } : c
        ));

        // Backend Update
        try {
            await api.put(`/attendance/${classId}`, updates);
        } catch (error) {
            console.error("Error updating class:", error);
        }
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                localStorage.setItem('notifications_enabled', 'true');
                return true;
            }
        }
        return false;
    };

    const sendNotification = async (title, message) => {
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            try {
                // Try Service Worker first (Required for Android Chrome)
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration) {
                        return registration.showNotification(title, {
                            body: message,
                            icon: '/pwa-192x192.png'
                        });
                    }
                }

                // Fallback for Desktop if SW not ready/available
                new Notification(title, {
                    body: message,
                    icon: '/pwa-192x192.png'
                });
            } catch (error) {
                console.error("Failed to send notification:", error);
            }
        }
    };

    // Reliable Notification System (Interval + Background Scheduler)
    useEffect(() => {
        // Helper: Get or generate today's random time
        const getDailyRandomTime = () => {
            const today = new Date().toISOString().split('T')[0];
            const savedDate = localStorage.getItem('random_time_date');
            const savedTime = localStorage.getItem('random_time_value');

            if (savedDate === today && savedTime) {
                return JSON.parse(savedTime);
            }

            // Generate new time between 8 AM (8) and 8 PM (20)
            const startHour = 8;
            const endHour = 20;
            const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
            const minute = Math.floor(Math.random() * 60);

            const newTime = { hour, minute };
            localStorage.setItem('random_time_date', today);
            localStorage.setItem('random_time_value', JSON.stringify(newTime));
            return newTime;
        };

        const checkAndSendNotifications = async () => {
            if (!notificationsEnabled) return;

            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const todayStr = now.toISOString().split('T')[0];

            // 1. Random Motivation Logic
            const randomTime = getDailyRandomTime();
            const lastRandom = localStorage.getItem('last_random_notification');

            // Check if current time matches (or has just passed within the last hour to be safe)
            // We only send ONCE per day.
            if (lastRandom !== todayStr) {
                // If we are past the random time
                if (currentHour > randomTime.hour || (currentHour === randomTime.hour && currentMinute >= randomTime.minute)) {

                    let avgAttendance = 0;
                    if (classes.length > 0) {
                        const total = classes.reduce((sum, c) => sum + parseFloat(calculateAttendanceStats(c).percentage), 0);
                        avgAttendance = (total / classes.length).toFixed(1);
                    }

                    const quotes = [
                        "Believe you can and you're halfway there.",
                        "The only way to do great work is to love what you do.",
                        "Don't watch the clock; do what it does. Keep going.",
                        "The future belongs to those who believe in the beauty of their dreams.",
                        "It always seems impossible until it is done.",
                        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
                        "Your education is a dress rehearsal for a life that is yours to lead.",
                        "The expert in anything was once a beginner.",
                        "Don't miss your lectures today! 📚",
                        "Attendance matters! Mark yours now. ✅",
                        "Good morning! Ready for learning? ☀️",
                        "Keep your streak alive! Join class. 🔥",
                        "Your future self will thank you for attending! 🚀",
                        "Success occurs when opportunity meets preparation. 🌟",
                        "The beautiful thing about learning is that no one can take it away from you. 💡", 
                        "Education is the passport to the future. 🌍",
                        "Develop a passion for learning. If you do, you will never cease to grow. 🌱"

                    ];
                    const quote = quotes[Math.floor(Math.random() * quotes.length)];

                    sendNotification(`Average Attendance: ${avgAttendance}%`, quote);
                    localStorage.setItem('last_random_notification', todayStr);
                }
            }

            // 2. 10:00 AM Reminder
            const last10am = localStorage.getItem('last_10am_notification');
            if (currentHour >= 10 && last10am !== todayStr) {
                sendNotification("Don't forget!", "Don't forget to mark today's attendance 📝");
                localStorage.setItem('last_10am_notification', todayStr);
            }

            // 3. 5:00 PM Reminder
            const last5pm = localStorage.getItem('last_5pm_notification');
            if (currentHour >= 17 && last5pm !== todayStr) {
                sendNotification("Don't forget!", "Don't forget to mark today's attendance 📝");
                localStorage.setItem('last_5pm_notification', todayStr);
            }

            // === Background Scheduling (TimestampTrigger) for Closed App ===
            if ('serviceWorker' in navigator && 'TimestampTrigger' in window) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    const now = new Date();

                    // Schedule 10 AM Tomorrow (or today if not passed, but interval handles today)
                    let time10am = new Date();
                    time10am.setHours(10, 0, 0, 0);
                    if (now >= time10am) time10am.setDate(time10am.getDate() + 1);

                    await reg.showNotification("Don't forget!", {
                        body: "Don't forget to mark today's attendance 📝",
                        tag: 'reminder-10am',
                        icon: '/pwa-192x192.png',
                        showTrigger: new window.TimestampTrigger(time10am.getTime())
                    });

                    // Schedule 5 PM Tomorrow
                    let time5pm = new Date();
                    time5pm.setHours(17, 0, 0, 0);
                    if (now >= time5pm) time5pm.setDate(time5pm.getDate() + 1);

                    await reg.showNotification("Don't forget!", {
                        body: "Don't forget to mark today's attendance 📝",
                        tag: 'reminder-5pm',
                        icon: '/pwa-192x192.png',
                        showTrigger: new window.TimestampTrigger(time5pm.getTime())
                    });

                } catch (err) {
                    // Ignore
                }
            }
        };

        // Run immediately
        checkAndSendNotifications();

        // Run every minute
        const interval = setInterval(checkAndSendNotifications, 60000);
        return () => clearInterval(interval);
    }, [classes, notificationsEnabled]);

    return (
        <AttendanceContext.Provider value={{
            classes,
            addClass,
            removeClass,
            updateAttendance,
            updateClass,
            darkMode,
            toggleDarkMode,
            notificationsEnabled,
            requestNotificationPermission,
            sendNotification
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};
