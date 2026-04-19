import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { db, isMock } from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const StudyContext = createContext();

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};

export const StudyProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [revisionSchedules, setRevisionSchedules] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Persistence: Load Data
  useEffect(() => {
    if (!currentUser) {
      setSubjects([]);
      setTasks([]);
      setRevisionSchedules([]);
      setDataLoaded(false);
      return;
    }

    if (isMock) {
      try {
        const s = localStorage.getItem(`study_companion_subjects_${currentUser.uid}`);
        const t = localStorage.getItem(`study_companion_tasks_${currentUser.uid}`);
        const r = localStorage.getItem(`study_companion_revisions_${currentUser.uid}`);
        
        if (s) setSubjects(JSON.parse(s));
        if (t) setTasks(JSON.parse(t));
        if (r) setRevisionSchedules(JSON.parse(r));
      } catch (e) {
        console.warn('Storage read error', e);
      }
      setDataLoaded(true);
      return;
    }

    // Firestore Sync
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubjects(data.subjects || []);
        setTasks(data.tasks || []);
        setRevisionSchedules(data.revisionSchedules || []);
      }
      setDataLoaded(true);
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Persistence: Save Data
  useEffect(() => {
    if (!currentUser || !dataLoaded) return;

    if (isMock) {
      localStorage.setItem(`study_companion_subjects_${currentUser.uid}`, JSON.stringify(subjects));
      localStorage.setItem(`study_companion_tasks_${currentUser.uid}`, JSON.stringify(tasks));
      localStorage.setItem(`study_companion_revisions_${currentUser.uid}`, JSON.stringify(revisionSchedules));
      return;
    }

    // Save to Firestore
    const timeoutId = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          subjects,
          tasks,
          revisionSchedules,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    }, 1000); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [subjects, tasks, revisionSchedules, currentUser, dataLoaded]);

  // --- Subject Logic ---
  const addSubject = (subject) => {
    const newSubject = { id: uuidv4(), topics: [], color: '#6366f1', ...subject };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (id, updatedFields) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id)); // Cleanup linked tasks
    setRevisionSchedules(prev => prev.filter(r => r.subjectId !== id));
  };

  // --- Topic Logic ---
  const addTopic = (subjectId, topic) => {
    const newTopic = { 
      id: uuidv4(), 
      status: 'Not Started', 
      difficulty: 'Medium', 
      notes: '', 
      createdAt: new Date().toISOString(),
      ...topic 
    };
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) return { ...s, topics: [...(s.topics || []), newTopic] };
      return s;
    }));
  };

  const updateTopic = (subjectId, topicId, updatedFields) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const newTopics = s.topics.map(t => {
          if (t.id === topicId) {
            const updatedTopic = { ...t, ...updatedFields };
            if (updatedFields.status === 'Completed' && t.status !== 'Completed') {
              updatedTopic.completedAt = new Date().toISOString();
              scheduleRevision(subjectId, updatedTopic);
            }
            if (updatedFields.status && updatedFields.status !== 'Completed' && t.status === 'Completed') {
              updatedTopic.completedAt = null;
            }
            return updatedTopic;
          }
          return t;
        });
        return { ...s, topics: newTopics };
      }
      return s;
    }));
  };

  const deleteTopic = (subjectId, topicId) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
      return s;
    }));
  };

  // --- Task Logic ---
  const addTask = (task) => {
    const newTask = { id: uuidv4(), status: 'Pending', createdAt: new Date().toISOString(), ...task };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id, updatedFields) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, ...updatedFields };
      if (updatedFields.status === 'Completed' && t.status !== 'Completed') {
        next.completedAt = new Date().toISOString();
      }
      if (updatedFields.status && updatedFields.status !== 'Completed' && t.status === 'Completed') {
        next.completedAt = null;
      }
      return next;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- Revision Planner Engine ---
  const scheduleRevision = (subjectId, topic) => {
    const revisionDate = addDays(new Date(), 3); // Spaced Repetition Protocol Default: 3 Days
    const subject = subjects.find(s => s.id === subjectId);
    
    const newRevision = {
      id: uuidv4(),
      subjectId,
      topicId: topic.id,
      topicName: topic.name,
      subjectName: subject ? subject.name : 'Unassigned',
      date: revisionDate.toISOString(),
      status: 'Pending'
    };
    setRevisionSchedules(prev => [...prev, newRevision]);
  };

  const completeRevision = (id) => {
    setRevisionSchedules(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  // --- Data Management (Backup/Restore) ---
  const exportData = () => {
    const data = {
      subjects,
      tasks,
      revisionSchedules,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study_companion_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded successfully');
  };

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.subjects) setSubjects(data.subjects);
      if (data.tasks) setTasks(data.tasks);
      if (data.revisionSchedules) setRevisionSchedules(data.revisionSchedules);
      toast.success('Data restored successfully!');
      return true;
    } catch (e) {
      toast.error('Invalid backup file format');
      return false;
    }
  };

  const value = {
    subjects,
    tasks,
    revisionSchedules,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    addTask,
    updateTask,
    deleteTask,
    completeRevision,
    exportData,
    importData,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};