import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  SparklesIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const JobMatchScore = ({ job, resumeContent, onClose }) => {
  const { isPremium } = useAuth();
  const { matchResumeToJob, isProcessing } = useAI();
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matchesUsed, setMatchesUsed] = useState(() => {
    return parseInt(localStorage.getItem('matches_used') || '0');
  });

  const MAX_FREE_MATCHES = 5;

  const canUseMatch = () => {
    if (isPremium) return true;
    return matchesUsed < MAX_FREE_MATCHES;
  };

  const getRemainingMatches = () => {
    if (isPremium) return 'Unlimited';
    return MAX_FREE_MATCHES - matchesUsed;
  };

  const handleMatch = async () => {
    if (!canUseMatch()) {
      alert(`Free tier limit reached. You've used ${MAX_FREE_MATCHES}/${MAX_FREE_MATCHES} matches. Upgrade to Pro for unlimited matches!`);
      return;
    }

    setLoading(true);
    const result = await matchResumeToJob(resumeContent, job.description || '', job.role);
    if (result && !result.error) {
      setMatchResult(result);
      if (!isPremium) {
        localStorage.setItem('matches_used', matchesUsed + 1);
        setMatchesUsed(matchesUsed + 1);
      }
    }
    setLoading(false);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resume Match Score</h2>
              <p className="text-gray-600 mt-1">
                How well does your resume match {job.role} at {job.company}?
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!matchResult ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Analyze how well your resume matches this job description
              </p>
              
              {!isPremium && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    Free tier: {getRemainingMatches()} matches remaining this month
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary-600 rounded-full h-2 transition-all"
                      style={{ width: `${(matchesUsed / MAX_FREE_MATCHES) * 100}%` }}
                    />
                  </div>
                  {matchesUsed >= MAX_FREE_MATCHES && (
                    <p className="text-xs text-primary-600 mt-2">
                      Upgrade to Pro for unlimited matches! Only ₱99/month
                    </p>
                  )}
                </div>
              )}
              
              <Button onClick={handleMatch} isLoading={loading || isProcessing}>
                {isPremium ? 'Analyze Match' : `Analyze Match (${getRemainingMatches()} remaining)`}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Match Score Circle */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getMatchBgColor(matchResult.matchScore)} mb-4`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getMatchColor(matchResult.matchScore)}`}>
                      {matchResult.matchScore}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Match Score</div>
                  </div>
                </div>
                <Badge variant={matchResult.matchScore >= 70 ? 'success' : matchResult.matchScore >= 50 ? 'warning' : 'danger'}>
                  {matchResult.interviewProbability || 'Medium'} Chance of Interview
                </Badge>
              </div>

              {/* Skill Gap Severity */}
              {matchResult.skillGapSeverity && (
                <div className="text-center">
                  <Badge variant={matchResult.skillGapSeverity === 'None' ? 'success' : matchResult.skillGapSeverity === 'Minor' ? 'warning' : 'danger'}>
                    {matchResult.skillGapSeverity} Skill Gap
                  </Badge>
                </div>
              )}

              {/* Matching Skills */}
              {matchResult.matchingSkills && matchResult.matchingSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    Skills That Match
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matchingSkills.map((skill, i) => (
                      <Badge key={i} variant="success">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {matchResult.missingSkills && matchResult.missingSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    Missing Skills to Add
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingSkills.map((skill, i) => (
                      <Badge key={i} variant="danger">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Missing Skills */}
              {matchResult.optionalMissingSkills && matchResult.optionalMissingSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    Nice to Have (Optional)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.optionalMissingSkills.map((skill, i) => (
                      <Badge key={i} variant="warning">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {matchResult.recommendations && matchResult.recommendations.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {matchResult.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start">
                        <span className="mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Salary Range */}
              {matchResult.salaryRange && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                    Estimated Salary Range
                  </h3>
                  <p className="text-lg font-bold text-green-900">{matchResult.salaryRange}</p>
                  <p className="text-xs text-green-700 mt-1">
                    Based on market data for this role in Philippines
                  </p>
                </div>
              )}

              {/* ATS Compatibility */}
              {matchResult.atsCompatibility && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-purple-600 mr-2" />
                    ATS Compatibility
                  </h3>
                  <p className="text-purple-900 font-medium">{matchResult.atsCompatibility}</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Applicant Tracking System (ATS) friendliness score
                  </p>
                </div>
              )}

              {/* Estimated Preparation Time */}
              {matchResult.estimatedPrepTime && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2 flex items-center">
                    <ClockIcon className="h-5 w-5 text-orange-600 mr-2" />
                    Estimated Preparation Time
                  </h3>
                  <p className="text-orange-900 font-medium">{matchResult.estimatedPrepTime}</p>
                </div>
              )}

              {/* Upgrade Prompt for Free Users */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg text-center">
                  <SparklesIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-primary-900">Love this feature?</p>
                  <p className="text-xs text-primary-700 mt-1">
                    Upgrade to Pro for unlimited matches, ATS scanner, and detailed insights!
                  </p>
                  <Button size="sm" className="mt-3">Upgrade to Pro - ₱99/month</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchScore;