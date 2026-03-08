import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access unauthorized pages
        return <Navigate to="/" />;
    }

    return children;
};

export default RoleRoute;
