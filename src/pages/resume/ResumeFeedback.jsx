import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { SparklesIcon, LightBulbIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ResumeFeedback = ({ resumeContent, resumeTitle }) => {
  const { isPremium } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock AI feedback - In production, this would call an AI API
  const generateMockFeedback = (content) => {
    const feedbacks = {
      strengths: [],
      weaknesses: [],
      suggestions: []
    };

    // Check for metrics/numbers
    if (content.match(/\d+%/)) {
      feedbacks.strengths.push("✅ Good use of percentage metrics");
    } else {
      feedbacks.weaknesses.push("❌ Missing quantifiable achievements (e.g., 'Increased sales by 30%')");
      feedbacks.suggestions.push("Add specific numbers and metrics to your bullet points");
    }

    // Check for action verbs
    const actionVerbs = ['led', 'managed', 'created', 'developed', 'implemented', 'designed'];
    const hasActionVerbs = actionVerbs.some(verb => content.toLowerCase().includes(verb));
    if (hasActionVerbs) {
      feedbacks.strengths.push("✅ Strong action verbs used");
    } else {
      feedbacks.weaknesses.push("❌ Weak or missing action verbs");
      feedbacks.suggestions.push(`Start bullet points with strong action verbs: ${actionVerbs.slice(0,5).join(', ')}`);
    }

    // Check length
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 500) {
      feedbacks.strengths.push("✅ Comprehensive resume with good detail");
    } else if (wordCount < 200) {
      feedbacks.weaknesses.push("❌ Resume is too brief");
      feedbacks.suggestions.push("Add more details about your experience and achievements");
    }

    // Check for keywords
    const keywords = ['experienced', 'skilled', 'proficient', 'certified'];
    const hasKeywords = keywords.some(kw => content.toLowerCase().includes(kw));
    if (!hasKeywords) {
      feedbacks.suggestions.push("Add industry-relevant keywords to pass ATS screening");
    }

    return feedbacks;
  };

  const analyzeResume = () => {
    if (!isPremium) {
      toast.error('Premium feature. Upgrade to get AI resume feedback!');
      return;
    }

    if (!resumeContent) {
      toast.error('No resume content to analyze');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const analysis = generateMockFeedback(resumeContent);
      setFeedback(analysis);
      setLoading(false);
      toast.success('Analysis complete!');
    }, 1500);
  };

  if (!isPremium) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Resume Feedback</h3>
          <p className="text-gray-600 mb-4">
            Get intelligent suggestions to improve your resume and land more interviews
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg inline-block">
            <p className="text-sm font-semibold text-primary-900">Premium Feature</p>
            <p className="text-xs text-primary-700">Upgrade to unlock AI insights</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Resume Feedback</h3>
            <p className="text-sm text-gray-600 mt-1">Get intelligent suggestions for "{resumeTitle}"</p>
          </div>
          <Button onClick={analyzeResume} isLoading={loading} size="sm">
            <LightBulbIcon className="h-4 w-4 mr-2" />
            Analyze Resume
          </Button>
        </div>
      </CardHeader>
      
      {feedback && (
        <CardBody className="space-y-6">
          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {feedback.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-green-800">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {feedback.weaknesses.length > 0 && (
            <div>
              <h4 className="font-medium text-red-900 mb-2 flex items-center">
                <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1">
                {feedback.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-sm text-red-800">{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-blue-600" />
                AI Suggestions
              </h4>
              <ul className="space-y-2">
                {feedback.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-blue-800">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
};

export default ResumeFeedback;