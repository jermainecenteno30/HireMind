import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// 🔥 FORCE FREE ACCESS - SET TO true TO UNLOCK AI FOR ALL USERS 🔥
const FORCE_FREE_ACCESS = true;

const AIResumeFeedback = ({ resumeContent, resumeTitle, userSkills = [] }) => {
  const { isPremium: userIsPremium } = useAuth();
  const { analyzeResume, isProcessing } = useAI();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Allow free access for testing
  const hasAccess = FORCE_FREE_ACCESS || userIsPremium;

  const handleAnalyze = async () => {
    if (!resumeContent) {
      toast.error('Please add content to your resume first');
      return;
    }

    if (!analyzeResume || typeof analyzeResume !== 'function') {
      toast.error('AI service not available. Please try again later.');
      console.error('analyzeResume is not a function:', analyzeResume);
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeResume(resumeContent, resumeTitle, userSkills);
      
      if (result && !result.error) {
        setFeedback(result);
        toast.success('AI analysis complete!');
      } else {
        toast.error('Failed to analyze resume. Please try again.');
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast.error('Error analyzing resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no access, show login/upgrade prompt (but we're forcing free access)
  if (!hasAccess) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Resume Feedback</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Get intelligent, personalized feedback powered by Google Gemini AI. 
            Improve your resume and land more interviews.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-5 rounded-lg inline-block">
            <p className="text-sm font-semibold text-primary-900 mb-1">✨ Premium AI Feature</p>
            <p className="text-xs text-primary-700">Upgrade to unlock AI-powered insights</p>
            <button className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
              Upgrade Now - ₱99/month
            </button>
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
              AI Resume Feedback {FORCE_FREE_ACCESS && <Badge variant="success" className="ml-2 text-xs">Free Access</Badge>}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Powered by AI • Analyzing "{resumeTitle || 'Your Resume'}"
            </p>
          </div>
          <Button 
            onClick={handleAnalyze} 
            isLoading={loading || isProcessing}
            disabled={loading || isProcessing}
          >
            {feedback ? <ArrowPathIcon className="h-4 w-4 mr-2" /> : <LightBulbIcon className="h-4 w-4 mr-2" />}
            {feedback ? 'Reanalyze' : 'Analyze with AI'}
          </Button>
        </div>
      </CardHeader>
      
      {feedback && (
        <CardBody className="space-y-6">
          {/* ATS Score */}
          {feedback.atsScore && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ATS Compatibility Score</span>
                <span className="text-2xl font-bold text-primary-600">{feedback.atsScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${feedback.atsScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {feedback.atsScore >= 80 ? 'Great! Your resume is ATS-friendly.' :
                 feedback.atsScore >= 60 ? 'Good, but could be improved.' :
                 'Needs improvement to pass ATS filters.'}
              </p>
            </div>
          )}

          {/* Key Keywords */}
          {feedback.keywords && feedback.keywords.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <TagIcon className="h-4 w-4 mr-2 text-primary-600" />
                Key Keywords Detected
              </h4>
              <div className="flex flex-wrap gap-2">
                {feedback.keywords.map((keyword, i) => (
                  <Badge key={i} variant="info">{keyword}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                Strengths ✅
              </h4>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start">
                    <span className="mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                <XCircleIcon className="h-5 w-5 mr-2 text-orange-600" />
                Areas for Improvement 🔧
              </h4>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-orange-800 flex items-start">
                    <span className="mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-purple-600" />
                AI-Powered Suggestions 💡
              </h4>
              <ul className="space-y-2">
                {feedback.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-purple-800 flex items-start">
                    <span className="mr-2">✨</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      )}

      {!feedback && !loading && !isProcessing && (
        <CardBody className="text-center py-8">
          <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Click "Analyze with AI" to get intelligent feedback on your resume
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Powered by AI • Free for all users
          </p>
        </CardBody>
      )}

      {(loading || isProcessing) && !feedback && (
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-gray-600">AI is analyzing your resume...</p>
          <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
        </CardBody>
      )}
    </Card>
  );
};

export default AIResumeFeedback;