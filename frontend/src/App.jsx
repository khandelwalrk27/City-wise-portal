import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import PublicMapPage from './pages/PublicMapPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import MyIssuesPage from './pages/MyIssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';

import AuthorityDashboard from './pages/AuthorityDashboard';
import AssignedIssuesPage from './pages/AssignedIssuesPage';
import AuthorityAnalyticsPage from './pages/AuthorityAnalyticsPage';

import AdminDashboard from './pages/AdminDashboard';
import AdminWardsPage from './pages/AdminWardsPage';
import AdminAuthoritiesPage from './pages/AdminAuthoritiesPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-400 text-xs">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/map" element={<PublicMapPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Common Issue Detail */}
                <Route path="/issues/:id" element={<IssueDetailPage />} />

                {/* Citizen Routes */}
                <Route path="/citizen/dashboard" element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/citizen/report" element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <ReportIssuePage />
                  </ProtectedRoute>
                } />
                <Route path="/citizen/my-issues" element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <MyIssuesPage />
                  </ProtectedRoute>
                } />

                {/* Authority Routes */}
                <Route path="/authority/dashboard" element={
                  <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
                    <AuthorityDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/authority/issues" element={
                  <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
                    <AssignedIssuesPage />
                  </ProtectedRoute>
                } />
                <Route path="/authority/analytics" element={
                  <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
                    <AuthorityAnalyticsPage />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/wards" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminWardsPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/authorities" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAuthoritiesPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
