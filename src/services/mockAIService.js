// Mock AI Service - For Free Tier (No limits, no API keys, instant responses)

export const mockAIService = {
  // Generate career insights based on job search data
  async getCareerInsights(jobApplications, resumeVersions) {
    console.log('📝 Mock AI (Free Tier): Generating career insights...');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const jobCount = jobApplications?.length || 0;
    const interviewCount = jobApplications?.filter(j => j.status === 'interview' || j.status === 'hired').length || 0;
    const rejectedCount = jobApplications?.filter(j => j.status === 'rejected').length || 0;
    
    return {
      actionPlan: [
        `📋 Follow up with ${jobCount} companies you applied to 2+ weeks ago`,
        "📋 Update your resume with latest skills and achievements",
        `📋 Apply to ${Math.max(5, 10 - jobCount)} new jobs this week`,
        "📋 Prepare for upcoming interviews by researching companies"
      ],
      interviewTips: [
        "🎯 Research the company thoroughly before the interview",
        "🎯 Practice common interview questions with a friend",
        "🎯 Prepare thoughtful questions to ask the interviewer",
        "🎯 Dress professionally and test your tech setup"
      ],
      industryInsights: [
        "📊 Tech hiring is picking up in Q2 2026",
        "📊 Remote work opportunities are increasing by 15%",
        "📊 Companies are valuing practical skills over degrees"
      ],
      motivationalMessage: `You've applied to ${jobCount} jobs and had ${interviewCount} interviews. ${rejectedCount > 0 ? `Don't worry about the ${rejectedCount} rejections - every 'no' brings you closer to a 'yes'!` : 'Keep going! Your next opportunity is waiting.'}`,
      nextWeekFocus: interviewCount > 0 
        ? `Prepare for your ${interviewCount} upcoming interview(s) and apply to 5 more jobs`
        : "Complete 5 quality applications and schedule 2 informational interviews"
    };
  },

  // Get skill recommendations based on target role
  async getSkillRecommendations(targetRole, currentSkills, experience = 'entry') {
    console.log('📝 Mock AI (Free Tier): Generating skill recommendations for', targetRole);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const roleSkills = {
      frontend: { 
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"], 
        priority: "high",
        resources: {
          "React": "react.dev/learn - Free official tutorial",
          "TypeScript": "typescriptlang.org/docs - Free documentation",
          "Next.js": "nextjs.org/learn - Free course",
          "Tailwind CSS": "tailwindcss.com/docs - Official docs"
        }
      },
      backend: { 
        skills: ["Node.js", "Python", "Docker", "PostgreSQL"], 
        priority: "high",
        resources: {
          "Node.js": "nodejs.org/en/learn - Free learning path",
          "Python": "python.org/about/gettingstarted - Official guide",
          "Docker": "docker.com/101-tutorial - Free interactive tutorial",
          "PostgreSQL": "postgresql.org/docs - Official docs"
        }
      },
      fullstack: { 
        skills: ["React", "Node.js", "TypeScript", "MongoDB"], 
        priority: "high",
        resources: {
          "React": "react.dev/learn",
          "Node.js": "nodejs.org/en/learn",
          "TypeScript": "typescriptlang.org/docs",
          "MongoDB": "mongodb.com/docs"
        }
      },
      default: { 
        skills: ["React", "TypeScript", "Node.js", "AWS", "Git"], 
        priority: "medium",
        resources: {
          "React": "react.dev/learn",
          "TypeScript": "typescriptlang.org/docs",
          "Node.js": "nodejs.org/en/learn",
          "AWS": "aws.amazon.com/training",
          "Git": "git-scm.com/doc"
        }
      }
    };
    
    let roleKey = 'default';
    if (targetRole?.toLowerCase().includes('frontend')) roleKey = 'frontend';
    else if (targetRole?.toLowerCase().includes('backend')) roleKey = 'backend';
    else if (targetRole?.toLowerCase().includes('full')) roleKey = 'fullstack';
    
    const recommended = roleSkills[roleKey];
    
    const userSkillSet = new Set(currentSkills?.map(s => s.toLowerCase()) || []);
    const missingSkillsList = recommended.skills.filter(
      skill => !userSkillSet.has(skill.toLowerCase())
    );
    
    const missingSkills = missingSkillsList.map(skill => ({
      name: skill,
      priority: recommended.priority,
      estimatedTime: skill === "TypeScript" ? "1-2 weeks" : skill === "AWS" ? "4-5 weeks" : "2-3 weeks"
    }));
    
    const learningResources = missingSkills.slice(0, 3).map(skill => ({
      skill: skill.name,
      resource: recommended.resources[skill.name] || "Search online for tutorials"
    }));
    
    return {
      missingSkills: missingSkills.length > 0 ? missingSkills : [
        { name: "React", priority: "high", estimatedTime: "2-3 weeks" },
        { name: "TypeScript", priority: "high", estimatedTime: "1-2 weeks" }
      ],
      learningResources: learningResources.length > 0 ? learningResources : [
        { skill: "React", resource: "react.dev/learn - Free tutorial" },
        { skill: "TypeScript", resource: "typescriptlang.org/docs" }
      ],
      estimatedTotalTime: `${missingSkills.length * 2}-${missingSkills.length * 3 + 2} weeks`,
      nextSteps: [
        `Start with ${missingSkills[0]?.name || 'React'} fundamentals this week`,
        "Build a small project to practice your skills",
        "Join coding communities like GitHub and Stack Overflow",
        "Update your resume with new skills as you learn them"
      ]
    };
  },

  // Match resume to job description
  async matchResumeToJob(resumeContent, jobDescription, jobTitle) {
    console.log('📝 Mock AI (Free Tier): Matching resume to job:', jobTitle);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let matchScore = 60;
    
    if (resumeContent) {
      const content = resumeContent.toLowerCase();
      if (content.includes('react')) matchScore += 15;
      if (content.includes('typescript') || content.includes('ts')) matchScore += 12;
      if (content.includes('node') || content.includes('node.js')) matchScore += 10;
      if (content.includes('aws') || content.includes('cloud')) matchScore += 8;
      if (content.includes('git')) matchScore += 5;
      if (content.includes('python')) matchScore += 5;
      if (content.includes('javascript')) matchScore += 10;
      if (content.includes('html')) matchScore += 5;
      if (content.includes('css')) matchScore += 5;
      if (content.includes('api') || content.includes('rest')) matchScore += 8;
    }
    
    matchScore = Math.min(98, matchScore);
    
    const matchingSkills = [];
    const missingSkills = [];
    
    if (resumeContent?.toLowerCase().includes('react')) matchingSkills.push("React");
    else missingSkills.push("React");
    
    if (resumeContent?.toLowerCase().includes('typescript') || resumeContent?.toLowerCase().includes('ts')) matchingSkills.push("TypeScript");
    else missingSkills.push("TypeScript");
    
    if (resumeContent?.toLowerCase().includes('node') || resumeContent?.toLowerCase().includes('node.js')) matchingSkills.push("Node.js");
    else missingSkills.push("Node.js");
    
    if (resumeContent?.toLowerCase().includes('javascript')) matchingSkills.push("JavaScript");
    else missingSkills.push("JavaScript");
    
    if (resumeContent?.toLowerCase().includes('git')) matchingSkills.push("Git");
    else missingSkills.push("Git");
    
    if (matchingSkills.length < 2) matchingSkills.push("Problem Solving", "Team Collaboration");
    
    let interviewProbability = "Medium";
    let atsCompatibility = "Good";
    let salaryRange = "₱80,000 - ₱120,000";
    
    if (matchScore >= 80) {
      interviewProbability = "High 🔥";
      atsCompatibility = "Excellent ✅";
      salaryRange = "₱120,000 - ₱150,000";
    } else if (matchScore >= 60) {
      interviewProbability = "Medium 📊";
      atsCompatibility = "Good ✓";
      salaryRange = "₱80,000 - ₱120,000";
    } else {
      interviewProbability = "Low 📉";
      atsCompatibility = "Needs Improvement ⚠️";
      salaryRange = "₱50,000 - ₱80,000";
    }
    
    const recommendations = [];
    if (missingSkills.includes("TypeScript")) recommendations.push("Add TypeScript to your skills section - it's highly requested for this role");
    if (missingSkills.includes("React")) recommendations.push("React is essential for this role - consider adding it to your skills");
        if (missingSkills.includes("Node.js")) recommendations.push("Include Node.js in your backend skills section");
    if (missingSkills.includes("Git")) recommendations.push("Highlight your experience with version control (Git)");
    if (matchScore < 70) recommendations.push("Add more specific project examples related to this role");
    recommendations.push("Tailor your resume's professional summary to highlight relevant experience");
    
    return {
      matchScore,
      matchingSkills: matchingSkills.slice(0, 5),
      missingSkills: missingSkills.slice(0, 4),
      recommendations: recommendations.slice(0, 5),
      interviewProbability,
      atsCompatibility,
      salaryRange
    };
  },
// Analyze resume and provide feedback (for AI Resume Feedback feature)
async analyzeResume(resumeContent, resumeTitle, userSkills = []) {
  console.log('📝 Mock AI: Analyzing resume:', resumeTitle);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check for metrics
  const hasMetrics = resumeContent && (resumeContent.includes('%') || resumeContent.includes('increased') || resumeContent.includes('improved') || /\d+%/.test(resumeContent));
  const hasActionVerbs = resumeContent && /(led|managed|created|developed|implemented|designed|built|launched)/i.test(resumeContent);
  const hasContactInfo = resumeContent && (/@|\+63|0\d{10}|email/i.test(resumeContent));
  const wordCount = resumeContent?.split(/\s+/).length || 0;
  
  const strengths = [
    "✅ Clear professional summary",
    "✅ Good use of technical keywords",
    "✅ Relevant experience highlighted"
  ];
  
  const improvements = [];
  const suggestions = [];
  
  if (!hasMetrics) {
    improvements.push("❌ Add more quantifiable achievements (numbers, percentages)");
    suggestions.push("💡 Add metrics like 'Improved performance by 30%' or 'Increased sales by 25%'");
  } else {
    strengths.push("✅ Excellent use of quantifiable achievements with metrics!");
  }
  
  if (!hasActionVerbs) {
    suggestions.push("💡 Use stronger action verbs: led, created, implemented, developed, launched");
  } else {
    strengths.push("✅ Strong action verbs used throughout your resume");
  }
  
  if (!hasContactInfo) {
    improvements.push("❌ Missing contact information");
    suggestions.push("💡 Add your phone number and email at the top of the resume");
  }
  
  // Check resume length
  if (wordCount < 200) {
    improvements.push("❌ Resume is too brief");
    suggestions.push("💡 Add more details about your experience, projects, and achievements");
  } else if (wordCount > 800) {
    suggestions.push("💡 Consider condensing your resume - aim for 1-2 pages maximum");
  }
  
  // Calculate ATS score
  let atsScore = 65;
  if (hasMetrics) atsScore += 15;
  if (hasActionVerbs) atsScore += 10;
  if (hasContactInfo) atsScore += 5;
  if (wordCount >= 300 && wordCount <= 700) atsScore += 5;
  if (resumeContent && resumeContent.length > 1000) atsScore += 5;
  atsScore = Math.min(98, atsScore);
  
  // Keywords
  const keywords = ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "HTML", "CSS", "TypeScript", "AWS"];
  
  return {
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 3),
    suggestions: suggestions.slice(0, 4),
    atsScore: atsScore,
    keywords: keywords.slice(0, 6),
    wordCount: wordCount
  };
},
  // Resume Optimizer - Rewrite and improve resume content
  async optimizeResume(resumeContent, improvementType = 'ats') {
    console.log('📝 Mock AI (Free Tier): Optimizing resume with', improvementType);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const improvementMap = {
      ats: "• Added relevant industry keywords for better ATS scanning\n• Removed complex formatting\n• Standardized section headers\n• Added metrics where possible",
      stronger: "• Transformed passive statements into active achievements\n• Added quantifiable results (%, numbers)\n• Used stronger action verbs (led, developed, implemented)\n• Highlighted specific accomplishments",
      concise: "• Removed redundant phrases and wordy descriptions\n• Focused on impact rather than responsibilities\n• Reduced length while maintaining key information\n• Improved readability and flow",
      keywords: "• Added industry-specific keywords\n• Included technical terms relevant to the role\n• Balanced keyword density for natural reading\n• Added skills section optimization",
      professional: "• Enhanced professional tone throughout\n• Removed casual language\n• Added industry terminology\n• Improved overall presentation"
    };
    
    const improvements = improvementMap[improvementType] || improvementMap.ats;
    
    return `[IMPROVED RESUME - ${improvementType.toUpperCase()} OPTIMIZATION]

${improvements}

${resumeContent ? resumeContent.substring(0, 500) : 'Your resume content here'}

✨ Optimization applied! Review the changes above.`;
  },

  // Interview Simulator - Generate interview question
  async generateInterviewQuestion(jobRole, sessionType, questionHistory = []) {
    console.log('📝 Mock AI (Free Tier): Generating interview question for', jobRole);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const questions = {
      technical: [
        `Can you explain how you would optimize a slow-loading React application?`,
        `What's the difference between let, const, and var in JavaScript?`,
        `How would you handle state management in a large React application?`,
        `Explain the concept of closures in JavaScript. Can you provide an example?`
      ],
      behavioral: [
        `Tell me about a time you faced a difficult challenge at work and how you overcame it.`,
        `Describe a situation where you had to work with a difficult team member. How did you handle it?`,
        `Give me an example of a project you led and what the outcome was.`,
        `Tell me about a time you made a mistake. How did you handle it and what did you learn?`
      ],
      hr: [
        `Why are you interested in working for our company?`,
        `Where do you see yourself in 5 years?`,
        `What are your greatest strengths and weaknesses?`,
        `Why are you leaving your current position?`
      ],
      mixed: [
        `Tell me about a technical problem you solved recently.`,
        `How do you stay updated with the latest technologies?`,
        `Describe your ideal work environment.`,
        `How do you prioritize tasks when working on multiple projects?`
      ]
    };
    
    const questionPool = questions[sessionType] || questions.mixed;
    const previousQuestionsSet = new Set(questionHistory.map(q => q.question));
    const availableQuestions = questionPool.filter(q => !previousQuestionsSet.has(q));
    
    const selectedQuestion = availableQuestions.length > 0 
      ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
      : questionPool[Math.floor(Math.random() * questionPool.length)];
    
    return selectedQuestion;
  },

  // Interview Simulator - Evaluate user's answer
  async evaluateAnswer(question, userAnswer, jobRole) {
    console.log('📝 Mock AI (Free Tier): Evaluating interview answer');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const answerLength = userAnswer?.length || 0;
    let score = 5;
    let feedback = "";
    let improvement = "";
    
    if (answerLength > 200) {
      score += 2;
      feedback = "Great detail! You provided a thorough answer with good examples.";
      improvement = "Consider using the STAR method to structure your response even better.";
    } else if (answerLength > 100) {
      score += 1;
      feedback = "Good answer with some details. You're on the right track!";
      improvement = "Add more specific examples and quantify your achievements with numbers.";
    } else {
      feedback = "Your answer is a bit short. Try to provide more specific examples and details.";
      improvement = "Use the STAR method: Situation, Task, Action, Result to structure your response.";
    }
    
    if (userAnswer?.toLowerCase().includes('i learned') || userAnswer?.toLowerCase().includes('improved')) {
      score += 1;
      feedback += " Good job showing personal growth and learning!";
    }
    
    if (userAnswer?.toLowerCase().includes('team') || userAnswer?.toLowerCase().includes('collaborated')) {
      score += 1;
      feedback += " Excellent teamwork example!";
    }
    
    score = Math.min(10, score);
    
    return {
      feedback: feedback || "Good effort! Keep practicing to improve your interview skills.",
      score: score,
      improvement: improvement || "Try to include specific metrics and outcomes in your answers."
    };
  },

  // Smart Job Recommendations
  async getJobRecommendations(userSkills, resumeContent) {
    console.log('📝 Mock AI (Free Tier): Generating job recommendations');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const skills = userSkills || [];
    const hasReact = skills.some(s => s.toLowerCase().includes('react'));
    const hasNode = skills.some(s => s.toLowerCase().includes('node'));
    const hasPython = skills.some(s => s.toLowerCase().includes('python'));
    
    const recommendations = [];
    
    if (hasReact || hasNode) {
      recommendations.push({
        id: "rec1",
        title: "Frontend Developer",
        company: "Tech Solutions Inc.",
        location: "Manila, Philippines",
        salary: "₱80,000 - ₱100,000",
        matchScore: hasReact ? 85 : 65,
        description: "Looking for a React developer to join our growing team. You'll be building modern web applications.",
        skills: ["React", "TypeScript", "Tailwind CSS", "Git"]
      });
      
      recommendations.push({
        id: "rec2",
        title: "Full Stack Developer",
        company: "Digital Innovations",
        location: "Remote (Philippines)",
        salary: "₱90,000 - ₱120,000",
        matchScore: (hasReact && hasNode) ? 88 : 70,
        description: "Join our team to build end-to-end web applications using React and Node.js.",
        skills: ["React", "Node.js", "MongoDB", "AWS"]
      });
    }
    
    if (hasPython) {
      recommendations.push({
        id: "rec3",
        title: "Python Developer",
        company: "Data Systems Corp",
        location: "Cebu, Philippines",
        salary: "₱70,000 - ₱90,000",
        matchScore: 80,
        description: "Seeking Python developer for backend services and API development.",
        skills: ["Python", "Django", "PostgreSQL", "Docker"]
      });
    }
    
    recommendations.push({
      id: "rec4",
      title: "Junior Software Engineer",
      company: "Startup PH",
      location: "Remote",
      salary: "₱50,000 - ₱70,000",
      matchScore: 75,
      description: "Great opportunity for fresh graduates! Learn and grow with our team.",
      skills: ["JavaScript", "React", "Git", "Problem Solving"]
    });
    
    return recommendations.slice(0, 5);
  },

  // AI Follow-up Suggestion for Job Applications
  async getFollowUpSuggestion(job) {
    console.log('📝 Mock AI (Free Tier): Generating follow-up suggestion for', job.company);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const daysSinceApplied = Math.floor((Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24));
    const status = job.status;
    
    if (status === 'hired') {
      return "🎉 Congratulations on the offer! Send a thank you note, review the offer details carefully, and complete onboarding paperwork. Consider negotiating if the offer doesn't meet your expectations.";
    }
    
    if (status === 'rejected') {
      return "💪 Don't get discouraged! Ask for feedback if possible. Every rejection is practice for the right opportunity. Keep applying to other positions - the right role is out there!";
    }
    
    if (status === 'interview') {
      return "🎯 Prepare for your interview: Research the company culture on Glassdoor, practice common questions using the STAR method, prepare 3-5 thoughtful questions to ask, and test your tech setup if it's a video interview.";
    }
    
    if (daysSinceApplied > 21) {
      return `⏰ It's been ${daysSinceApplied} days without response. Consider sending a polite follow-up email. If no response after 2 follow-ups, focus your energy on new applications. Keep your momentum going!`;
    } else if (daysSinceApplied > 14) {
      return `📧 Perfect time to follow up! Send a brief email expressing continued interest in the ${job.role} position. Keep it professional: mention your application date, restate your interest, and politely ask for an update.`;
    } else if (daysSinceApplied > 7) {
      return `⏳ Wait a bit longer (recommended follow-up in ${14 - daysSinceApplied} days). Use this time to prepare for potential interviews by researching the company and practicing common interview questions. Also apply to more positions!`;
    } else {
      return `✅ Your application is still fresh (${daysSinceApplied} days old). Keep applying to 5-10 jobs per week while waiting for responses. Don't put all your eggs in one basket - diversify your applications!`;
    }
  },

  // NEW: Parse Job Description (Extract company, role, salary, skills)
  async parseJobDescription(content, inputType) {
    console.log('📝 Mock AI (Free Tier): Parsing job description');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simple parsing logic
    const lines = content.split('\n');
    let company = '';
    let role = '';
    let salary = '';
    let experience = '';
    const skills = [];
    const keywords = [];
    
    const skillKeywords = ['react', 'javascript', 'python', 'java', 'node', 'aws', 'docker', 'typescript', 'html', 'css', 'sql', 'git', 'mongodb', 'postgresql'];
    const companyKeywords = ['company', 'about us', 'our company', 'who we are'];
    const roleKeywords = ['role', 'position', 'title', 'job title', 'we are looking for'];
    const salaryKeywords = ['salary', 'compensation', 'pay', 'range'];
    const experienceKeywords = ['experience required', 'years of experience', 'experience level'];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      companyKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword) && !company) {
          company = line.replace(new RegExp(keyword, 'i'), '').trim();
        }
      });
      
      roleKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword) && !role) {
          role = line.replace(new RegExp(keyword, 'i'), '').trim();
        }
      });
      
      salaryKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword) && !salary) {
          const match = line.match(/[\d,]+/);
          if (match) salary = match[0];
        }
      });
      
      experienceKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword) && !experience) {
          const match = line.match(/\d+-\d+|\d+\+/);
          if (match) experience = match[0];
        }
      });
      
      skillKeywords.forEach(skill => {
        if (lowerLine.includes(skill) && !skills.includes(skill)) {
          skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
      });
    });
    
    // Extract keywords from first 500 chars
    const words = content.slice(0, 500).split(/\s+/);
    words.forEach(word => {
      if (word.length > 5 && !keywords.includes(word) && !skillKeywords.includes(word.toLowerCase())) {
        keywords.push(word);
      }
    });
    
    return {
      company: company || 'Not detected',
      role: role || 'Not detected',
      salary: salary ? `₱${salary}` : 'Not specified',
      experience: experience || 'Not specified',
      skills: [...new Set(skills)].slice(0, 10),
      keywords: keywords.slice(0, 15)
    };
  },

  // NEW: Generate ATS bullet point
  async generateAtsBullet(resumeContent, type = 'bullet') {
    console.log('📝 Mock AI (Free Tier): Generating ATS bullet');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (type === 'skills') {
      return "Recommended skills to add: React.js, TypeScript, Node.js, AWS Cloud, Docker, Git, PostgreSQL, MongoDB";
    }
    
    return "• Led a team of 5 developers to successfully deliver a high-impact project, resulting in 30% increase in user engagement and 25% improvement in performance metrics";
  },

  // NEW: Rewrite resume section
  async rewriteSection(resumeContent, section = 'summary') {
    console.log('📝 Mock AI (Free Tier): Rewriting section', section);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `[AI Improved - ${section.toUpperCase()}]
      
Results-driven professional with 5+ years of experience in software development. Proven track record of delivering high-quality solutions and leading successful projects. Passionate about leveraging cutting-edge technologies to solve complex problems and drive business growth.`;
  },

  isRealAIAvailable() {
    return false;
  }
};

export default mockAIService;