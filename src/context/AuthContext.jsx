import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('attendly_current_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Clean up local mock users since we are now connected to backend
    useEffect(() => {
        localStorage.removeItem('attendly_users');
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('attendly_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('attendly_current_user');
        }
    }, [user]);

    const register = async (email, password, name, institute, role, department) => {
        try {
            const { data } = await api.post(
                '/users',
                { email, password, name, institute, role, department }
            );

            // If token is present, auto-login (legacy or if verification disabled)
            if (data.token) {
                setUser(data);
                return { success: true, data };
            } else {
                // Verification or approval required
                return { success: true, requiresVerification: true, email: data.email, message: data.message };
            }
        } catch (error) {
            console.error("Registration error:", error);
            const serverError = error.response?.data?.error;
            const message = error.response?.data?.message || 'Registration failed';

            // Append explicit server error details if available
            throw new Error(serverError ? `${message}: ${serverError}` : message);
        }
    };



    const login = async (email, password) => {
        try {
            const { data } = await api.post(
                '/users/login',
                { email, password }
            );

            setUser(data);
            return data;
        } catch (error) {
            // Check if error is due to unverified account
            if (error.response?.status === 401 && error.response?.data?.isUnverified) {
                const err = new Error(error.response.data.message);
                err.isUnverified = true;
                err.email = error.response.data.email;
                throw err;
            }
            throw new Error(error.response?.data?.message || 'Invalid email or password');
        }
    };

    const googleLogin = async (credential) => {
        try {
            const { data } = await api.post(
                '/users/google-auth',
                { token: credential }
            );

            setUser(data);
            return data;
        } catch (error) {
            console.error("Google Login error:", error);
            throw new Error(error.response?.data?.message || 'Google Login failed');
        }
    };

    const deleteUser = async (userId) => {
        try {
            await api.delete(`/admin/users/${userId}`);
            return true;
        } catch (error) {
            console.error("Delete user error:", error);
            throw new Error(error.response?.data?.message || 'Delete failed');
        }
    };

    const updateUserProfile = async (updatedData) => {
        try {
            const { data } = await api.put(
                '/users/profile',
                updatedData
            );

            setUser(data);
            return data;
        } catch (error) {
            console.error("Update Profile error:", error);
            throw new Error(error.response?.data?.message || 'Update failed');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('attendly_current_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, updateUserProfile, logout, deleteUser }}>
            {children}
        </AuthContext.Provider>
    );
};
