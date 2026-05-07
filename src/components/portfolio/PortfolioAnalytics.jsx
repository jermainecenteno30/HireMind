import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { EyeIcon, ChartBarIcon, LinkIcon, DocumentTextIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { portfolioAnalyticsService } from '../../services/portfolioAnalyticsService';

const PortfolioAnalytics = ({ portfolioId, username }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days, portfolioId]);

  const loadAnalytics = async () => {
    setLoading(true);
    const result = await portfolioAnalyticsService.getAnalytics(portfolioId, days);
    if (result.success) {
      setAnalytics(result.data);
    }
    setLoading(false);
  };

  const chartData = analytics?.dailyViews?.map(day => ({
    date: day.date,
    views: day.views
  })).reverse() || [];

  const pieData = analytics?.clickBreakdown ? [
    { name: 'GitHub', value: analytics.clickBreakdown.github, color: '#24292e' },
    { name: 'LinkedIn', value: analytics.clickBreakdown.linkedin, color: '#0077b5' },
    { name: 'Twitter', value: analytics.clickBreakdown.twitter, color: '#1da1f2' },
    { name: 'Resume', value: analytics.clickBreakdown.resume, color: '#10b981' }
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading analytics...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-primary-600" />
            Portfolio Analytics
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Track how employers interact with your portfolio
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'primary' : 'secondary'}
              onClick={() => setDays(d)}
            >
              {d} Days
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
          <EyeIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{analytics?.totalViews || 0}</p>
          <p className="text-xs text-gray-600">Total Views</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <DocumentTextIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{analytics?.clickBreakdown?.resume || 0}</p>
          <p className="text-xs text-gray-600">Resume Downloads</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <LinkIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{analytics?.totalClicks || 0}</p>
          <p className="text-xs text-gray-600">Total Clicks</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
          <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">
            {analytics?.last30DaysViews || 0}
          </p>
          <p className="text-xs text-gray-600">Last 30 Days</p>
        </div>
      </div>

      {/* Views Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold text-gray-900">Daily Views</h4>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Click Breakdown */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h4 className="font-semibold text-gray-900">Click Distribution</h4>
            </CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h4 className="font-semibold text-gray-900">Top Projects</h4>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {Object.entries(analytics?.projectClicks || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([projectId, clicks]) => (
                    <div key={projectId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Project #{projectId.slice(-4)}</span>
                      <Badge variant="info">{clicks} clicks</Badge>
                    </div>
                  ))}
                {Object.keys(analytics?.projectClicks || {}).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No project clicks yet</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PortfolioAnalytics;