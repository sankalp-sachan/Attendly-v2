import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return children;
};

import RoleRoute from './components/RoleRoute';

import TeacherDashboard from './pages/TeacherDashboard';
import TeacherClassDetails from './pages/TeacherClassDetails';
import StudentDashboard from './pages/StudentDashboard';
import StudentClassDetails from './pages/StudentClassDetails';
import HODDashboard from './pages/HODDashboard';

import { SpeedInsights } from "@vercel/speed-insights/react";
import SplashScreen from './components/SplashScreen';
import InstallOverlay from './components/InstallOverlay';
import SessionWarning from './components/SessionWarning';
import AIAssistant from './components/AIAssistant';
import { AnimatePresence, motion } from 'framer-motion';

import AboutDeveloper from './pages/AboutDeveloper';
import AboutApp from './pages/AboutApp';
import QuizCreate from './pages/Quiz/QuizCreate';
import QuizTake from './pages/Quiz/QuizTake';
import QuizTeacherResults from './pages/Quiz/QuizTeacherResults';
import QuizResultView from './pages/Quiz/QuizResultView';

function App() {
  const [loading, setLoading] = React.useState(() => {
    // Check if splash has already been shown in this session (persists across refreshes)
    return !sessionStorage.getItem('splash_shown');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('splash_shown', 'true');
    setLoading(false);
  };

  return (
    <AuthProvider>
      <AttendanceProvider>
        <SpeedInsights />
        <InstallOverlay />
        <SessionWarning />
        <AnimatePresence mode="wait">
          {loading ? (
            <SplashScreen key="splash" onFinish={handleSplashFinish} />
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen"
            >
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/auth"
                    element={
                      <PublicRoute>
                        <Auth />
                      </PublicRoute>
                    }
                  />
                  <Route path="/about-developer" element={<AboutDeveloper />} />
                  <Route path="/about-app" element={<AboutApp />} />

                  {/* Home Redirect / Hub */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <RoleRoute allowedRoles={['admin', 'assistant_admin']}>
                        <AdminDashboard />
                      </RoleRoute>
                    }
                  />

                  {/* Teacher & Mentor Routes */}
                  <Route
                    path="/teacher"
                    element={
                      <RoleRoute allowedRoles={['teacher', 'mentor']}>
                        <TeacherDashboard />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/teacher/classes/:classId"
                    element={
                      <RoleRoute allowedRoles={['teacher', 'mentor', 'cr']}>
                        <TeacherClassDetails />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/teacher/classes/:classId/quiz/create"
                    element={
                      <RoleRoute allowedRoles={['teacher', 'mentor']}>
                        <QuizCreate />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/teacher/classes/:classId/quiz/:id/results"
                    element={
                      <RoleRoute allowedRoles={['teacher', 'mentor']}>
                        <QuizTeacherResults />
                      </RoleRoute>
                    }
                  />

                  {/* Student & CR Routes */}
                  <Route
                    path="/student"
                    element={
                      <RoleRoute allowedRoles={['student', 'cr', 'mentor']}>
                        <StudentDashboard />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/student/classes/:classId"
                    element={
                      <RoleRoute allowedRoles={['student', 'cr', 'mentor']}>
                        <StudentClassDetails />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/student/classes/:classId/quiz/:id/take"
                    element={
                      <RoleRoute allowedRoles={['student', 'cr', 'mentor']}>
                        <QuizTake />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/student/classes/:classId/quiz/:id/result"
                    element={
                      <RoleRoute allowedRoles={['student', 'cr', 'mentor']}>
                        <QuizResultView />
                      </RoleRoute>
                    }
                  />

                  {/* HOD & Admin Routes */}
                  <Route
                    path="/hod"
                    element={
                      <RoleRoute allowedRoles={['hod', 'admin']}>
                        <HODDashboard />
                      </RoleRoute>
                    }
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <AIAssistant />
              </Router>
            </motion.div>
          )}
        </AnimatePresence>
      </AttendanceProvider>
    </AuthProvider>
  );
}

export default App;
