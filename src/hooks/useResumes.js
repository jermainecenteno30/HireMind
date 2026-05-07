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
      const resumesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      // Store both structured data AND content for templates
      const newResume = {
        title: resumeData.title,
        tags: resumeData.tags || [],
        content: resumeData.content || '', // IMPORTANT: Store the markdown content for templates
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
      const updatedData = {
        ...resumeData,
        updatedAt: new Date().toISOString(),
        version: (resumes.find(r => r.id === resumeId)?.version || 0) + 1
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