// OpenRouter AI Service - For Premium Tier (Better quality, uses API key)

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = window.location.origin;
const SITE_NAME = 'HireMind';

// Fallback mock data (in case API fails)
const getFallbackData = (type, data) => {
  if (type === 'insights') {
    const jobCount = data?.length || 0;
    return {
      actionPlan: [
        `📋 Follow up with ${jobCount} companies you applied to`,
        "📋 Update your resume with latest skills",
        "📋 Apply to 5 new jobs this week",
        "📋 Prepare for upcoming interviews"
      ],
      interviewTips: [
        "🎯 Research the company thoroughly",
        "🎯 Practice common interview questions",
        "🎯 Prepare questions to ask the interviewer",
        "🎯 Dress professionally"
      ],
      industryInsights: [
        "📊 Tech hiring is strong in 2026",
        "📊 Remote work opportunities are growing"
      ],
      motivationalMessage: "Keep pushing forward! Your next opportunity is coming.",
      nextWeekFocus: "Complete 5 quality applications"
    };
  }
  
  if (type === 'skills') {
    return {
      missingSkills: [
        { name: "React", priority: "high", estimatedTime: "2-3 weeks" },
        { name: "TypeScript", priority: "high", estimatedTime: "1-2 weeks" }
      ],
      learningResources: [
        { skill: "React", resource: "react.dev/learn - Free tutorial" }
      ],
      estimatedTotalTime: "4-6 weeks",
      nextSteps: "Start with React fundamentals"
    };
  }
  
  if (type === 'match') {
    return {
      matchScore: 70,
      matchingSkills: ["JavaScript", "React", "Git"],
      missingSkills: ["TypeScript", "AWS"],
      recommendations: ["Add TypeScript to your skills"],
      interviewProbability: "Medium",
      atsCompatibility: "Good",
      salaryRange: "₱80,000 - ₱120,000"
    };
  }

  if (type === 'optimize') {
    return {
      optimizedContent: "Improved resume content with stronger action verbs and quantifiable achievements. \n\n• Led team projects resulting in 30% efficiency increase\n• Implemented new features increasing user engagement by 25%\n• Collaborated with cross-functional teams to deliver products on time"
    };
  }

  if (type === 'interviewQuestion') {
    return {
      question: "Tell me about a time you faced a challenging situation at work and how you resolved it."
    };
  }

  if (type === 'evaluateAnswer') {
    return {
      feedback: "Good answer! You identified the problem clearly. Consider using the STAR method for better structure.",
      score: 7,
      improvement: "Add more specific metrics to quantify your impact"
    };
  }

  if (type === 'jobRecommendations') {
    return {
      recommendations: [
        {
          id: "rec1",
          title: "Frontend Developer",
          company: "Tech Solutions Inc.",
          location: "Manila, Philippines",
          salary: "₱80,000 - ₱100,000",
          matchScore: 85,
          description: "Looking for a React developer with TypeScript experience.",
          skills: ["React", "TypeScript", "Tailwind CSS", "Git"]
        },
        {
          id: "rec2",
          title: "Full Stack Developer",
          company: "Digital Innovations",
          location: "Remote",
          salary: "₱90,000 - ₱120,000",
          matchScore: 78,
          description: "Join our team building modern web applications.",
          skills: ["React", "Node.js", "MongoDB", "AWS"]
        }
      ]
    };
  }

  if (type === 'followUp') {
    const daysSinceApplied = data?.daysSinceApplied || 10;
    return {
      suggestion: daysSinceApplied > 14 
        ? `It's been ${daysSinceApplied} days. Consider sending a polite follow-up email.`
        : `Wait a bit longer (${14 - daysSinceApplied} days). Prepare for potential interviews.`
    };
  }

  if (type === 'parseJob') {
    return {
      company: "Tech Solutions Inc.",
      role: "Software Developer",
      salary: "₱80,000 - ₱120,000",
      experience: "2-4 years",
      skills: ["JavaScript", "React", "Node.js", "Git"],
      keywords: ["software", "developer", "fullstack", "web", "react"]
    };
  }

  if (type === 'atsBullet') {
    return {
      result: data?.type === 'skills' 
        ? "Recommended skills to add: React.js, TypeScript, Node.js, AWS Cloud, Docker, Git"
        : "• Led a team of 5 developers to successfully deliver a high-impact project, resulting in 30% increase in user engagement and 25% improvement in performance metrics"
    };
  }

  if (type === 'rewriteSection') {
    return {
      result: `[AI Improved - ${data?.section?.toUpperCase() || 'SUMMARY'}]
      
Results-driven professional with 5+ years of experience in software development. Proven track record of delivering high-quality solutions and leading successful projects. Passionate about leveraging cutting-edge technologies to solve complex problems and drive business growth.`
    };
  }
  
  return {};
};

// Helper function for fallback follow-up suggestion
const getFallbackFollowUpSuggestion = (job) => {
  const daysSinceApplied = Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24));
  const status = job.status;
  
  if (status === 'hired') {
    return "🎉 Congratulations on the offer! Send a thank you note, review the offer details carefully, and complete onboarding paperwork.";
  }
  
  if (status === 'rejected') {
    return "💪 Don't get discouraged! Ask for feedback if possible. Every rejection is practice for the right opportunity.";
  }
  
  if (status === 'interview') {
    return "🎯 Prepare for your interview: Research the company culture, practice common questions using the STAR method, and prepare thoughtful questions to ask.";
  }
  
  if (daysSinceApplied > 21) {
    return `⏰ It's been ${daysSinceApplied} days without response. Consider sending a polite follow-up email. If no response after 2 follow-ups, focus energy on new applications.`;
  } else if (daysSinceApplied > 14) {
    return `📧 Perfect time to follow up! Send a brief email expressing continued interest in the ${job.role} position. Keep it professional and concise.`;
  } else if (daysSinceApplied > 7) {
    return `⏳ Wait a bit longer (recommended follow-up in ${14 - daysSinceApplied} days). Use this time to prepare for potential interviews.`;
  } else {
    return `✅ Your application is still fresh. Keep applying to more positions while waiting for responses.`;
  }
};

export const openrouterService = {
  // Generate career insights
  async getCareerInsights(jobApplications, resumeVersions) {
    try {
      if (!OPENROUTER_API_KEY) {
        console.warn('⚠️ No OpenRouter API key found, using fallback data');
        return getFallbackData('insights', jobApplications);
      }

      const jobCount = jobApplications?.length || 0;
      const jobSummary = jobApplications?.slice(0, 8).map(j => 
        `${j.role} at ${j.company} - Status: ${j.status}`
      ).join('\n');

      const prompt = `You are a career coach. Analyze this job search data:

Job Applications:
${jobSummary || 'No applications yet'}

Total applications: ${jobCount}

Return ONLY valid JSON (no extra text):
{
  "actionPlan": ["4 specific actionable items based on the data"],
  "interviewTips": ["4 interview preparation tips"],
  "industryInsights": ["2 current market insights"],
  "motivationalMessage": "Personalized encouragement message",
  "nextWeekFocus": "Specific weekly focus"
}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status);
        return getFallbackData('insights', jobApplications);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
      
    } catch (error) {
      console.error('OpenRouter Insights Error:', error);
      return getFallbackData('insights', jobApplications);
    }
  },

  // Get skill recommendations
  async getSkillRecommendations(targetRole, currentSkills, experience = 'entry') {
    try {
      if (!OPENROUTER_API_KEY) {
        return getFallbackData('skills');
      }

      const prompt = `As a career advisor, recommend skills for a ${targetRole} position.

Current Skills: ${currentSkills?.join(', ') || 'None'}
Experience: ${experience}

Return ONLY valid JSON:
{
  "missingSkills": [
    {"name": "Skill 1", "priority": "high", "estimatedTime": "2-3 weeks"},
    {"name": "Skill 2", "priority": "medium", "estimatedTime": "1-2 weeks"}
  ],
  "learningResources": [
    {"skill": "Skill 1", "resource": "Free course URL"},
    {"skill": "Skill 2", "resource": "Practice platform"}
  ],
  "estimatedTotalTime": "X-X weeks",
  "nextSteps": ["Step 1", "Step 2"]
}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 800
        })
      });

      if (!response.ok) return getFallbackData('skills');
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
      
    } catch (error) {
      console.error('OpenRouter Skills Error:', error);
      return getFallbackData('skills');
    }
  },

  // Match resume to job description
  async matchResumeToJob(resumeContent, jobDescription, jobTitle) {
    try {
      if (!OPENROUTER_API_KEY) {
        return getFallbackData('match');
      }

      const prompt = `Compare resume with job description.

Job Title: ${jobTitle}
Resume: ${resumeContent?.substring(0, 1500) || 'N/A'}

Return ONLY JSON:
{
  "matchScore": 85,
  "matchingSkills": ["Skill1", "Skill2"],
  "missingSkills": ["Skill1", "Skill2"],
  "recommendations": ["Rec1", "Rec2"],
  "interviewProbability": "High/Medium/Low",
  "atsCompatibility": "Excellent/Good/Poor",
  "salaryRange": "₱XX,XXX - ₱XX,XXX"
}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 600
        })
      });

      if (!response.ok) return getFallbackData('match');
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
      
    } catch (error) {
      console.error('OpenRouter Match Error:', error);
      return getFallbackData('match');
    }
  },

  // Resume Optimizer - Rewrite and improve resume content
  async optimizeResume(resumeContent, improvementType = 'ats') {
    try {
      if (!OPENROUTER_API_KEY) {
        console.log('📝 OpenRouter unavailable, using fallback for resume optimization');
        return getFallbackData('optimize').optimizedContent;
      }

      const improvementPrompts = {
        ats: 'Make this resume ATS-friendly. Use standard formatting, relevant keywords, and avoid complex formatting.',
        stronger: 'Rewrite bullet points using stronger action verbs and add quantifiable metrics.',
        concise: 'Make the resume more concise and impactful. Remove fluff.',
        keywords: 'Add relevant industry keywords while maintaining natural language.',
        professional: 'Enhance the professional tone while keeping content authentic.'
      };

      const prompt = `${improvementPrompts[improvementType] || improvementPrompts.ats}

Original Resume Content:
${resumeContent?.substring(0, 3000) || 'No content'}

Return ONLY the improved resume content as plain text.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) return getFallbackData('optimize').optimizedContent;
      
      const data = await response.json();
      return data.choices[0]?.message?.content || getFallbackData('optimize').optimizedContent;
      
    } catch (error) {
      console.error('OpenRouter Optimize Error:', error);
      return getFallbackData('optimize').optimizedContent;
    }
  },

  // Interview Simulator - Generate interview question
  async generateInterviewQuestion(jobRole, sessionType, questionHistory = []) {
    try {
      if (!OPENROUTER_API_KEY) {
        return getFallbackData('interviewQuestion').question;
      }

      const typePrompts = {
        technical: `Generate a technical interview question for a ${jobRole} position. Focus on problem-solving.`,
        behavioral: `Generate a behavioral interview question for a ${jobRole} position using the STAR method.`,
        hr: `Generate an HR/culture fit interview question for a ${jobRole} position.`,
        mixed: `Generate a random interview question for a ${jobRole} position.`
      };

      const prompt = `${typePrompts[sessionType] || typePrompts.mixed}

Return ONLY the question text (no JSON, no extra text).`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 200
        })
      });

      if (!response.ok) return getFallbackData('interviewQuestion').question;
      
      const data = await response.json();
      return data.choices[0]?.message?.content || getFallbackData('interviewQuestion').question;
      
    } catch (error) {
      console.error('OpenRouter Question Error:', error);
      return getFallbackData('interviewQuestion').question;
    }
  },

  // Interview Simulator - Evaluate user's answer
  async evaluateAnswer(question, userAnswer, jobRole) {
    try {
      if (!OPENROUTER_API_KEY) {
        return getFallbackData('evaluateAnswer');
      }

      const prompt = `You are an expert interviewer. Evaluate this interview answer.

Job Role: ${jobRole}
Question: ${question}
Candidate's Answer: ${userAnswer}

Return ONLY valid JSON:
{
  "feedback": "Specific, constructive feedback (2-3 sentences)",
  "score": 7,
  "improvement": "One specific tip to improve"
}

Score 1-10.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 300
        })
      });

      if (!response.ok) return getFallbackData('evaluateAnswer');
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
      
    } catch (error) {
      console.error('OpenRouter Evaluate Error:', error);
      return getFallbackData('evaluateAnswer');
    }
  },

  // Smart Job Recommendations
  async getJobRecommendations(userSkills, resumeContent) {
    try {
      if (!OPENROUTER_API_KEY) {
        return getFallbackData('jobRecommendations').recommendations;
      }

      const prompt = `Based on these skills: ${userSkills?.join(', ') || 'Not specified'}

Recommend 3-5 relevant job positions.

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "id": "rec1",
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "salary": "Salary range",
      "matchScore": 85,
      "description": "Brief description",
      "skills": ["Skill1", "Skill2"]
    }
  ]
}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) return getFallbackData('jobRecommendations').recommendations;
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.recommendations || [];
      }
      return [];
      
    } catch (error) {
      console.error('OpenRouter Recommendations Error:', error);
      return getFallbackData('jobRecommendations').recommendations;
    }
  },

  // AI Follow-up Suggestion for Job Applications
  async getFollowUpSuggestion(job) {
    console.log('📝 OpenRouter: Generating follow-up suggestion for', job.company);
    
    if (!OPENROUTER_API_KEY) {
      console.log('📝 OpenRouter unavailable, using fallback for follow-up suggestion');
      return getFallbackFollowUpSuggestion(job);
    }

    try {
      const daysSinceApplied = Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24));
      
      const prompt = `You are a career coach. Provide a brief, actionable follow-up suggestion for this job application:

Job Title: ${job.role}
Company: ${job.company}
Status: ${job.status}
Days since applied: ${daysSinceApplied}

Provide ONE specific, actionable suggestion (2-3 sentences max). Be professional, encouraging, and practical.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        return getFallbackFollowUpSuggestion(job);
      }
      
      const data = await response.json();
      const suggestion = data.choices[0]?.message?.content;
      
      return suggestion || getFallbackFollowUpSuggestion(job);
      
    } catch (error) {
      console.error('OpenRouter Follow-up Error:', error);
      return getFallbackFollowUpSuggestion(job);
    }
  },

  // NEW: Parse Job Description (Extract company, role, salary, skills)
  async parseJobDescription(content, inputType) {
    console.log('📝 OpenRouter: Parsing job description');
    
    if (!OPENROUTER_API_KEY) {
      return getFallbackData('parseJob');
    }

    try {
      const prompt = `Parse this job description and extract key information:

