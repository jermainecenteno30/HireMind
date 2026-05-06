import { db } from './firebase';
import { doc, setDoc, getDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';

export const portfolioService = {
  // Save portfolio to Firestore
  async savePortfolio(userId, portfolioData) {
    try {
      const portfolioRef = doc(db, 'portfolios', userId);
      await setDoc(portfolioRef, {
        ...portfolioData,
        userId,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving portfolio:', error);
      return { success: false, error: error.message };
    }
  },

  // Get portfolio by userId
  async getPortfolioByUserId(userId) {
    try {
      const portfolioRef = doc(db, 'portfolios', userId);
      const docSnap = await getDoc(portfolioRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, error: 'Portfolio not found' };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return { success: false, error: error.message };
    }
  },

  // Get portfolio by username (for public view)
  async getPortfolioByUsername(username) {
    try {
      const portfoliosRef = collection(db, 'portfolios');
      const q = query(portfoliosRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { success: false, error: 'Portfolio not found' };
    } catch (error) {
      console.error('Error fetching portfolio by username:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if username is available
  async isUsernameAvailable(username, currentUserId) {
    try {
      const portfoliosRef = collection(db, 'portfolios');
      const q = query(portfoliosRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      // If no documents found, username is available
      if (querySnapshot.empty) return true;
      
      // If found, check if it's the current user's portfolio
      const doc = querySnapshot.docs[0];
      return doc.data().userId === currentUserId;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  },

  // Update portfolio
  async updatePortfolio(userId, portfolioData) {
    try {
      const portfolioRef = doc(db, 'portfolios', userId);
      await updateDoc(portfolioRef, {
        ...portfolioData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating portfolio:', error);
      return { success: false, error: error.message };
    }
  }
};