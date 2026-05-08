import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is available and valid
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const hasValidApiKey = API_KEY && API_KEY.startsWith('AIza') && API_KEY.length > 10;

// Initialize Gemini only if API key exists
let genAI = null;
let model = null;

if (hasValidApiKey) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('✅ Gemini AI initialized successfully for free tier');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error);
  }
} else {
  console.warn('⚠️ No Gemini API key found. Free tier will use Mock AI instead.');
  console.warn('💡 Get Gemini API key from: https://makersuite.google.com/app/apikey');
}

// Rate limiting helper
class RateLimiter {
  constructor(requestsPerMinute = 15) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest) + 1000;
      console.log(`⏳ Gemini rate limit: waiting ${Math.ceil(waitTime / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitIfNeeded();
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter(15);

// Fallback mock data (when Gemini fails or rate limited)
const getGeminiFallback = (type, data) => {
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
      motivationalMessage: "Keep going! Your persistence will pay off.",
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
        { skill: "React", resource: "react.dev/learn" },
        { skill: "TypeScript", resource: "typescriptlang.org/docs" }
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
      optimizedContent: data?.originalContent || "Improved resume content with stronger action verbs and quantifiable achievements. \n\n- Led team projects resulting in 30% efficiency increase\n- Implemented new features increasing user engagement by 25%\n- Collaborated with cross-functional teams to deliver products on time"
    };
  }

  if (type === 'interviewQuestion') {
    return {
      question: "Tell me about a time you faced a challenging situation at work and how you resolved it.",
      type: data?.sessionType || "behavioral"
    };
  }

  if (type === 'evaluateAnswer') {
    return {
      feedback: "Good answer! You identified the problem clearly. Next time, try using the STAR method (Situation, Task, Action, Result) to structure your response more effectively.",
      score: Math.floor(Math.random() * 4) + 6,
      improvement: "Add more specific metrics and quantify your impact"
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
          description: "Looking for a React developer with TypeScript experience to join our growing team.",
          skills: ["React", "TypeScript", "Tailwind CSS", "Git"]
        },
        {
          id: "rec2",
          title: "Full Stack Developer",
          company: "Digital Innovations",
          location: "Remote (Philippines)",
          salary: "₱90,000 - ₱120,000",
          matchScore: 72,
          description: "Join our team to build modern web applications using React and Node.js.",
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

export const geminiService = {
  // Generate career insights
  async getCareerInsights(jobApplications, resumeVersions) {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for career insights');
      return getGeminiFallback('insights', jobApplications);
    }

    try {
      await rateLimiter.waitIfNeeded();
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
      
    } catch (error) {
      console.error('Gemini Insights Error:', error);
      return getGeminiFallback('insights', jobApplications);
    }
  },

  // Get skill recommendations
  async getSkillRecommendations(targetRole, currentSkills, experience = 'entry') {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for skill recommendations');
      return getGeminiFallback('skills');
    }

    try {
      await rateLimiter.waitIfNeeded();
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
      
    } catch (error) {
      console.error('Gemini Skill Error:', error);
      return getGeminiFallback('skills');
    }
  },

  // Match resume to job description
  async matchResumeToJob(resumeContent, jobDescription, jobTitle) {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for job match');
      return getGeminiFallback('match');
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const prompt = `Compare this resume with the job description.

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
      
    } catch (error) {
      console.error('Gemini Match Error:', error);
      return getGeminiFallback('match');
    }
  },
