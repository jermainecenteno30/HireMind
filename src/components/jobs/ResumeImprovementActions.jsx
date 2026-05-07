import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { 
  SparklesIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// TEMPORARY: Force free access for testing - Set to false for production
const FORCE_FREE_ACCESS = true;

const ResumeImprovementActions = ({ resumeContent, resumeId, onUpdate }) => {
  const { isPremium: userIsPremium } = useAuth();
  // Allow free access for testing
  const hasAccess = FORCE_FREE_ACCESS || userIsPremium;
  
  const { optimizeResume, generateAtsBullet, rewriteSection, isProcessing } = useAI();
  const [actionType, setActionType] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const actions = [
    {
      id: 'missing-skills',
      name: 'Add Missing Skills',
      description: 'Add relevant skills based on job requirements',
      icon: '🎯',
      color: 'primary'
    },
    {
      id: 'ats-bullet',
      name: 'Generate ATS Bullet',
      description: 'Create optimized bullet points for ATS',
      icon: '📝',
      color: 'blue'
    },
    {
      id: 'rewrite-summary',
      name: 'Rewrite Summary',
      description: 'Improve your professional summary',
      icon: '✍️',
      color: 'green'
    },
    {
      id: 'optimize-all',
      name: 'Full Resume Optimization',
      description: 'Comprehensive AI-powered improvement',
      icon: '✨',
      color: 'purple'
    }
  ];

  const handleAction = async (action) => {
    if (!hasAccess) {
      toast.error('Please login to use resume improvement tools');
      return;
    }

    setActionType(action.id);
    setLoading(true);
    
    let result;
    switch(action.id) {
      case 'missing-skills':
        result = await generateAtsBullet(resumeContent, 'skills');
        break;
      case 'ats-bullet':
        result = await generateAtsBullet(resumeContent, 'bullet');
        break;
      case 'rewrite-summary':
        result = await rewriteSection(resumeContent, 'summary');
        break;
      case 'optimize-all':
        result = await optimizeResume(resumeContent, 'ats');
        break;
      default:
        result = null;
    }
    
    if (result) {
      setResult(result);
      toast.success(`${action.name} completed! Review the changes below.`);
    } else {
      toast.error('Failed to generate improvement');
    }
    setLoading(false);
  };

  const acceptChanges = () => {
    if (result && onUpdate) {
      onUpdate(result);
      toast.success('Resume updated successfully!');
      setResult(null);
      setActionType(null);
    }
  };

  const rejectChanges = () => {
    setResult(null);
    setActionType(null);
    toast.info('Changes discarded');
  };

  // If no access, show login prompt (not upgrade prompt)
  if (!hasAccess) {
    return (
      <Card>
        <CardBody className="text-center py-6">
          <SparklesIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">AI Resume Improvement</p>
          <p className="text-xs text-gray-500 mt-1">Please login to use AI tools</p>
          <Button size="sm" className="mt-3" onClick={() => window.location.href = '/login'}>
            Login to Continue
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
          AI Resume Improvement Tools
        </h3>
        <p className="text-sm text-gray-600 mt-1">Let AI enhance your resume for better results</p>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={loading}
              className={`p-3 rounded-lg text-center transition-all ${
                actionType === action.id && loading
                  ? 'bg-gray-100'
                  : `bg-${action.color}-50 hover:bg-${action.color}-100 border border-${action.color}-200`
              }`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <p className="text-xs font-medium text-gray-900">{action.name}</p>
              <p className="text-xs text-gray-500 hidden md:block">{action.description}</p>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">AI is improving your resume...</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 mb-2">Improved Version</p>
                  <pre className="whitespace-pre-wrap text-sm text-green-800 bg-white p-3 rounded">
                    {result}
                  </pre>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={acceptChanges} size="sm">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Accept Changes
              </Button>
              <Button onClick={rejectChanges} variant="secondary" size="sm">
                <XCircleIcon className="h-4 w-4 mr-2" />
                Discard
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ResumeImprovementActions;