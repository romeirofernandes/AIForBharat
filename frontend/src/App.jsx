import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages (untouched)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import ReportIssue from './pages/user/ReportIssue';
import MyComplaints from './pages/user/MyComplaints';
import Profile from './pages/user/Profile';
import TrafficDashboard from './pages/user/TrafficDashboard';
import AllFines from './pages/user/AllFines';
import ChallanDetails from './pages/user/ChallanDetails';
import DiscussionForum from './pages/user/DiscussionForum';
import CityLeaderboard from './pages/user/CityLeaderboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminIssueClusters from './pages/admin/AdminIssueClusters';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Toaster position="top-right" theme="light" richColors />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* User routes */}
        <Route path="/user" element={
          <ProtectedRoute requiredRole="user">
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="forum" element={<DiscussionForum />} />
          <Route path="leaderboard" element={<CityLeaderboard />} />
          <Route path="traffic" element={<TrafficDashboard />} />
          <Route path="traffic/fines" element={<AllFines />} />
          <Route path="traffic/challan/:id" element={<ChallanDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="issues" element={<AdminIssues />} />
          <Route path="clusters" element={<AdminIssueClusters />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
