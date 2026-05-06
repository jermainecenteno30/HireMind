import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { SparklesIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ResumeOptimizer = ({ resumeContent, resumeTitle, onSaveImproved }) => {
  const { isPremium } = useAuth();
  const { optimizeResume, isProcessing } = useAI();
  const [optimizedContent, setOptimizedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState('ats');
  const [showDiff, setShowDiff] = useState(true);

  const improvementOptions = [
    { id: 'ats', name: 'ATS-Friendly', desc: 'Optimize for applicant tracking systems', icon: '🎯' },
    { id: 'stronger', name: 'Stronger Bullets', desc: 'Use powerful action verbs and metrics', icon: '💪' },
    { id: 'concise', name: 'Concise & Clear', desc: 'Make it more readable and impactful', icon: '📝' },
    { id: 'keywords', name: 'Keyword Rich', desc: 'Add industry-relevant keywords', icon: '🔑' },
    { id: 'professional', name: 'Professional Tone', desc: 'Enhance professional language', icon: '💼' }
  ];

  const optimizeResumeContent = async () => {
    if (!isPremium) {
      toast.error('Premium feature. Upgrade to optimize your resume!');
      return;
    }

    setLoading(true);
    const result = await optimizeResume(resumeContent, selectedImprovement);
    if (result && !result.error) {
      setOptimizedContent(result);
      toast.success('Resume optimized! Review the changes below.');
    }
    setLoading(false);
  };

  const acceptChanges = () => {
    onSaveImproved(optimizedContent);
    toast.success('Resume updated with improvements!');
    setOptimizedContent(null);
  };

  const rejectChanges = () => {
    setOptimizedContent(null);
    toast.info('Changes discarded');
  };

  if (!isPremium) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Resume Optimizer</h3>
          <p className="text-gray-600 mb-4">
            Let AI rewrite and improve your resume bullet points automatically!
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg inline-block">
            <p className="text-sm font-semibold text-primary-900">Premium Feature</p>
            <p className="text-xs text-primary-700">Upgrade to Pro - ₱99/month</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
              AI Resume Optimizer
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Let AI rewrite and improve your resume automatically
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Improvement Options */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {improvementOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedImprovement(option.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedImprovement === option.id
                  ? 'bg-primary-100 border-2 border-primary-500'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <p className="text-xs font-medium text-gray-700">{option.name}</p>
              <p className="text-xs text-gray-500 hidden md:block">{option.desc}</p>
            </button>
          ))}
        </div>

        <Button 
          onClick={optimizeResumeContent} 
          isLoading={loading || isProcessing}
          className="w-full mb-6"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Optimize My Resume
        </Button>

        {/* Comparison View */}
        {optimizedContent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Before vs After</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDiff(!showDiff)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {showDiff ? 'Show Original' : 'Show Side by Side'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">ORIGINAL</p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                  {resumeContent.substring(0, 500)}...
                </pre>
              </div>

              {/* Optimized */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <p className="text-xs font-medium text-green-600 mb-2">OPTIMIZED</p>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                  {optimizedContent.substring(0, 500)}...
                </pre>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={acceptChanges} variant="primary">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Accept Changes
              </Button>
              <Button onClick={rejectChanges} variant="secondary">
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

export default ResumeOptimizer; 