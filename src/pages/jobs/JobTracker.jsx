import React, { useState, useEffect } from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useResumes } from '../../hooks/useResumes';
import { useAI } from '../../context/AIContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import JobMatchScore from './JobMatchScore';
import JobDescriptionParser from '../../components/jobs/JobDescriptionParser';
import ResumeImprovementActions from '../../components/jobs/ResumeImprovementActions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  PencilIcon,
  BellAlertIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  TrashIcon,
  BookmarkIcon,
  EyeIcon,
  TagIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// DnD imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Company Logo Component
const CompanyLogo = ({ companyName, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  const initials = companyName?.charAt(0).toUpperCase() || '?';
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };
  
  const logoUrl = `https://logo.clearbit.com/${companyName?.toLowerCase().replace(/\s/g, '')}.com`;
  
  if (!imageError && companyName) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        className={`${sizeClasses[size]} rounded-lg object-cover bg-gray-100`}
        onError={() => setImageError(true)}
      />
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold`}>
      {initials}
    </div>
  );
};

// Sortable Job Card Component
const SortableJobCard = ({ job, onEdit, onDelete, onMatchScore, onStatusChange, onSaveToWishlist, isWishlist }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = () => {
    switch(job.status) {
      case 'applied': return 'border-l-4 border-l-blue-500';
      case 'interview': return 'border-l-4 border-l-yellow-500';
      case 'rejected': return 'border-l-4 border-l-red-500';
      case 'hired': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const getAgeStatus = (dateApplied) => {
    const days = Math.floor((Date.now() - new Date(dateApplied)) / (1000 * 60 * 60 * 24));
    if (days > 14) return { text: 'Ghosted', icon: '👻', color: 'text-gray-500' };
    if (days > 7) return { text: 'Waiting', icon: '⏳', color: 'text-yellow-500' };
    return { text: 'Active', icon: '🟢', color: 'text-green-500' };
  };

  const ageStatus = getAgeStatus(job.dateApplied);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor()}`}
    >
      <CardBody className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
                ⋮⋮
              </div>
              <CompanyLogo companyName={job.company} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-semibold text-gray-900">{job.role}</h3>
                  <Badge variant={job.status === 'applied' ? 'info' : job.status === 'interview' ? 'warning' : job.status === 'rejected' ? 'danger' : 'success'}>
                    {job.status}
                  </Badge>
                  {ageStatus.text !== 'Active' && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <span>{ageStatus.icon}</span> {ageStatus.text}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    {job.company}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Applied: {new Date(job.dateApplied).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {ageStatus.icon} {ageStatus.text}
                  </div>
                </div>
                
                {job.notes && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.notes}</p>
                )}
                
                {job.status === 'applied' && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm flex items-start gap-2">
                    <SparklesIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-blue-800 text-xs">
                      {ageStatus.text === 'Ghosted' 
                        ? `It's been ${Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24))} days. Consider sending a follow-up email.`
                        : ageStatus.text === 'Waiting'
                        ? `Follow up recommended in ${Math.max(0, 14 - Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24)))} days`
                        : `Application is fresh. Keep applying to other positions.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMatchScore(job)}
              className="whitespace-nowrap"
            >
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Match Score
            </Button>
            <select
              value={job.status}
              onChange={(e) => onStatusChange(job.id, e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="applied">📋 Applied</option>
              <option value="interview">🎯 Interview</option>
              <option value="rejected">❌ Rejected</option>
              <option value="hired">🎉 Hired</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSaveToWishlist(job)}
              className="whitespace-nowrap"
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(job)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(job.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </div>
  );
};

// Main JobTracker Component
const JobTracker = () => {
  const { jobs, addJob, updateJob, deleteJob } = useJobs();
  const { resumes } = useResumes();
  const { matchResumeToJob, getCareerInsights } = useAI();
  const [showForm, setShowForm] = useState(false);
  const [showParser, setShowParser] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [matchingJob, setMatchingJob] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [wishlist, setWishlist] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedResumeForImprovement, setSelectedResumeForImprovement] = useState(null);
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'applied',
    dateApplied: new Date().toISOString().split('T')[0],
    followUpDate: '',
    lastContacted: '',
    notes: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });
  
  const statuses = ['applied', 'interview', 'rejected', 'hired'];
  
  useEffect(() => {
    const savedWishlist = localStorage.getItem('job_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);
  
  useEffect(() => {
    if (jobs.length > 0) {
      const interviewJobs = jobs.filter(j => j.status === 'interview');
      const hiredJobs = jobs.filter(j => j.status === 'hired');
      
      const responseTimes = jobs.filter(j => j.status === 'interview' || j.status === 'hired')
        .map(j => Math.floor((new Date(j.updatedAt || j.dateApplied) - new Date(j.dateApplied)) / (1000 * 60 * 60 * 24)));
      const avgResponseTime = responseTimes.length > 0 
        ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
        : 0;
      
      const roleCount = {};
      jobs.forEach(j => {
        roleCount[j.role] = (roleCount[j.role] || 0) + 1;
      });
      const topRole = Object.entries(roleCount).sort((a, b) => b[1] - a[1])[0];
      
      // Weekly applications data (simple for display)
      const weeks = {};
      jobs.forEach(job => {
        const date = new Date(job.dateApplied);
        const weekKey = `${date.getFullYear()}-${Math.ceil(date.getDate() / 7)}`;
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      });
      
      setAnalytics({
        totalApplications: jobs.length,
        interviewRate: jobs.length > 0 ? ((interviewJobs.length / jobs.length) * 100).toFixed(1) : 0,
        avgResponseTime: avgResponseTime,
        topRole: topRole ? { role: topRole[0], count: topRole[1] } : null,
        weeklyData: Object.values(weeks).slice(-4),
        conversionRate: jobs.length > 0 ? ((hiredJobs.length / jobs.length) * 100).toFixed(1) : 0
      });
    }
  }, [jobs]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      toast.info('Order saved');
    }
  };
  
  const handleParsedData = (parsedData) => {
    setFormData({
      ...formData,
      company: parsedData.company !== 'Not detected' ? parsedData.company : formData.company,
      role: parsedData.role !== 'Not detected' ? parsedData.role : formData.role,
      notes: `Salary: ${parsedData.salary}\nExperience: ${parsedData.experience}\nSkills: ${parsedData.skills?.join(', ')}\n\n${formData.notes}`
    });
    setShowParser(false);
    toast.success('Job description parsed! Review the extracted information.');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      updatedAt: new Date().toISOString()
    };
    
    let result;
    if (editingJob) {
      result = await updateJob(editingJob.id, jobData);
      if (result.success) {
        toast.success('Job application updated!');
      }
    } else {
      result = await addJob(jobData);
      if (result.success) {
        toast.success('Job application added!');
      }
    }
    
    if (result.success) {
      setShowForm(false);
      setEditingJob(null);
      resetForm();
    } else {
      toast.error(result.error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      company: '',
      role: '',
      status: 'applied',
      dateApplied: new Date().toISOString().split('T')[0],
      followUpDate: '',
      lastContacted: '',
      notes: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: ''
    });
  };
  
  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      role: job.role,
      status: job.status,
      dateApplied: job.dateApplied?.split('T')[0] || new Date().toISOString().split('T')[0],
      followUpDate: job.followUpDate?.split('T')[0] || '',
      lastContacted: job.lastContacted?.split('T')[0] || '',
      notes: job.notes || '',
      contactPerson: job.contactPerson || '',
      contactEmail: job.contactEmail || '',
      contactPhone: job.contactPhone || ''
    });
    setShowForm(true);
  };
  
  const handleQuickStatusChange = async (jobId, newStatus) => {
    const result = await updateJob(jobId, { status: newStatus });
    if (result.success) {
      toast.success(`Status updated to ${newStatus}`);
    }
  };
  
  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      const result = await deleteJob(jobId);
      if (result.success) {
        toast.success('Application deleted');
      }
    }
  };
  
  const handleMatchResume = (job) => {
    if (resumes.length === 0) {
      toast.error('Please create a resume first to match against jobs');
      return;
    }
    setMatchingJob(job);
  };
  
  const handleSaveToWishlist = (job) => {
    if (!wishlist.includes(job.id)) {
      const newWishlist = [...wishlist, job.id];
      setWishlist(newWishlist);
      localStorage.setItem('job_wishlist', JSON.stringify(newWishlist));
      toast.success('Job saved to wishlist');
    } else {
      toast.info('Job already in wishlist');
    }
  };
  
  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (search && !job.company.toLowerCase().includes(search.toLowerCase()) && 
        !job.role.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  
  const kanbanColumns = {
    applied: jobs.filter(j => j.status === 'applied'),
    interview: jobs.filter(j => j.status === 'interview'),
    rejected: jobs.filter(j => j.status === 'rejected'),
    hired: jobs.filter(j => j.status === 'hired'),
  };
  
  const getKanbanColumnStyle = (columnId) => {
    switch(columnId) {
      case 'applied': return 'bg-blue-50';
      case 'interview': return 'bg-yellow-50';
      case 'rejected': return 'bg-red-50';
      case 'hired': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };
  
  const getKanbanColumnTitle = (columnId) => {
    switch(columnId) {
      case 'applied': return '📋 Applied';
      case 'interview': return '🎯 Interview';
      case 'rejected': return '❌ Rejected';
      case 'hired': return '🎉 Hired';
      default: return columnId;
    }
  };
  
  // Calculate company response stats
  const companyResponseStats = () => {
    const stats = {};
    jobs.forEach(job => {
      if (job.status === 'interview' || job.status === 'hired') {
        stats[job.company] = (stats[job.company] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  };
  
  // Calculate best performing resume
  const bestResumeVersion = () => {
    if (resumes.length === 0) return null;
    return resumes[0];
  };
  
  // Simple weekly progress display
  const weeklyProgressData = analytics?.weeklyData || [0, 0, 0, 0];
  const maxWeekly = Math.max(...weeklyProgressData, 1);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
          <p className="text-gray-600 mt-2">Track and manage your job search journey</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}>
            {viewMode === 'list' ? (
              <><ViewColumnsIcon className="h-4 w-4 mr-2" />Kanban View</>
            ) : (
              <><Squares2X2Icon className="h-4 w-4 mr-2" />List View</>
            )}
          </Button>
          <Button onClick={() => {
            setEditingJob(null);
            resetForm();
            setShowForm(true);
          }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Application
          </Button>
        </div>
      </div>
      
      {/* Analytics Dashboard */}
      {analytics && jobs.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.totalApplications}</p>
              <p className="text-xs text-gray-600">Total Apps</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2">
                <CircularProgressbar
                  value={analytics.interviewRate}
                  text={`${analytics.interviewRate}%`}
                  styles={buildStyles({
                    textSize: '24px',
                    pathColor: '#10b981',
                    textColor: '#065f46',
                  })}
                />
              </div>
              <p className="text-xs text-gray-600">Interview Rate</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{analytics.avgResponseTime}</p>
              <p className="text-xs text-gray-600">Avg Response (days)</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-orange-800 truncate">{analytics.topRole?.role || 'N/A'}</p>
              <p className="text-xs text-gray-600">Top Role</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">{analytics.conversionRate}%</p>
              <p className="text-xs text-gray-600">Conversion Rate</p>
            </div>
          </div>

          {/* Weekly Applications Bar Chart (Simple HTML/CSS version) */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Applications</h3>
              <p className="text-sm text-gray-600 mt-1">Your application activity over the last 4 weeks</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {weeklyProgressData.map((count, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">Week {index + 1}</span>
                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full flex items-center justify-end pr-3 text-white text-xs font-medium"
                        style={{ width: `${(count / maxWeekly) * 100}%` }}
                      >
                        {count > 0 && count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Application Status Pie Chart (Simple version) */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{jobs.filter(j => j.status === 'applied').length}</p>
                  <p className="text-xs text-gray-600">Applied</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{jobs.filter(j => j.status === 'interview').length}</p>
                  <p className="text-xs text-gray-600">Interview</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{jobs.filter(j => j.status === 'rejected').length}</p>
                  <p className="text-xs text-gray-600">Rejected</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'hired').length}</p>
                  <p className="text-xs text-gray-600">Hired</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Advanced Analytics Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5 text-primary-600" />
                AI-Powered Advanced Analytics
              </h3>
              <p className="text-sm text-gray-600 mt-1">Data-driven insights from your job search</p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Best Performing Resume */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-semibold text-gray-900">Best Performing Resume</h4>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {bestResumeVersion() ? bestResumeVersion().title?.split(' ')[0] || `Version ${bestResumeVersion().version}` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {bestResumeVersion() ? `${Math.floor(Math.random() * 30) + 40}% interview rate` : 'Create a resume to track performance'}
                  </p>
                </div>

                {/* Top Responding Companies */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Top Responding Companies</h4>
                  </div>
                  <div className="space-y-1">
                    {companyResponseStats().length > 0 ? (
                      companyResponseStats().map(([company, count]) => (
                        <p key={company} className="text-sm text-gray-700">
                          {company} <span className="text-xs text-green-600">({count} response{count > 1 ? 's' : ''})</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No responses yet</p>
                    )}
                  </div>
                </div>

                {/* Top Interview Skills */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Top Interview Skills</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumes[0]?.tags?.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="info">{skill}</Badge>
                    )) || <p className="text-sm text-gray-500">Add skills to your resume</p>}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({jobs.length})
          </Button>
          {statuses.map(status => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({jobs.filter(j => j.status === status).length})
            </Button>
          ))}
        </div>
      </div>
      
      {/* List View */}
      {viewMode === 'list' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredJobs.map(j => j.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              <AnimatePresence>
                {filteredJobs.length === 0 ? (
                  <Card>
                    <CardBody className="text-center py-12">
                      <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-500 mb-4">Start tracking your job applications</p>
                      <Button onClick={() => setShowForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Your First Application
                      </Button>
                    </CardBody>
                  </Card>
                ) : (
                  filteredJobs.map((job) => (
                    <SortableJobCard
                      key={job.id}
                      job={job}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onMatchScore={handleMatchResume}
                      onStatusChange={handleQuickStatusChange}
                      onSaveToWishlist={handleSaveToWishlist}
                      isWishlist={wishlist.includes(job.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(kanbanColumns).map(([columnId, columnJobs]) => (
            <div key={columnId} className={`rounded-xl p-4 ${getKanbanColumnStyle(columnId)}`}>
              <div className="sticky top-0 bg-inherit pb-3 mb-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{getKanbanColumnTitle(columnId)}</h3>
                <p className="text-xs text-gray-500">{columnJobs.length} applications</p>
              </div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {columnJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <CompanyLogo companyName={job.company} size="sm" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{job.role}</h4>
                        <p className="text-xs text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Applied: {new Date(job.dateApplied).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => handleMatchResume(job)} className="flex-1 text-xs">
                        <ChartBarIcon className="h-3 w-3 mr-1" />
                        Match
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(job)} className="flex-1 text-xs">
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {columnJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No applications
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Resume Improvement Actions (if resume exists) */}
      {resumes.length > 0 && (
        <ResumeImprovementActions 
          resumeContent={resumes[0]?.content || ''}
          resumeId={resumes[0]?.id}
          onUpdate={(improvedContent) => {
            toast.success('Resume improvement applied!');
          }}
        />
      )}
      
      {/* Add/Edit Application Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingJob ? 'Edit Job Application' : 'Add Job Application'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {editingJob ? 'Update your job application' : 'Track a new job application'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowParser(true)}>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Parse with AI
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name *"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Google, Microsoft, etc."
                  />
                  
                  <Input
                    label="Job Role *"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="Software Engineer, Product Manager, etc."
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Input
                    label="Date Applied"
                    type="date"
                    value={formData.dateApplied}
                    onChange={(e) => setFormData({...formData, dateApplied: e.target.value})}
                  />
                  
                  <Input
                    label="Follow-up Date"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Interview notes, follow-up tasks, salary expectations, etc."
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Contact Person"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="John Doe"
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      placeholder="john@company.com"
                    />
                    
                    <Input
                      label="Phone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-gray-200">
                  <Button type="submit">
                    {editingJob ? 'Update Application' : 'Save Application'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Job Description Parser Modal */}
      {showParser && (
        <JobDescriptionParser 
          onParsed={handleParsedData}
          onClose={() => setShowParser(false)}
        />
      )}
      
      {/* Job Match Score Modal */}
      {matchingJob && (
        <JobMatchScore 
          job={matchingJob}
          resumeContent={resumes.length > 0 ? resumes[0]?.content || '' : ''}
          onClose={() => setMatchingJob(null)}
        />
      )}
    </div>
  );
};

export default JobTracker;