import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// Main Pages
import AdvancedDashboard from '../pages/dashboard/AdvancedDashboard';
import ResumeList from '../pages/resume/ResumeList';
import JobTracker from '../pages/jobs/JobTracker';
import Settings from '../pages/settings/Settings';
import SkillGapAnalyzer from '../pages/skills/SkillGapAnalyzer';
import PortfolioBuilder from '../pages/portfolio/PortfolioBuilder';
import PublicPortfolio from '../pages/portfolio/PublicPortfolio';

// Protected Route - Shows login modal or redirects
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Store the intended path to redirect after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

// Public Route - Dashboard visible to everyone
const PublicRoute = ({ children }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Dashboard visible to everyone */}
        <Route path="/" element={
          <PublicRoute>
            <Layout>
              <AdvancedDashboard />
            </Layout>
          </PublicRoute>
        } />
        
        <Route path="/dashboard" element={
          <PublicRoute>
            <Layout>
              <AdvancedDashboard />
            </Layout>
          </PublicRoute>
        } />
        
        {/* Public Portfolio Route */}
        <Route path="/portfolio/:username" element={<PublicPortfolio />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/" /> : <Signup />
        } />
        
        {/* Protected Routes (require login) */}
        <Route path="/resumes" element={
          <ProtectedRoute>
            <Layout>
              <ResumeList />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/jobs" element={
          <ProtectedRoute>
            <Layout>
              <JobTracker />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/skills" element={
          <ProtectedRoute>
            <Layout>
              <SkillGapAnalyzer />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Layout>
              <PortfolioBuilder />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;