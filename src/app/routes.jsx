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

const PrivateRoute = ({ children }) => {
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
  
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/portfolio/:username" element={<PublicPortfolio />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/dashboard" /> : <Signup />
        } />
        
        {/* Root Redirect */}
        <Route path="/" element={
          <Navigate to={user ? "/dashboard" : "/login"} />
        } />
        
        {/* Protected Routes (require authentication) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <AdvancedDashboard />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/resumes" element={
          <PrivateRoute>
            <Layout>
              <ResumeList />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/jobs" element={
          <PrivateRoute>
            <Layout>
              <JobTracker />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/skills" element={
          <PrivateRoute>
            <Layout>
              <SkillGapAnalyzer />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/portfolio" element={
          <PrivateRoute>
            <Layout>
              <PortfolioBuilder />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/settings" element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;