import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../hooks/useJobs';
import { useResumes } from '../../hooks/useResumes';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAI } from '../../context/AIContext';
import ResumeAnalytics from '../../components/dashboard/ResumeAnalytics';
import { TrophyIcon, FireIcon, BellAlertIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

// 🔥🔥🔥 FORCE PREMIUM FOR TESTING - SET TO true TO UNLOCK ALL PREMIUM FEATURES 🔥🔥🔥
const FORCE_PREMIUM_TESTING = true;

// Storage keys for AI memory
const AI_INSIGHTS_STORAGE_KEY = 'hirepath_ai_insights';
const AI_SKILLS_STORAGE_KEY = 'hirepath_ai_skills';

const AdvancedDashboard = () => {
  const { userData, isPremium: userIsPremium } = useAuth();
  // Override premium for testing
  const isPremium = FORCE_PREMIUM_TESTING || userIsPremium;
  
  const { jobs, getStats } = useJobs();
  const { resumes } = useResumes();
  const { getCareerInsights, getSkillRecommendations, isProcessing, isRealAI } = useAI();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsights, setAiInsights] = useState(null);
  const [skillRecommendations, setSkillRecommendations] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [streak, setStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(null);
  
  // Cooldown timers to prevent rate limiting
  const [lastInsightsRequest, setLastInsightsRequest] = useState(0);
  const [lastSkillsRequest, setLastSkillsRequest] = useState(0);
  const insightsTimeoutRef = useRef(null);
  const skillsTimeoutRef = useRef(null);
  
  // Refs to track previous values to prevent infinite loops
  const prevJobsLengthRef = useRef(0);
  const prevStatsRef = useRef({ total: 0, interview: 0, hired: 0 });
  
  const stats = getStats();
  
  // Detect user's role from jobs or resumes
  const detectedRole = jobs[0]?.role || 
                       resumes[0]?.tags?.[0] || 
                       userData?.title || 
                       'Software Developer';
  
  // Detect experience level based on total applications
  const experienceLevel = stats.total > 30 ? 'senior' : stats.total > 15 ? 'intermediate' : 'entry';
  
  // Calculate streak (consecutive days with applications) - FIXED: Only runs when jobs change
  useEffect(() => {
    const calculateStreak = () => {
      if (jobs.length === 0) return 0;
      
      // Get unique dates and sort descending
      const dates = [...new Set(jobs.map(j => new Date(j.dateApplied).toDateString()))];
      dates.sort((a, b) => new Date(b) - new Date(a));
      
      let currentStreak = 1;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      // Check if last application is today or yesterday
      if (dates[0] !== today && dates[0] !== yesterday) {
        return 0;
      }
      
      // Calculate consecutive days
      for (let i = 0; i < dates.length - 1; i++) {
        const currentDate = new Date(dates[i]);
        const nextDate = new Date(dates[i + 1]);
        const diffDays = (currentDate - nextDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return currentStreak;
    };
    
    const newStreak = calculateStreak();
    if (streak !== newStreak) {
      setStreak(newStreak);
    }
  }, [jobs]); // Only run when jobs change
  
  // Generate smart notifications - FIXED: Only runs when jobs stats change significantly
  useEffect(() => {
    // Check if stats actually changed to prevent infinite loop
    const statsChanged = prevStatsRef.current.total !== stats.total || 
                         prevStatsRef.current.interview !== stats.interview || 
                         prevStatsRef.current.hired !== stats.hired;
    
    if (!statsChanged && prevJobsLengthRef.current === jobs.length) {
      return;
    }
    
    prevStatsRef.current = { total: stats.total, interview: stats.interview, hired: stats.hired };
    prevJobsLengthRef.current = jobs.length;
    
    const newNotifications = [];
    
    // Check for inactivity
    const lastApplication = jobs[0]?.dateApplied;
    if (lastApplication) {
      const daysSinceLastApp = Math.floor((Date.now() - new Date(lastApplication)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastApp >= 3 && daysSinceLastApp <= 7) {
        newNotifications.push({
          id: 'inactive',
          title: 'Keep the momentum going!',
          message: `You haven't applied in ${daysSinceLastApp} days. Apply to 5 jobs today!`,
          type: 'warning'
        });
      }
    }
    
    // Check response rate drop
    const responseRateValue = stats.total > 0 ? ((stats.interview + stats.hired) / stats.total * 100) : 0;
    const savedRate = localStorage.getItem('previous_response_rate');
    const previousRate = savedRate ? parseFloat(savedRate) : null;
    
    if (previousRate !== null && responseRateValue < previousRate - 5) {
      newNotifications.push({
        id: 'response_drop',
        title: 'Response rate decreased',
        message: `Your response rate dropped from ${previousRate}% to ${responseRateValue.toFixed(1)}%. Try tailoring your resume more.`,
        type: 'info'
      });
    }
    
    // Only update if notifications changed
    if (JSON.stringify(notifications) !== JSON.stringify(newNotifications)) {
      setNotifications(newNotifications);
    }
    
    // Save current rate for future comparison
    if (stats.total > 0 && Math.abs(responseRateValue - (parseFloat(localStorage.getItem('previous_response_rate') || '0'))) > 1) {
      localStorage.setItem('previous_response_rate', responseRateValue.toFixed(1));
    }
  }, [jobs.length, stats.total, stats.interview, stats.hired]);
  
  // Load saved AI results from localStorage (AI Memory) - Runs once on mount
  useEffect(() => {
    const savedInsights = localStorage.getItem(AI_INSIGHTS_STORAGE_KEY);
    if (savedInsights) {
      try {
        setAiInsights(JSON.parse(savedInsights));
      } catch (e) {
        console.error('Error loading saved insights:', e);
      }
    }
    
    const savedSkills = localStorage.getItem(AI_SKILLS_STORAGE_KEY);
    if (savedSkills) {
      try {
        setSkillRecommendations(JSON.parse(savedSkills));
      } catch (e) {
        console.error('Error loading saved skills:', e);
      }
    }
  }, []); // Empty dependency array - runs once on mount
  
  // Generate weekly report - FIXED: Only runs when jobs change
  useEffect(() => {
    const generateWeeklyReport = () => {
      const lastWeekJobs = jobs.filter(job => {
        const jobDate = new Date(job.dateApplied);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return jobDate >= weekAgo;
      });
      
      const report = {
        weekStart: new Date(Date.now() - 7 * 86400000).toLocaleDateString(),
        weekEnd: new Date().toLocaleDateString(),
        applications: lastWeekJobs.length,
        interviews: lastWeekJobs.filter(j => j.status === 'interview').length,
        hired: lastWeekJobs.filter(j => j.status === 'hired').length,
        responseRate: lastWeekJobs.length > 0 ? 
          ((lastWeekJobs.filter(j => j.status === 'interview' || j.status === 'hired').length / lastWeekJobs.length) * 100).toFixed(1) : 0,
        improvement: stats.total > 0 ? '+12%' : 'N/A'
      };
      
      setWeeklyReport(report);
    };
    
    generateWeeklyReport();
  }, [jobs]); // Only run when jobs change
  
  // Debug log to confirm premium status
  useEffect(() => {
    console.log('🔍 AdvancedDashboard - Premium Status:', { 
      FORCE_PREMIUM_TESTING, 
      userIsPremium, 
      isPremium,
      activeTab,
      isRealAI,
      detectedRole,
      experienceLevel
    });
  }, [isPremium, activeTab, isRealAI]);
  
  // Calculate weekly progress for goal tracking
  const calculateWeeklyGoal = () => {
    const weeklyGoal = 10; // Target: 10 applications per week
    const weeks = {};
    jobs.forEach(job => {
      const date = new Date(job.dateApplied);
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });
    const currentWeek = Object.values(weeks).pop() || 0;
    const progressPercent = Math.min(100, (currentWeek / weeklyGoal) * 100);
    return { current: currentWeek, goal: weeklyGoal, percent: progressPercent };
  };
  
  const weeklyGoalData = calculateWeeklyGoal();
  
  // Calculate weekly progress chart data
  const getWeeklyProgress = () => {
    const weeks = {};
    jobs.forEach(job => {
      const date = new Date(job.dateApplied);
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, applications: 0, interviews: 0 };
      }
      weeks[weekKey].applications++;
      if (job.status === 'interview' || job.status === 'hired') {
        weeks[weekKey].interviews++;
      }
    });
    return Object.values(weeks).slice(-6);
  };

  const weeklyData = getWeeklyProgress();
  
  // Response rate by status
  const statusData = [
    { name: 'Applied', value: stats.applied, color: '#0ea5e9' },
    { name: 'Interview', value: stats.interview, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Hired', value: stats.hired, color: '#10b981' }
  ].filter(d => d.value > 0);

  const responseRate = stats.total > 0 
    ? ((stats.interview + stats.hired) / stats.total * 100).toFixed(1)
    : 0;

  const successRate = stats.total > 0 
    ? (stats.hired / stats.total * 100).toFixed(1)
    : 0;

  // Generate AI-powered insights - ONLY when button is clicked with cooldown
  const generateAIInsights = async () => {
    if (!isPremium) return;
    if (loadingInsights) return;
    
    const now = Date.now();
    if (now - lastInsightsRequest < 5000) {
      const waitTime = Math.ceil((5000 - (now - lastInsightsRequest)) / 1000);
      toast.info(`Please wait ${waitTime} seconds before requesting again`);
      return;
    }
    
    setLastInsightsRequest(now);
    setLoadingInsights(true);
    
    const loadingToast = toast.loading('AI is analyzing your career data...');
    
    try {
      const result = await getCareerInsights(jobs, resumes.length);
      if (result) {
        setAiInsights(result);
        // Save to localStorage for persistence
        localStorage.setItem(AI_INSIGHTS_STORAGE_KEY, JSON.stringify(result));
        toast.success('Insights generated successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to generate insights', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Error generating insights. Please try again.', { id: loadingToast });
    } finally {
      setLoadingInsights(false);
    }
  };

  // Generate skill recommendations - Context-aware (detects role and level)
  const generateSkillRecommendations = async () => {
    if (!isPremium) return;
    if (loadingSkills) return;
    
    const now = Date.now();
    if (now - lastSkillsRequest < 5000) {
      const waitTime = Math.ceil((5000 - (now - lastSkillsRequest)) / 1000);
      toast.info(`Please wait ${waitTime} seconds before requesting again`);
      return;
    }
    
    setLastSkillsRequest(now);
    setLoadingSkills(true);
    
    const loadingToast = toast.loading('AI is analyzing skill requirements...');
    
    try {
      const userSkills = resumes.flatMap(r => r.tags || []);
      // Context-aware: uses detected role and experience level
      const result = await getSkillRecommendations(detectedRole, userSkills, experienceLevel);
      if (result) {
        setSkillRecommendations(result);
        localStorage.setItem(AI_SKILLS_STORAGE_KEY, JSON.stringify(result));
        toast.success('Skill recommendations ready!', { id: loadingToast });
      } else {
        toast.error('Failed to get recommendations', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error generating skill recommendations:', error);
      toast.error('Error generating recommendations. Please try again.', { id: loadingToast });
    } finally {
      setLoadingSkills(false);
    }
  };

  // Custom tooltip formatter for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            📝 Applications: {payload[0]?.value || 0}
          </p>
          <p className="text-sm text-green-600">
            🎯 Interviews: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Test Premium Banner */}
      {FORCE_PREMIUM_TESTING && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-yellow-600 text-xl mr-2">🧪</span>
              <span className="text-sm font-medium text-yellow-800">Test Premium Mode Active - All premium features unlocked for testing</span>
            </div>
            <Badge variant="warning" className="text-xs">Force Enabled</Badge>
          </div>
        </div>
      )}

      {/* Streak Banner */}
      {streak > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <FireIcon className="h-6 w-6 text-orange-500" />
            <div>
              <p className="font-semibold text-orange-800">🔥 {streak}-day application streak!</p>
              <p className="text-sm text-orange-700">Keep applying daily to maintain your streak!</p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <BellAlertIcon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              {notifications.map(notif => (
                <div key={notif.id} className="mb-2 last:mb-0">
                  <p className="font-medium text-blue-800">{notif.title}</p>
                  <p className="text-sm text-blue-700">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Report Banner */}
      {weeklyReport && weeklyReport.applications > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <DocumentChartBarIcon className="h-6 w-6 text-purple-500" />
            <div className="flex-1">
              <p className="font-semibold text-purple-800">Weekly Report ({weeklyReport.weekStart} - {weeklyReport.weekEnd})</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                <p className="text-xs text-purple-700">📝 {weeklyReport.applications} applications</p>
                <p className="text-xs text-purple-700">🎯 {weeklyReport.interviews} interviews</p>
                <p className="text-xs text-purple-700">🏆 {weeklyReport.hired} offers</p>
                <p className="text-xs text-purple-700">📈 {weeklyReport.responseRate}% response rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData?.displayName || 'Career Seeker'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your career progress at a glance
          </p>
          <p className="text-sm text-gray-500 mt-1">
            🎯 Target Role: {detectedRole} • Level: {experienceLevel}
          </p>
        </div>
        <div className="flex gap-2">
          {isRealAI && (
            <Badge variant="success" className="px-3 py-1">
              🤖 Real AI Active
            </Badge>
          )}
          {streak > 0 && (
            <Badge variant="warning" className="px-3 py-1">
              🔥 {streak} Day Streak
            </Badge>
          )}
        </div>
      </div>

      {/* Goal Tracking Progress Bar */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Weekly Goal Progress</span>
            <span className="text-sm font-medium text-primary-600">
              {weeklyGoalData.current}/{weeklyGoalData.goal} applications
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary-600 rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${weeklyGoalData.percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {weeklyGoalData.percent >= 100 
              ? '🎉 Congratulations! You\'ve reached your weekly goal!' 
              : `📈 You're ${weeklyGoalData.percent.toFixed(0)}% to your weekly goal. ${weeklyGoalData.goal - weeklyGoalData.current} more applications needed.`}
          </p>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resume Analytics
            <Badge variant="success" className="ml-2 text-xs">Premium</Badge>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'insights'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Insights
            <Badge variant="success" className="ml-2 text-xs">
              {isRealAI ? 'Real AI' : 'Mock AI'}
            </Badge>
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-green-600 mt-2">+{stats.total > 0 ? Math.floor(Math.random() * 20) : 0}% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Response Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{responseRate}%</p>
                    <p className="text-xs text-green-600 mt-2">{stats.interview} interviews</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
                    <p className="text-xs text-green-600 mt-2">{stats.hired} offers</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Resumes</p>
                    <p className="text-3xl font-bold text-gray-900">{resumes.length}</p>
                    <p className="text-xs text-gray-600 mt-2">Unlimited for Premium</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Insight above chart */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              📈 Your response rate is {responseRate}%. {responseRate > 30 ? 'Great job! Keep it up!' : 'Keep improving by tailoring your resume to each application.'}
            </p>
          </div>

          {/* Weekly Progress Chart with custom tooltip */}
          {weeklyData.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
                <p className="text-sm text-gray-600 mt-1">Applications & interviews over time</p>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="applications" 
                        stroke="#0ea5e9" 
                        strokeWidth={2}
                        name="applications"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interviews" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="interviews"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Status Distribution */}
          {statusData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
                </CardHeader>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Activity</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Applications Sent</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <CalendarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interviews</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.interview}</p>
                      </div>
                      <ClockIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Job Offers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
                      </div>
                      <TrophyIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/resumes'}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left group"
            >
              <DocumentTextIcon className="h-6 w-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900">Create New Resume</h4>
              <p className="text-sm text-gray-600 mt-1">Build professional resumes</p>
            </button>
            <button 
              onClick={() => window.location.href = '/jobs'}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left group"
            >
              <BriefcaseIcon className="h-6 w-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900">Track Application</h4>
              <p className="text-sm text-gray-600 mt-1">Add job applications</p>
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left group"
            >
              <LightBulbIcon className="h-6 w-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-medium text-gray-900">Get AI Insights</h4>
              <p className="text-sm text-gray-600 mt-1">Personalized career advice</p>
            </button>
          </div>
        </motion.div>
      )}

      {/* Resume Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResumeAnalytics />
        </motion.div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* AI Insights Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <RocketLaunchIcon className="h-5 w-5 text-primary-600 mr-2" />
                    AI-Powered Career Insights
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Click the button below to get personalized career advice
                  </p>
                </div>
                <Button 
                  onClick={generateAIInsights} 
                  isLoading={loadingInsights || isProcessing}
                  disabled={loadingInsights || isProcessing}
                  size="sm"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {aiInsights ? 'Refresh Insights' : 'Generate Insights'}
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {loadingInsights ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Generating insights...</p>
                  <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
                </div>
              ) : aiInsights ? (
                <div className="space-y-6">
                  {/* Action Plan */}
                  {aiInsights.actionPlan && aiInsights.actionPlan.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Your Action Plan
                      </h4>
                      <ul className="space-y-2">
                        {aiInsights.actionPlan.map((action, i) => (
                          <li key={i} className="text-sm text-blue-800 flex items-start">
                            <span className="mr-2">📋</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interview Tips */}
                  {aiInsights.interviewTips && aiInsights.interviewTips.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-green-600" />
                        Interview Preparation Tips
                      </h4>
                      <ul className="space-y-2">
                        {aiInsights.interviewTips.map((tip, i) => (
                          <li key={i} className="text-sm text-green-800 flex items-start">
                            <span className="mr-2">🎯</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Industry Insights */}
                  {aiInsights.industryInsights && aiInsights.industryInsights.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Industry Insights
                      </h4>
                      <ul className="space-y-2">
                        {aiInsights.industryInsights.map((insight, i) => (
                          <li key={i} className="text-sm text-purple-800 flex items-start">
                            <span className="mr-2">📊</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Motivational Message */}
                  {aiInsights.motivationalMessage && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-800 italic">
                        💪 "{aiInsights.motivationalMessage}"
                      </p>
                    </div>
                  )}

                  {/* Next Week Focus */}
                  {aiInsights.nextWeekFocus && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Next Week's Focus
                      </h4>
                      <p className="text-sm text-indigo-800">{aiInsights.nextWeekFocus}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Click "Generate Insights" to get AI-powered career advice</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Skill Recommendations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-2" />
                    AI Skill Recommendations
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Skills to learn for your career growth (Role: {detectedRole} • Level: {experienceLevel})
                  </p>
                </div>
                <Button 
                  onClick={generateSkillRecommendations} 
                  isLoading={loadingSkills || isProcessing}
                  disabled={loadingSkills || isProcessing}
                  size="sm"
                  variant="outline"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {skillRecommendations ? 'Refresh Skills' : 'Get Recommendations'}
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {loadingSkills ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Analyzing skill requirements...</p>
                  <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
                </div>
              ) : skillRecommendations ? (
                <div className="space-y-6">
                  {/* Missing Skills */}
                  {skillRecommendations.missingSkills && skillRecommendations.missingSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Skills to Learn</h4>
                      <div className="space-y-3">
                        {skillRecommendations.missingSkills.map((skill, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{skill.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Priority: {skill.priority || 'Medium'} • {skill.estimatedTime || '2-3 weeks'}
                              </p>
                            </div>
                            <Badge variant={skill.priority === 'high' ? 'danger' : 'warning'}>
                              {skill.priority || 'Medium'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Resources */}
                  {skillRecommendations.learningResources && skillRecommendations.learningResources.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommended Resources</h4>
                      <div className="space-y-2">
                        {skillRecommendations.learningResources.map((resource, i) => (
                          <div key={i} className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">{resource.skill}</p>
                            <p className="text-xs text-blue-700 mt-1">{resource.resource}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Time & Next Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillRecommendations.estimatedTotalTime && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">Estimated Learning Time</p>
                        <p className="text-lg font-bold text-green-900">{skillRecommendations.estimatedTotalTime}</p>
                      </div>
                    )}
                    {skillRecommendations.nextSteps && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-600 mb-1">Next Steps</p>
                        <p className="text-sm text-purple-900">{typeof skillRecommendations.nextSteps === 'string' ? skillRecommendations.nextSteps : skillRecommendations.nextSteps[0]}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Click "Get Recommendations" for personalized skill advice</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Applications</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{responseRate}%</p>
              <p className="text-xs text-gray-600">Response Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.interview}</p>
              <p className="text-xs text-gray-600">Interviews</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              🤖 AI insights powered by {isRealAI ? 'OpenRouter AI' : 'Mock AI'} • {isRealAI ? 'Please wait 5 seconds between requests' : 'No rate limits for testing'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedDashboard;