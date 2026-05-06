// Simple usage tracker (stores in localStorage)
export const aiUsageTracker = {
  logRequest(type) {
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('ai_usage') || '{}');
    
    if (!usage[today]) {
      usage[today] = { requests: 0, types: {} };
    }
    
    usage[today].requests++;
    usage[today].types[type] = (usage[today].types[type] || 0) + 1;
    
    localStorage.setItem('ai_usage', JSON.stringify(usage));
  },
  
  getTodayRequests() {
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('ai_usage') || '{}');
    return usage[today]?.requests || 0;
  },
  
  getRemainingRequests() {
    const used = this.getTodayRequests();
    return Math.max(0, 13500 - used); // 15/min * 60min * 15 hours active = ~13,500 daily
  }
};