${content.substring(0, 3000)}

Return ONLY valid JSON (no extra text):
{
  "company": "Company name",
  "role": "Job title/role",
  "salary": "Salary information (if mentioned)",
  "experience": "Experience required",
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2"]
}

If information is not found, use "Not specified" or empty array.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) return getFallbackData('parseJob');
      
      const data = await response.json();
      const contentText = data.choices[0]?.message?.content;
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(contentText);
      
    } catch (error) {
      console.error('OpenRouter Parse Error:', error);
      return getFallbackData('parseJob');
    }
  },

  // NEW: Generate ATS bullet point
  async generateAtsBullet(resumeContent, type = 'bullet') {
    console.log('📝 OpenRouter: Generating ATS bullet');
    
    if (!OPENROUTER_API_KEY) {
      const fallback = getFallbackData('atsBullet', { type });
      return fallback.result;
    }

    try {
      const prompt = type === 'skills' 
        ? `Based on this resume, suggest 5-7 key skills to add for better ATS optimization:

${resumeContent?.substring(0, 1000) || 'No resume content'}

Return ONLY a comma-separated list of skills.`
        : `Create a stronger, more impactful bullet point for this resume experience section:

${resumeContent?.substring(0, 500) || 'No content'}

Return ONLY a single bullet point (starting with •) that includes quantifiable achievements and strong action verbs.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const fallback = getFallbackData('atsBullet', { type });
        return fallback.result;
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || (type === 'skills' 
        ? "JavaScript, React, TypeScript, Node.js, Git, AWS, Docker"
        : "• Led team projects resulting in 30% efficiency increase and 25% user engagement growth");
      
    } catch (error) {
      console.error('OpenRouter ATS Bullet Error:', error);
      const fallback = getFallbackData('atsBullet', { type });
      return fallback.result;
    }
  },

  // NEW: Rewrite resume section
  async rewriteSection(resumeContent, section = 'summary') {
    console.log('📝 OpenRouter: Rewriting section', section);
    
    if (!OPENROUTER_API_KEY) {
      const fallback = getFallbackData('rewriteSection', { section });
      return fallback.result;
    }

    try {
      const prompt = `Rewrite and improve this ${section} section of a resume. Make it more professional, impactful, and ATS-friendly:

${resumeContent?.substring(0, 1000) || 'No content'}

Return ONLY the improved text (no explanations, no JSON formatting).`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        const fallback = getFallbackData('rewriteSection', { section });
        return fallback.result;
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || `[Improved ${section.toUpperCase()}]
      
Results-driven professional with proven track record of success. Skilled in delivering high-quality solutions and leading impactful projects.`;
      
    } catch (error) {
      console.error('OpenRouter Rewrite Error:', error);
      const fallback = getFallbackData('rewriteSection', { section });
      
      return fallback.result;
    }
  },

  isRealAIAvailable() {
    return !!OPENROUTER_API_KEY;
  }
};

export default openrouterService;