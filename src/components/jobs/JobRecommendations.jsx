import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { useResumes } from '../../hooks/useResumes';
import { SparklesIcon, BriefcaseIcon, BuildingOfficeIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const JobRecommendations = () => {
  const { isPremium } = useAuth();
  const { resumes } = useResumes();
  const { getJobRecommendations, isProcessing } = useAI();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  const loadRecommendations = async () => {
    if (!isPremium) return;
    
    setLoading(true);
    const userSkills = resumes.flatMap(r => r.tags || []);
    const result = await getJobRecommendations(userSkills, resumes[0]?.content);
    if (result && !result.error) {
      setRecommendations(result);
    }
    setLoading(false);
  };

  const saveJob = (jobId) => {
    setSavedJobs([...savedJobs, jobId]);
    // In production, save to Firestore
  };

  useEffect(() => {
    if (isPremium && resumes.length > 0) {
      loadRecommendations();
    }
  }, [isPremium, resumes]);

  if (!isPremium) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Job Recommendations</h3>
          <p className="text-gray-600 mb-4">
            Get AI-powered job recommendations based on your skills and resume!
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
              Smart Job Recommendations
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Based on your skills and resume
            </p>
          </div>
          <Button onClick={loadRecommendations} isLoading={loading || isProcessing} size="sm" variant="outline">
            Refresh Recommendations
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Finding jobs that match your profile...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {job.company}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {job.location || 'Remote/Philippines'}
                      </span>
                      <span className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        {job.salary || 'Competitive'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={job.matchScore >= 80 ? 'success' : job.matchScore >= 60 ? 'warning' : 'default'}>
                    {job.matchScore}% Match
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mt-3">{job.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills?.slice(0, 5).map((skill, i) => (
                    <Badge key={i} variant="info" className="text-xs">{skill}</Badge>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm">Apply Now</Button>
                  {!savedJobs.includes(job.id) && (
                    <Button size="sm" variant="outline" onClick={() => saveJob(job.id)}>
                      Save for Later
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Click "Refresh Recommendations" to find jobs that match your profile</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default JobRecommendations;