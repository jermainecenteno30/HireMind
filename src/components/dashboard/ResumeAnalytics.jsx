import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ResumeAnalytics = () => {
  const { user } = useAuth();
  const [resumePerformance, setResumePerformance] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResumeAnalytics();
    }
  }, [user]);

  const fetchResumeAnalytics = async () => {
    try {
      // Get all resumes
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid)
      );
      const resumesSnapshot = await getDocs(resumesQuery);
      
      // Get all jobs to track which resume was used
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('userId', '==', user.uid)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      
      // Calculate performance per resume
      const performance = resumesSnapshot.docs.map(resumeDoc => {
        const resume = { id: resumeDoc.id, ...resumeDoc.data() };
        
        // In production, you'd track which resume was used for each application
        // For now, we'll create sample data
        const applications = jobsSnapshot.docs.filter(job => {
          // This is where you'd match resume ID to job application
          // For demo, distribute applications evenly
          return true;
        });
        
        const interviews = applications.filter(job => 
          job.data().status === 'interview' || job.data().status === 'hired'
        );
        
        const responseRate = applications.length > 0 
          ? (interviews.length / applications.length) * 100 
          : 0;
        
        return {
          id: resume.id,
          title: resume.title,
          version: resume.version,
          applications: applications.length,
          interviews: interviews.length,
          responseRate: responseRate,
          performanceScore: responseRate * (interviews.length + 1)
        };
      });
      
      // Sort by performance score
      performance.sort((a, b) => b.performanceScore - a.performanceScore);
      setResumePerformance(performance);
      
      if (performance.length > 0) {
        setSelectedResume(performance[0]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = resumePerformance.map(r => ({
    name: r.title.length > 20 ? r.title.substring(0, 20) + '...' : r.title,
    interviews: r.interviews,
    applications: r.applications,
    responseRate: r.responseRate
  }));

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </CardBody>
      </Card>
    );
  }

  if (resumePerformance.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Resume Data Yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking your resume performance by creating multiple resume versions
          </p>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            Create Your First Resume →
          </button>
        </CardBody>
      </Card>
    );
  }

  const bestResume = resumePerformance[0];
  const worstResume = resumePerformance[resumePerformance.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Resume Performance Analytics</h2>
        <p className="text-gray-600 mt-1">Track which resume gets the most interviews</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Best Performing Resume</p>
                <h3 className="text-lg font-semibold text-gray-900 mt-1">{bestResume?.title}</h3>
              </div>
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interviews:</span>
                <span className="font-semibold text-green-600">{bestResume?.interviews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Rate:</span>
                <span className="font-semibold text-primary-600">
                  {bestResume?.responseRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {resumePerformance.reduce((sum, r) => sum + r.applications, 0)}
                </h3>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-sm text-gray-600">
              Across {resumePerformance.length} resume versions
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Improvement Opportunity</p>
                <h3 className="text-lg font-semibold text-gray-900 mt-1">
                  {bestResume && worstResume && bestResume.interviews > worstResume.interviews
                    ? `${((bestResume.interviews - worstResume.interviews) / (worstResume.interviews || 1) * 100).toFixed(0)}%`
                    : '0%'}
                </h3>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-sm text-gray-600">
              Potential improvement by using best resume
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Resume Performance Comparison</h3>
          <p className="text-sm text-gray-600 mt-1">Interviews per resume version</p>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interviews" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Metrics</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Resume Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Version</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Applications</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Interviews</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Response Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {resumePerformance.map((resume, index) => (
                  <tr key={resume.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {index === 0 && <TrophyIcon className="h-4 w-4 text-yellow-500 mr-2" />}
                        <span className="text-sm text-gray-900">{resume.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">v{resume.version}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{resume.applications}</td>
                    <td className="py-3 px-4">
                      <Badge variant={resume.interviews > 0 ? 'success' : 'default'}>
                        {resume.interviews}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-20">
                          <div 
                            className="bg-primary-600 rounded-full h-2"
                            style={{ width: `${resume.responseRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{resume.responseRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {index === 0 ? (
                        <Badge variant="success">Best</Badge>
                      ) : index === resumePerformance.length - 1 && resumePerformance.length > 1 ? (
                        <Badge variant="danger">Needs Improvement</Badge>
                      ) : (
                        <Badge variant="default">Good</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Tips to Improve */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Tips to Improve</h3>
          <p className="text-sm text-gray-600 mt-1">Based on your resume performance data</p>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {bestResume && bestResume.responseRate > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">What's Working Well</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your resume "{bestResume.title}" is getting {bestResume.responseRate.toFixed(0)}% response rate. 
                      Consider using similar formatting and keywords for other versions.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {worstResume && worstResume.responseRate < 20 && worstResume.applications > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <XCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Areas for Improvement</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      "{worstResume.title}" has a low response rate. Try:
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                      <li>Adding more quantifiable achievements (e.g., "Increased sales by 30%")</li>
                      <li>Tailoring keywords to match job descriptions</li>
                      <li>Improving the professional summary section</li>
                      <li>Adding relevant certifications or skills</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ResumeAnalytics;