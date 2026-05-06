// 6. resume_analytics (NEW - Track resume performance)
{
  id: string (auto-generated),
  userId: string (reference to users),
  resumeId: string (reference to resumes),
  applicationsCount: number,
  interviewCount: number,
  responseRate: number,
  lastUsed: timestamp,
  performanceScore: number,
  history: array of {
    date: timestamp,
    applications: number,
    interviews: number
  }
}

// 7. skill_gap_analysis (NEW)
{
  id: string (auto-generated),
  userId: string (reference to users),
  targetRole: string,
  currentSkills: array of strings,
  missingSkills: array of {
    skill: string,
    priority: 'high' | 'medium' | 'low',
    learningResources: array of strings
  },
  recommendations: array of strings,
  updatedAt: timestamp
}

// 8. user_activity (NEW - For reminders)
{
  id: string (auto-generated),
  userId: string (reference to users),
  type: 'application' | 'resume_update' | 'login',
  description: string,
  dueDate: timestamp,
  completed: boolean,
  createdAt: timestamp
}