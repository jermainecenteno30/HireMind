import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const q = query(
        collection(db, 'jobs'),
        where('userId', '==', user.uid),
        orderBy('dateApplied', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData) => {
    try {
      const newJob = {
        ...jobData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        dateApplied: jobData.dateApplied || new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'jobs'), newJob);
      setJobs([{ id: docRef.id, ...newJob }, ...jobs]);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding job:', error);
      return { success: false, error: error.message };
    }
  };

  const updateJob = async (jobId, jobData) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, jobData);
      setJobs(jobs.map(job => job.id === jobId ? { ...job, ...jobData } : job));
      return { success: true };
    } catch (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(jobs.filter(job => job.id !== jobId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }
  };

  const getStats = () => {
    const stats = {
      total: jobs.length,
      applied: jobs.filter(j => j.status === 'applied').length,
      interview: jobs.filter(j => j.status === 'interview').length,
      rejected: jobs.filter(j => j.status === 'rejected').length,
      hired: jobs.filter(j => j.status === 'hired').length
    };
    return stats;
  };

  return {
    jobs,
    loading,
    addJob,
    updateJob,
    deleteJob,
    getStats
  };
};