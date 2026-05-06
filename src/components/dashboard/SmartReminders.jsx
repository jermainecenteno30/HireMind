import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { BellIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../context/AuthContext';

const SmartReminders = () => {
  const { jobs } = useJobs();
  const { isPremium } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState([]);

  useEffect(() => {
    generateReminders();
  }, [jobs]);

  const generateReminders = () => {
    const newReminders = [];
    
    // Follow-up reminders for applications older than 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    jobs.forEach(job => {
      const appliedDate = new Date(job.dateApplied);
      if (appliedDate < twoWeeksAgo && job.status === 'applied') {
        newReminders.push({
          id: `followup-${job.id}`,
          type: 'followup',
          title: `Follow up with ${job.company}`,
          description: `You applied for "${job.role}" 2+ weeks ago. Send a follow-up email.`,
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          jobId: job.id
        });
      }
    });

    // Interview preparation reminders
    jobs.forEach(job => {
      if (job.status === 'interview' && job.interviewDate) {
        const interviewDate = new Date(job.interviewDate);
        const daysUntil = Math.ceil((interviewDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3 && daysUntil > 0) {
          newReminders.push({
            id: `interview-${job.id}`,
            type: 'interview',
            title: `Prepare for ${job.company} interview`,
            description: `Your interview is in ${daysUntil} day(s). Research the company and practice common questions.`,
            priority: 'high',
            dueDate: interviewDate,
            jobId: job.id
          });
        }
      }
    });

    // Resume update reminder (if no resume updates in 30 days)
    const lastResumeUpdate = localStorage.getItem('lastResumeUpdate');
    if (lastResumeUpdate) {
      const daysSinceUpdate = Math.ceil((new Date() - new Date(lastResumeUpdate)) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 30) {
        newReminders.push({
          id: 'resume-update',
          type: 'resume',
          title: 'Update your resume',
          description: 'It\'s been over a month since your last resume update. Keep it fresh!',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    setReminders(newReminders.filter(r => !completedReminders.includes(r.id)));
  };

  const completeReminder = (reminderId) => {
    setCompletedReminders([...completedReminders, reminderId]);
    setReminders(reminders.filter(r => r.id !== reminderId));
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  const getReminderIcon = (type) => {
    switch(type) {
      case 'followup': return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'interview': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default: return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!isPremium) {
    return (
      <Card>
        <CardBody className="text-center py-6">
          <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Upgrade to Premium for smart reminders</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Reminders</h3>
            <p className="text-sm text-gray-600 mt-1">Never miss a follow-up or opportunity</p>
          </div>
          <Badge variant="info">{reminders.length} pending</Badge>
        </div>
      </CardHeader>
      <CardBody>
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">All caught up! No pending reminders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  {getReminderIcon(reminder.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Due: {reminder.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => completeReminder(reminder.id)}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SmartReminders;