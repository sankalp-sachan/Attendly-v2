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

        // Send feedback notification
        if (status) {
            const cls = classes.find(c => c.id === classId);
            const className = cls ? cls.name : 'Class';
            sendNotification(
                `Attendance Updated`,
                `You marked yourself ${status.toUpperCase()} for ${className} on ${new Date(date).toLocaleDateString()}.`
            );
        }

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
