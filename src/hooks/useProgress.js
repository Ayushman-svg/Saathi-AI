import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { parseISO, format, subDays, startOfDay, isSameDay } from 'date-fns';

export const useProgress = () => {
  const { subjects, tasks, revisionSchedules } = useStudy();

  // Unified "Work" counts across both Tasks and Topics
  const allTopics = subjects.reduce((acc, s) => [...acc, ...(s.topics || [])], []);
  
  const totalTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const revisionTasks = tasks.filter(t => t.status === 'Revision').length + 
                        revisionSchedules.filter(r => r.status === 'Pending').length;

  const subjectProgress = subjects.map(s => {
    const totalTopics = s.topics?.length || 0;
    const completedTopics = s.topics?.filter(t => t.status === 'Completed').length || 0;
    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      name: s.name,
      progress,
      max: 100,
      color: s.color || '#6366f1'
    };
  });

  // Weekly productivity: Tracks both Tasks and Topics (Created vs Completed)
  const weeklyProductivity = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayLabel = format(day, 'EEE');

      // Count Tasks Created on this day
      const tasksCreated = tasks.filter(t => t.createdAt && isSameDay(parseISO(t.createdAt), day)).length;

      // Count Tasks Completed on this day
      const tasksFinished = tasks.filter(t => t.completedAt && t.status === 'Completed' && isSameDay(parseISO(t.completedAt), day)).length;

      days.push({
        name: dayLabel,
        created: tasksCreated,
        completed: tasksFinished,
      });
    }

    return days;
  }, [tasks, allTopics]);

  // Upcoming revisions (next 7 days, pending only)
  const upcomingRevisions = useMemo(() => {
    const today = startOfDay(new Date());
    const mergedRevisions = [
      ...revisionSchedules.map(r => ({ ...r, type: 'schedule' })),
      ...tasks.filter(t => t.status === 'Revision').map(t => {
          const subject = subjects.find(s => s.id === t.subjectId);
          return {
              id: t.id,
              topicName: t.title,
              subjectName: subject ? subject.name : 'Unknown',
              date: t.deadline || t.createdAt,
              status: 'Pending',
              type: 'task'
          };
      })
    ];

    return mergedRevisions
      .filter(r => {
        if (r.status !== 'Pending') return false;
        const revDate = parseISO(r.date);
        return revDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [revisionSchedules, tasks, subjects]);

  // Streak calculation: Consecutive days of activity (completing items)
  const studyStreak = useMemo(() => {
    let streak = 0;
    try {
      const today = startOfDay(new Date());
      
      for (let i = 0; i < 30; i++) {
          const checkDay = subDays(today, i);
          const hasActivity = tasks.some(t => {
              if (!t.completedAt || t.status !== 'Completed') return false;
              try { return isSameDay(parseISO(t.completedAt), checkDay); } catch(e) { return false; }
          }) || allTopics.some(t => {
              if (!t.completedAt || t.status !== 'Completed') return false;
              try { return isSameDay(parseISO(t.completedAt), checkDay); } catch(e) { return false; }
          });
          
          if (hasActivity) {
              streak++;
          } else if (i === 0) {
              continue;
          } else {
              break;
          }
      }
    } catch (err) {
      console.error("Streak calculation error:", err);
    }
    return streak;
  }, [tasks, allTopics]);

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    revisionTasks,
    completionPercentage,
    subjectProgress,
    weeklyProductivity,
    upcomingRevisions,
    studyStreak
  };
};
