import { db } from './firebase';
import { doc, updateDoc, increment, getDoc, setDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const portfolioAnalyticsService = {
  // Track a portfolio view
  async trackView(portfolioId, username) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, 'portfolio_analytics', `${portfolioId}_${today}`);
      
      const analyticsDoc = await getDoc(analyticsRef);
      if (analyticsDoc.exists()) {
        await updateDoc(analyticsRef, {
          views: increment(1),
          lastUpdated: new Date().toISOString()
        });
      } else {
        await setDoc(analyticsRef, {
          portfolioId,
          username,
          date: today,
          views: 1,
          uniqueVisitors: 0,
          clicks: {
            github: 0,
            linkedin: 0,
            twitter: 0,
            projects: {},
            resume: 0
          },
          createdAt: new Date().toISOString()
        });
      }
      
      // Update total views
      const totalRef = doc(db, 'portfolio_total_stats', portfolioId);
      const totalDoc = await getDoc(totalRef);
      if (totalDoc.exists()) {
        await updateDoc(totalRef, {
          totalViews: increment(1),
          lastUpdated: new Date().toISOString()
        });
      } else {
        await setDoc(totalRef, {
          portfolioId,
          username,
          totalViews: 1,
          totalClicks: 0,
          createdAt: new Date().toISOString()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking view:', error);
      return { success: false };
    }
  },

  // Track click on social link or project
  async trackClick(portfolioId, type, itemId = null) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, 'portfolio_analytics', `${portfolioId}_${today}`);
      const analyticsDoc = await getDoc(analyticsRef);
      
      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        const clicks = data.clicks || {};
        
        if (type === 'project' && itemId) {
          clicks.projects = clicks.projects || {};
          clicks.projects[itemId] = (clicks.projects[itemId] || 0) + 1;
        } else {
          clicks[type] = (clicks[type] || 0) + 1;
        }
        
        await updateDoc(analyticsRef, { clicks });
      }
      
      // Update total clicks
      const totalRef = doc(db, 'portfolio_total_stats', portfolioId);
      await updateDoc(totalRef, {
        totalClicks: increment(1)
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking click:', error);
      return { success: false };
    }
  },

  // Get portfolio analytics
  async getAnalytics(portfolioId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      const analyticsQuery = query(
        collection(db, 'portfolio_analytics'),
        where('portfolioId', '==', portfolioId),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(analyticsQuery);
      const dailyData = [];
      let totalViews = 0;
      let totalClicks = 0;
      const projectClicks = {};
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        dailyData.push({
          date: data.date,
          views: data.views,
          clicks: data.clicks
        });
        totalViews += data.views;
        
        // Aggregate clicks
        if (data.clicks) {
          totalClicks += (data.clicks.github || 0) + (data.clicks.linkedin || 0) + 
                        (data.clicks.twitter || 0) + (data.clicks.resume || 0);
          
          if (data.clicks.projects) {
            Object.entries(data.clicks.projects).forEach(([id, count]) => {
              projectClicks[id] = (projectClicks[id] || 0) + count;
            });
          }
        }
      });
      
      // Get total stats
      const totalRef = doc(db, 'portfolio_total_stats', portfolioId);
      const totalDoc = await getDoc(totalRef);
      const totalStats = totalDoc.exists() ? totalDoc.data() : { totalViews: 0, totalClicks: 0 };
      
      return {
        success: true,
        data: {
          dailyViews: dailyData,
          totalViews: totalStats.totalViews || totalViews,
          totalClicks: totalStats.totalClicks || totalClicks,
          last30DaysViews: totalViews,
          projectClicks,
          clickBreakdown: {
            github: dailyData.reduce((sum, d) => sum + (d.clicks?.github || 0), 0),
            linkedin: dailyData.reduce((sum, d) => sum + (d.clicks?.linkedin || 0), 0),
            twitter: dailyData.reduce((sum, d) => sum + (d.clicks?.twitter || 0), 0),
            resume: dailyData.reduce((sum, d) => sum + (d.clicks?.resume || 0), 0)
          }
        }
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return { success: false, error: error.message };
    }
  }
};