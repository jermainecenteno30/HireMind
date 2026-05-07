import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useResumes = () => {
  const { user, isPremium } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const q = query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const resumesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Ensure content is a string (fix for old data)
        let content = data.content || '';
        if (typeof content !== 'string') {
          // If content is an object, stringify it or use empty string
          content = typeof content === 'object' ? JSON.stringify(content) : '';
        }
        
        return {
          id: doc.id,
          ...data,
          content: content, // Guaranteed to be a string
          title: data.title || 'Untitled Resume',
          version: data.version || 1,
          tags: data.tags || [],
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      });
      setResumes(resumesData);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAddResume = () => {
    if (isPremium) return true;
    return resumes.length < 3;
  };

  const addResume = async (resumeData) => {
    if (!canAddResume()) {
      return { success: false, error: 'Free tier limit reached. Upgrade to add more resumes.' };
    }

    try {
      // Ensure content is a string
      const content = typeof resumeData.content === 'string' 
        ? resumeData.content 
        : (resumeData.content || '');
      
      const newResume = {
        title: resumeData.title || 'Untitled Resume',
        tags: resumeData.tags || [],
        content: content,
        structuredData: resumeData.structuredData || null,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: resumeData.version || 1,
        atsScore: resumeData.atsScore || 0
      };
      const docRef = await addDoc(collection(db, 'resumes'), newResume);
      setResumes([{ id: docRef.id, ...newResume }, ...resumes]);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding resume:', error);
      return { success: false, error: error.message };
    }
  };

  const updateResume = async (resumeId, resumeData) => {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      
      // Ensure content is a string
      const content = typeof resumeData.content === 'string' 
        ? resumeData.content 
        : (resumeData.content || '');
      
      const updatedData = {
        title: resumeData.title,
        tags: resumeData.tags || [],
        content: content,
        structuredData: resumeData.structuredData || null,
        updatedAt: new Date().toISOString(),
        version: (resumes.find(r => r.id === resumeId)?.version || 0) + 1,
        atsScore: resumeData.atsScore || 0
      };
      await updateDoc(resumeRef, updatedData);
      setResumes(resumes.map(resume => 
        resume.id === resumeId ? { ...resume, ...updatedData } : resume
      ));
      return { success: true };
    } catch (error) {
      console.error('Error updating resume:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      await deleteDoc(doc(db, 'resumes', resumeId));
      setResumes(resumes.filter(resume => resume.id !== resumeId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting resume:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    resumes,
    loading,
    canAddResume,
    addResume,
    updateResume,
    deleteResume
  };
};