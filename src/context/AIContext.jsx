import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import openrouterService from '../services/openrouterService';
import geminiService from '../services/geminiService';
import mockAIService from '../services/mockAIService';
import toast from 'react-hot-toast';

// 🔥 FOR TESTING ONLY - Set to false for production
const FORCE_PREMIUM_AI_TESTING = true;

// 🔥 FORCE USE MOCK AI - Set to true to bypass Gemini/OpenRouter
const FORCE_MOCK_AI = true;

const AIContext = createContext(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const { isPremium: userIsPremium } = useAuth();
  // For testing: force premium OR use real user status
  const isPremium = FORCE_PREMIUM_AI_TESTING || userIsPremium;
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine which AI service to use based on user tier
  const getAIService = () => {
    // FORCE USE MOCK AI FOR TESTING
    if (FORCE_MOCK_AI) {
      console.log('📝 Using Mock AI (Forced for testing)');
      return { service: mockAIService, name: 'Mock AI' };
    }
    
    if (isPremium) {
      console.log('💎 Premium User - Using OpenRouter AI');
      return { service: openrouterService, name: 'OpenRouter' };
    } else {
      // Free users get Gemini first, with fallback to Mock AI
      if (geminiService.isRealAIAvailable && geminiService.isRealAIAvailable()) {
        console.log('🌟 Free User - Using Google Gemini AI');
        return { service: geminiService, name: 'Gemini' };
      } else {
        console.log('📝 Free User - Using Mock AI (Gemini unavailable)');
        return { service: mockAIService, name: 'Mock AI' };
      }
    }
  };

  const withAICheck = async (aiFunction, errorMessage = 'AI service error') => {
    setIsProcessing(true);
    try {
      const result = await aiFunction();
      return result;
    } catch (error) {
      console.error('AI Error:', error);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getCareerInsights = (jobs, resumes) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.getCareerInsights(jobs, resumes),
      'Failed to get career insights'
    );
  };

  const getSkillRecommendations = (targetRole, currentSkills, experience) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.getSkillRecommendations(targetRole, currentSkills, experience),
      'Failed to get skill recommendations'
    );
  };

  const matchResumeToJob = (resumeContent, jobDescription, jobTitle) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.matchResumeToJob(resumeContent, jobDescription, jobTitle),
      'Failed to analyze job match'
    );
  };

  // Analyze resume and provide feedback
  const analyzeResume = (resumeContent, resumeTitle, userSkills) => {
    const { service, name } = getAIService();
    console.log(`🔍 analyzeResume called - Using service: ${name}`);
    console.log(`🔍 Service has analyzeResume? ${typeof service.analyzeResume === 'function' ? 'Yes' : 'No'}`);
    
    return withAICheck(
      async () => {
        // Ensure the function exists
        if (typeof service.analyzeResume !== 'function') {
          console.error(`analyzeResume is not a function on ${name}`);
          // Return mock data as fallback
          return {
            strengths: [
              "✅ Clear professional summary",
              "✅ Good use of technical keywords",
              "✅ Relevant experience highlighted"
            ],
            improvements: [
              "❌ Add more quantifiable achievements",
              "❌ Include specific metrics"
            ],
            suggestions: [
              "💡 Add metrics like 'Improved performance by 30%'",
              "💡 Use stronger action verbs"
            ],
            atsScore: 72,
            keywords: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
            wordCount: resumeContent?.split(/\s+/).length || 0
          };
        }
        return await service.analyzeResume(resumeContent, resumeTitle, userSkills);
      },
      'Failed to analyze resume'
    );
  };

  // Optimize resume content
  const optimizeResume = (resumeContent, improvementType) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.optimizeResume(resumeContent, improvementType),
      'Failed to optimize resume'
    );
  };

  // Generate ATS bullet point
  const generateAtsBullet = (resumeContent, type) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.generateAtsBullet(resumeContent, type),
      'Failed to generate ATS bullet'
    );
  };

  // Rewrite resume section
  const rewriteSection = (resumeContent, section) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.rewriteSection(resumeContent, section),
      'Failed to rewrite section'
    );
  };

  // Parse job description
  const parseJobDescription = (content, inputType) => {
    const { service } = getAIService();
    return withAICheck(
      () => service.parseJobDescription(content, inputType),
      'Failed to parse job description'
    );
  };

  // Generate AI-powered follow-up suggestion for job applications
  const getFollowUpSuggestion = async (job) => {
    const { service } = getAIService();
    
    return withAICheck(
      async () => {
        // Check if service has the method
        if (service.getFollowUpSuggestion) {
          return await service.getFollowUpSuggestion(job);
        }
        
        // Fallback to smart rule-based suggestion if AI method not available
        const daysSinceApplied = Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24));
        const status = job.status;
        
        if (status === 'hired') {
          return "Congratulations on the offer! Send a thank you note and complete onboarding paperwork.";
        }
        
        if (status === 'rejected') {
          return "Don't get discouraged! Ask for feedback if possible, and keep applying to other opportunities.";
        }
        
        if (status === 'interview') {
          return "Prepare for your interview by researching the company, practicing common questions, and preparing questions to ask.";
        }
        
        if (daysSinceApplied > 21) {
          return `It's been ${daysSinceApplied} days without response. Consider sending a polite follow-up email or moving on to other opportunities.`;
        } else if (daysSinceApplied > 14) {
          return `Perfect time to follow up! Send a brief email expressing continued interest in the ${job.role} position.`;
        } else if (daysSinceApplied > 7) {
          return `Wait a bit longer (recommended follow-up in ${14 - daysSinceApplied} days). Use this time to prepare for potential interviews.`;
        } else {
          return `Your application is still fresh. Keep applying to other positions while waiting for a response.`;
        }
      },
      'Failed to generate follow-up suggestion'
    );
  };

  // Get current AI provider name for display
  const getCurrentAIProvider = () => {
    if (FORCE_MOCK_AI) return 'Mock AI (Testing)';
    if (isPremium) return 'OpenRouter (Premium)';
    if (geminiService.isRealAIAvailable && geminiService.isRealAIAvailable()) return 'Google Gemini (Free)';
    return 'Mock AI (Free)';
  };

  // Get real AI status
  const isRealAIAvailable = () => {
    if (FORCE_MOCK_AI) return false;
    if (isPremium) return true;
    return geminiService.isRealAIAvailable && geminiService.isRealAIAvailable();
  };

  return (
    <AIContext.Provider value={{
      getCareerInsights,
      getSkillRecommendations,
      matchResumeToJob,
      getFollowUpSuggestion,
      analyzeResume,
      optimizeResume,
      generateAtsBullet,
      rewriteSection,
      parseJobDescription,
      isProcessing,
      isPremium,
      isGeminiAvailable: geminiService.isRealAIAvailable && geminiService.isRealAIAvailable(),
      currentAIProvider: getCurrentAIProvider(),
      isRealAI: isRealAIAvailable()
    }}>
      {children}
    </AIContext.Provider>
  );
};