import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../hooks/useJobs';
import { useResumes } from '../../hooks/useResumes';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { userData } = useAuth();
  const { jobs, getStats } = useJobs();
  const { resumes } = useResumes();
  
  const stats = getStats();
  
  const statusColors = {
    applied: 'info',
    interview: 'warning',
    rejected: 'danger',
    hired: 'success'
  };
  
  const statusIcons = {
    applied: ClockIcon,
    interview: ArrowTrendingUpIcon,
    rejected: XCircleIcon,
    hired: CheckCircleIcon
  };
  
  // Sample chart data - in production, this would come from actual job application dates
  const chartData = [
    { name: 'Week 1', applications: 4 },
    { name: 'Week 2', applications: 7 },
    { name: 'Week 3', applications: 5 },
    { name: 'Week 4', applications: 9 },
  ];
  
  const recentJobs = jobs.slice(0, 5);
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userData?.displayName || 'Career Seeker'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your career journey
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hover>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-green-600 mt-2">+12% from last month</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="h-6 w-6 text-primary-600" />
              </div>
            </CardBody>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resume Versions</p>
                <p className="text-3xl font-bold text-gray-900">{resumes.length}</p>
                <p className="text-xs text-gray-600 mt-2">Max {userData?.subscription === 'premium' ? 'unlimited' : '3'}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </CardBody>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card hover>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Interview Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-green-600 mt-2">{stats.interview} interviews scheduled</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </CardBody>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card hover>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-green-600 mt-2">{stats.hired} offers received</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
      
      {/* Application Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
            <p className="text-sm text-gray-600 mt-1">Weekly application activity</p>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorApplications)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </motion.div>
      
      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <p className="text-sm text-gray-600 mt-1">Your latest job applications</p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </button>
          </CardHeader>
          <CardBody>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No applications yet</p>
                <button className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Start tracking applications →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => {
                  const StatusIcon = statusIcons[job.status];
                  return (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.role}</p>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={statusColors[job.status]}>
                          <StatusIcon className="h-3 w-3 mr-1 inline" />
                          {job.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(job.dateApplied).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;