// Analyze resume and provide feedback (for AI Resume Feedback feature)
async analyzeResume(resumeContent, resumeTitle, userSkills = []) {
  console.log('📝 Gemini: Analyzing resume:', resumeTitle);
  
  if (!hasValidApiKey || !model) {
    console.log('📝 Gemini unavailable, using fallback for resume analysis');
    return {
      strengths: ["Your resume has good content", "Relevant experience highlighted"],
      improvements: ["Add more quantifiable achievements", "Include specific metrics"],
      suggestions: ["Add numbers like 'Improved performance by 30%'", "Use stronger action verbs"],
      atsScore: 68,
      keywords: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"]
    };
  }

  try {
    await rateLimiter.waitIfNeeded();
    
    const prompt = `You are an expert resume reviewer. Analyze this resume and provide specific, actionable feedback.

Resume Title: ${resumeTitle}
Resume Content: ${resumeContent?.substring(0, 3000) || 'No content'}
User's Skills: ${userSkills.join(', ') || 'Not specified'}

Return ONLY valid JSON (no extra text) in this exact format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "atsScore": 75,
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Focus on:
- Quantifiable achievements (look for numbers, percentages)
- Action verbs (led, managed, created, developed)
- ATS-friendly keywords
- Formatting and structure
- Missing contact information`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
    
  } catch (error) {
    console.error('Gemini Analyze Error:', error);
    return {
      strengths: ["Your resume has good content", "Relevant experience highlighted"],
      improvements: ["Add more quantifiable achievements", "Include specific metrics"],
      suggestions: ["Add numbers like 'Improved performance by 30%'", "Use stronger action verbs"],
      atsScore: 68,
      keywords: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"]
    };
  }
},
  // Resume Optimizer - Rewrite and improve resume content
  async optimizeResume(resumeContent, improvementType = 'ats') {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for resume optimization');
      return getGeminiFallback('optimize', { originalContent: resumeContent }).optimizedContent;
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const improvementPrompts = {
        ats: 'Make this resume ATS-friendly. Use standard formatting, relevant keywords, and avoid complex formatting.',
        stronger: 'Rewrite bullet points using stronger action verbs and add quantifiable metrics (numbers, percentages).',
        concise: 'Make the resume more concise and impactful. Remove fluff and focus on achievements.',
        keywords: 'Add relevant industry keywords while maintaining natural language and readability.',
        professional: 'Enhance the professional tone while keeping the content authentic.'
      };

      const prompt = `${improvementPrompts[improvementType] || improvementPrompts.ats}

Original Resume Content:
${resumeContent?.substring(0, 3000) || 'No content'}

Return ONLY the improved resume content as plain text (no JSON formatting). Keep the same structure but improve the writing.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const optimizedContent = response.text();
      
      return optimizedContent;
      
    } catch (error) {
      console.error('Gemini Optimize Error:', error);
      return getGeminiFallback('optimize', { originalContent: resumeContent }).optimizedContent;
    }
  },

  // Interview Simulator - Generate interview question
  async generateInterviewQuestion(jobRole, sessionType, questionHistory = []) {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for interview question');
      return getGeminiFallback('interviewQuestion', { sessionType }).question;
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const typePrompts = {
        technical: `Generate a technical interview question for a ${jobRole} position. Focus on problem-solving and technical knowledge.`,
        behavioral: `Generate a behavioral interview question for a ${jobRole} position using the STAR method (Situation, Task, Action, Result).`,
        hr: `Generate an HR/culture fit interview question for a ${jobRole} position about soft skills and company culture.`,
        mixed: `Generate a random interview question (technical, behavioral, or HR) for a ${jobRole} position.`
      };

      const previousQuestions = questionHistory.map(q => q.question).join('\n');
      
      const prompt = `${typePrompts[sessionType] || typePrompts.mixed}

${previousQuestions ? `Previous questions asked:\n${previousQuestions}\n\nAsk a different question not listed above.` : ''}

Return ONLY the question text (no JSON, no extra text).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const question = response.text().trim();
      
      return question;
      
    } catch (error) {
      console.error('Gemini Question Error:', error);
      return getGeminiFallback('interviewQuestion', { sessionType }).question;
    }
  },

  // Interview Simulator - Evaluate user's answer
  async evaluateAnswer(question, userAnswer, jobRole) {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for answer evaluation');
      return getGeminiFallback('evaluateAnswer');
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const prompt = `You are an expert interviewer. Evaluate this interview answer.

Job Role: ${jobRole}
Question: ${question}
Candidate's Answer: ${userAnswer}

Return ONLY valid JSON (no extra text):
{
  "feedback": "Specific, constructive feedback on the answer (2-3 sentences)",
  "score": 7,
  "improvement": "One specific tip to improve future answers"
}

Score should be 1-10 where 10 is excellent.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
      
    } catch (error) {
      console.error('Gemini Evaluate Error:', error);
      return getGeminiFallback('evaluateAnswer');
    }
  },

  // Smart Job Recommendations
  async getJobRecommendations(userSkills, resumeContent) {
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for job recommendations');
      return getGeminiFallback('jobRecommendations').recommendations;
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const prompt = `Based on the following skills and resume, recommend 3-5 relevant job positions.

Skills: ${userSkills?.join(', ') || 'Not specified'}
Resume Summary: ${resumeContent?.substring(0, 1000) || 'Not provided'}

Return ONLY valid JSON (no extra text):
{
  "recommendations": [
    {
      "id": "rec1",
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "salary": "Salary range",
      "matchScore": 85,
      "description": "Brief job description",
      "skills": ["Skill1", "Skill2", "Skill3"]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.recommendations || [];
      }
      return [];
      
    } catch (error) {
      console.error('Gemini Recommendations Error:', error);
      return getGeminiFallback('jobRecommendations').recommendations;
    }
  },

  // AI Follow-up Suggestion for Job Applications
  async getFollowUpSuggestion(job) {
    console.log('📝 Gemini: Generating follow-up suggestion for', job.company);
    
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for follow-up suggestion');
      return getFallbackFollowUpSuggestion(job);
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const daysSinceApplied = Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24));
      
      const prompt = `You are a career coach. Provide a brief, actionable follow-up suggestion for this job application:

Job Title: ${job.role}
Company: ${job.company}
Status: ${job.status}
Days since applied: ${daysSinceApplied}

Provide ONE specific, actionable suggestion (2-3 sentences max). Be professional, encouraging, and practical.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestion = response.text().trim();
      
      return suggestion || getFallbackFollowUpSuggestion(job);
      
    } catch (error) {
      console.error('Gemini Follow-up Error:', error);
      return getFallbackFollowUpSuggestion(job);
    }
  },

  // NEW: Parse Job Description (Extract company, role, salary, skills)
  async parseJobDescription(content, inputType) {
    console.log('📝 Gemini: Parsing job description');
    
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for parsing');
      return getGeminiFallback('parseJob');
    }

    try {
      await rateLimiter.waitIfNeeded();
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
      
    } catch (error) {
      console.error('Gemini Parse Error:', error);
      return getGeminiFallback('parseJob');
    }
  },

  // NEW: Generate ATS bullet point
  async generateAtsBullet(resumeContent, type = 'bullet') {
    console.log('📝 Gemini: Generating ATS bullet');
    
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for ATS bullet');
      const fallback = getGeminiFallback('atsBullet', { type });
      return fallback.result;
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const prompt = type === 'skills' 
        ? `Based on this resume, suggest 5-7 key skills to add for better ATS optimization:

