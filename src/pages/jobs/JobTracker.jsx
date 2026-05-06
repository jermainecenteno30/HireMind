import React, { useState, useEffect } from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useResumes } from '../../hooks/useResumes';
import { useAI } from '../../context/AIContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import JobMatchScore from '../../pages/jobs/JobMatchScore';
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
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const JobTracker = () => {
  const { jobs, addJob, updateJob, deleteJob } = useJobs();
  const { resumes } = useResumes();
  const { getFollowUpSuggestion, isProcessing } = useAI();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [matchingJob, setMatchingJob] = useState(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
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
  
  // Quick status buttons configuration
  const quickStatusButtons = [
    { status: 'interview', label: 'Interview', icon: CalendarIcon, color: 'warning' },
    { status: 'rejected', label: 'Rejected', icon: XCircleIcon, color: 'danger' },
    { status: 'hired', label: 'Hired', icon: CheckCircleIcon, color: 'success' }
  ];
  
  // Calculate application aging
  const getApplicationAge = (dateApplied) => {
    const appliedDate = new Date(dateApplied);
    const today = new Date();
    const diffTime = Math.abs(today - appliedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return { text: `${diffDays} days ago`, color: 'success', icon: '🟢', status: 'normal' };
    } else if (diffDays <= 14) {
      return { text: `${diffDays} days ago - Waiting`, color: 'warning', icon: '🟡', status: 'waiting' };
    } else {
      return { text: `${diffDays} days ago - Ghosted`, color: 'danger', icon: '⚠️', status: 'ghosted' };
    }
  };
  
  // Check if follow-up is needed
  const getFollowUpStatus = (job) => {
    if (!job.followUpDate) return null;
    
    const followUpDate = new Date(job.followUpDate);
    const today = new Date();
    const diffDays = Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: '⚠️ Overdue! Follow up today', color: 'danger', urgent: true };
    } else if (diffDays === 0) {
      return { text: '⚠️ Follow up today', color: 'warning', urgent: true };
    } else if (diffDays <= 3) {
      return { text: `⏰ Follow up in ${diffDays} days`, color: 'info', urgent: false };
    }
    return null;
  };
  
  // Generate AI follow-up suggestion
  const generateFollowUpSuggestion = async (job) => {
    if (followUpSuggestions[job.id]) return;
    
    setLoadingSuggestions(prev => ({ ...prev, [job.id]: true }));
    
    try {
      const suggestion = await getFollowUpSuggestion(job);
      if (suggestion) {
        setFollowUpSuggestions(prev => ({ ...prev, [job.id]: suggestion }));
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [job.id]: false }));
    }
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
  
  const handleStatusChange = async (jobId, newStatus) => {
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
  
  const handleFollowUpReminder = (job) => {
    const followUpDate = new Date(job.followUpDate);
    const event = {
      title: `Follow up with ${job.company} - ${job.role}`,
      description: job.notes || 'Follow up on job application',
      startTime: followUpDate,
      endTime: followUpDate
    };
    
    // In production, integrate with calendar API
    toast.success(`Reminder set for ${followUpDate.toLocaleDateString()}`);
  };
  
  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (search && !job.company.toLowerCase().includes(search.toLowerCase()) && 
        !job.role.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  
  const getStatusBadgeVariant = (status) => {
    const variants = {
      applied: 'info',
      interview: 'warning',
      rejected: 'danger',
      hired: 'success'
    };
    return variants[status];
  };
  
  // Calculate stats for analytics
  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    hired: jobs.filter(j => j.status === 'hired').length,
    ghosted: jobs.filter(j => {
      if (j.status !== 'applied') return false;
      const daysSince = (Date.now() - new Date(j.dateApplied)) / (1000 * 60 * 60 * 24);
      return daysSince > 14;
    }).length
  };
  
  const responseRate = stats.total > 0 
    ? ((stats.interview + stats.hired) / stats.total * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
          <p className="text-gray-600 mt-2">Track all your job applications in one place</p>
        </div>
        <Button onClick={() => {
          setEditingJob(null);
          resetForm();
          setShowForm(true);
        }}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Application
        </Button>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-cyan-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-cyan-600">{stats.applied}</p>
          <p className="text-xs text-gray-600">Applied</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.interview}</p>
          <p className="text-xs text-gray-600">Interview</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-xs text-gray-600">Rejected</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
          <p className="text-xs text-gray-600">Hired</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{responseRate}%</p>
          <p className="text-xs text-gray-600">Response</p>
        </div>
      </div>
      
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
            All ({stats.total})
          </Button>
          {statuses.map(status => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({stats[status] || 0})
            </Button>
          ))}
          <Button
            variant={filter === 'ghosted' ? 'primary' : 'secondary'}
            onClick={() => setFilter('ghosted')}
            size="sm"
          >
            Ghosted ({stats.ghosted})
          </Button>
        </div>
      </div>
      
      {/* Job Cards */}
      <div className="grid grid-cols-1 gap-4">
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
            filteredJobs.map((job, index) => {
              const age = getApplicationAge(job.dateApplied);
              const followUpStatus = getFollowUpStatus(job);
              const showGhostedWarning = age.status === 'ghosted' && job.status === 'applied';
              
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardBody className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-semibold text-gray-900">{job.role}</h3>
                            <Badge variant={getStatusBadgeVariant(job.status)}>
                              {job.status}
                            </Badge>
                            {showGhostedWarning && (
                              <Badge variant="danger" className="flex items-center gap-1">
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Ghosted
                              </Badge>
                            )}
                            {followUpStatus && (
                              <Badge variant={followUpStatus.color} className="flex items-center gap-1">
                                <BellAlertIcon className="h-3 w-3" />
                                {followUpStatus.text}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                              {age.icon} {age.text}
                            </div>
                          </div>
                          
                          {/* Follow-up Date Display */}
                          {job.followUpDate && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Follow-up: </span>
                              <span className="font-medium">
                                {new Date(job.followUpDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {/* Last Contacted */}
                          {job.lastContacted && (
                            <div className="text-sm text-gray-500">
                              Last contacted: {new Date(job.lastContacted).toLocaleDateString()}
                            </div>
                          )}
                          
                          {job.notes && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.notes}</p>
                          )}
                          
                          {/* AI Follow-up Suggestion */}
                          {job.status === 'applied' && !followUpSuggestions[job.id] && !loadingSuggestions[job.id] && (
                            <button
                              onClick={() => generateFollowUpSuggestion(job)}
                              className="mt-3 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <SparklesIcon className="h-3 w-3" />
                              Get AI follow-up suggestion
                            </button>
                          )}
                          
                          {loadingSuggestions[job.id] && (
                            <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                              <ArrowPathIcon className="h-3 w-3 animate-spin" />
                              Generating suggestion...
                            </div>
                          )}
                          
                          {followUpSuggestions[job.id] && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm">
                              <p className="text-blue-800">{followUpSuggestions[job.id]}</p>
                            </div>
                          )}
                          
                          {(job.contactPerson || job.contactEmail || job.contactPhone) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-2">Contact Information</p>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                {job.contactPerson && (
                                  <span className="flex items-center">
                                    <DocumentTextIcon className="h-3 w-3 mr-1" />
                                    {job.contactPerson}
                                  </span>
                                )}
                                {job.contactEmail && (
                                  <span className="flex items-center">
                                    <EnvelopeIcon className="h-3 w-3 mr-1" />
                                    {job.contactEmail}
                                  </span>
                                )}
                                {job.contactPhone && (
                                  <span className="flex items-center">
                                    <PhoneIcon className="h-3 w-3 mr-1" />
                                    {job.contactPhone}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {/* Quick Status Buttons */}
                          <div className="flex gap-2">
                            {quickStatusButtons.map(btn => (
                              <Button
                                key={btn.status}
                                size="sm"
                                variant={job.status === btn.status ? 'primary' : 'secondary'}
                                onClick={() => handleQuickStatusChange(job.id, btn.status)}
                                className="whitespace-nowrap"
                              >
                                <btn.icon className="h-3 w-3 mr-1" />
                                {btn.label}
                              </Button>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMatchResume(job)}
                              className="whitespace-nowrap"
                            >
                              <ChartBarIcon className="h-4 w-4 mr-1" />
                              Match Score
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(job)}
                              className="whitespace-nowrap"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            {job.followUpDate && !followUpStatus?.urgent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFollowUpReminder(job)}
                              >
                                <BellAlertIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <select
                              value={job.status}
                              onChange={(e) => handleStatusChange(job.id, e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {statuses.map(status => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(job.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      
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
                    placeholder="When to follow up"
                  />
                  
                  <Input
                    label="Last Contacted"
                    type="date"
                    value={formData.lastContacted}
                    onChange={(e) => setFormData({...formData, lastContacted: e.target.value})}
                    placeholder="Last time you contacted them"
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
                  <p className="text-xs text-gray-500 mb-3">Add recruiter/hiring manager contact details</p>
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