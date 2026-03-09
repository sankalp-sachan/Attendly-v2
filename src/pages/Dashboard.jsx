import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/auth" replace />;

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
            return <Navigate to="/auth" replace />;
    }
};

export default Dashboard;