${resumeContent?.substring(0, 1000) || 'No resume content'}

Return ONLY a comma-separated list of skills.`
        : `Create a stronger, more impactful bullet point for this resume experience section:

${resumeContent?.substring(0, 500) || 'No content'}

Return ONLY a single bullet point (starting with •) that includes quantifiable achievements and strong action verbs.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().trim();
      
      return content || (type === 'skills' 
        ? "JavaScript, React, TypeScript, Node.js, Git, AWS, Docker"
        : "• Led team projects resulting in 30% efficiency increase and 25% user engagement growth");
      
    } catch (error) {
      console.error('Gemini ATS Bullet Error:', error);
      const fallback = getGeminiFallback('atsBullet', { type });
      return fallback.result;
    }
  },

  // NEW: Rewrite resume section
  async rewriteSection(resumeContent, section = 'summary') {
    console.log('📝 Gemini: Rewriting section', section);
    
    if (!hasValidApiKey || !model) {
      console.log('📝 Gemini unavailable, using fallback for rewrite');
      const fallback = getGeminiFallback('rewriteSection', { section });
      return fallback.result;
    }

    try {
      await rateLimiter.waitIfNeeded();
      
      const prompt = `Rewrite and improve this ${section} section of a resume. Make it more professional, impactful, and ATS-friendly:

${resumeContent?.substring(0, 1000) || 'No content'}

Return ONLY the improved text (no explanations, no JSON formatting).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rewritten = response.text().trim();
      
      return rewritten || `[Improved ${section.toUpperCase()}]
      
Results-driven professional with proven track record of success. Skilled in delivering high-quality solutions and leading impactful projects.`;
      
    } catch (error) {
      console.error('Gemini Rewrite Error:', error);
      const fallback = getGeminiFallback('rewriteSection', { section });
      return fallback.result;
    }
  },

  // Check if real Gemini AI is available
  isRealAIAvailable() {
    return hasValidApiKey && model !== null;
  }
};

export default geminiService;