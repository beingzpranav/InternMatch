import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/auth/AuthLayout';

// Auth pages
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import InternshipsList from './pages/student/InternshipsList';
import InternshipDetail from './pages/student/InternshipDetail';
import StudentApplications from './pages/student/Applications';
import Bookmarks from './pages/student/Bookmarks';

import ProfilePage from './pages/profile/ProfilePage';

// Company pages
import CompanyDashboard from './pages/company/Dashboard';
import ManageInternships from './pages/company/ManageInternships';
import CreateEditInternship from './pages/company/CreateEditInternship';
import CompanyApplications from './pages/company/Applications';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCompanies from './pages/admin/Companies';
import AdminStudents from './pages/admin/Students';
import AdminInternships from './pages/admin/Internships';
import AdminApplications from './pages/admin/Applications';
import ApplicationAnalytics from './pages/admin/ApplicationAnalytics';
import CompanyProfile from './pages/admin/CompanyProfile';

// Shared pages
import Messages from './pages/Messages';

// Legal pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Landing page
import LandingPage from './pages/LandingPage';

function App() {
  const { getUser, user } = useAuthStore();

  // Fetch user data on mount
  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      
      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="signin" element={<SignInForm />} />
        <Route path="signup" element={<SignUpForm />} />
        <Route index element={<Navigate to="/auth/signin" replace />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<AppLayout />}>
        {/* Student routes */}
        <Route 
          path="dashboard" 
          element={
            user?.role === 'student' ? (
              <StudentDashboard />
            ) : user?.role === 'company' ? (
              <CompanyDashboard />
            ) : user?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="internships" element={<InternshipsList />} />
        <Route path="internships/:id" element={<InternshipDetail />} />
        <Route 
          path="applications" 
          element={
            user?.role === 'student' ? (
              <StudentApplications />
            ) : user?.role === 'company' ? (
              <CompanyApplications />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="messages" element={<Messages />} />

        {/* Company routes */}
        <Route path="manage-internships" element={<ManageInternships />} />
        <Route path="internships/create" element={<CreateEditInternship />} />
        <Route path="internships/edit/:id" element={<CreateEditInternship />} />

        {/* Admin routes */}
        <Route path="admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="admin/companies" element={user?.role === 'admin' ? <AdminCompanies /> : <Navigate to="/dashboard" replace />} />
        <Route path="admin/companies/:id" element={user?.role === 'admin' ? <CompanyProfile /> : <Navigate to="/dashboard" replace />} />
        <Route path="admin/students" element={user?.role === 'admin' ? <AdminStudents /> : <Navigate to="/dashboard" replace />} />
        <Route path="admin/internships" element={user?.role === 'admin' ? <AdminInternships /> : <Navigate to="/dashboard" replace />} />
        <Route path="admin/applications" element={user?.role === 'admin' ? <AdminApplications /> : <Navigate to="/dashboard" replace />} />
        <Route path="admin/analytics" element={user?.role === 'admin' ? <ApplicationAnalytics /> : <Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;