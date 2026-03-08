import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import SelfAttendanceDashboard from './SelfAttendanceDashboard'; // Legacy support

const Dashboard = () => {
    const { user } = useAuth();

    // Debugging


    if (!user) return null;

    switch (user.role) {
        case 'admin':
        case 'assistant_admin':
            return <Navigate to="/admin" replace />;
        case 'teacher':
            return <Navigate to="/teacher" replace />;
        case 'student':
        case 'cr':
        case 'mentor':
            return <Navigate to="/student" replace />;
        case 'hod':
            return <Navigate to="/hod" replace />;
        default:
            // Fallback for generic users or legacy setup
            return <SelfAttendanceDashboard />;
    }
};

export default Dashboard;
