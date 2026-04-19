import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { isPast, isToday, parseISO, isThisWeek } from 'date-fns';

export const useTasks = (filters = {}, sorting = 'deadline') => {
  const { tasks, addTask, updateTask, deleteTask } = useStudy();

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by Tab
    if (filters.tab === 'Pending') result = result.filter(t => t.status === 'Pending');
    else if (filters.tab === 'Completed') result = result.filter(t => t.status === 'Completed');
    else if (filters.tab === 'Overdue') result = result.filter(t => t.status === 'Pending' && isPast(parseISO(t.deadline)) && !isToday(parseISO(t.deadline)));
    else if (filters.tab === 'Revision') {
      result = result.filter(t => t.status === 'Revision' || (t.status === 'Pending' && t.priority === 'High'));
    }

    // Filter by Subject
    if (filters.subject && filters.subject !== 'All') result = result.filter(t => t.subjectId === filters.subject);
    
    // Filter by Priority
    if (filters.priority && filters.priority !== 'All') result = result.filter(t => t.priority === filters.priority);

    // Filter by Status
    if (filters.status && filters.status !== 'All') result = result.filter(t => t.status === filters.status);
    
    // Filter by Topic
    if (filters.topic && filters.topic !== 'All') result = result.filter(t => t.topic === filters.topic);

    // Filter by Deadline
    if (filters.deadline && filters.deadline !== 'All') {
      if (filters.deadline === 'Today') {
        result = result.filter(t => isToday(parseISO(t.deadline)));
      } else if (filters.deadline === 'This Week') {
        result = result.filter(t => isThisWeek(parseISO(t.deadline), { weekStartsOn: 1 }));
      } else if (filters.deadline === 'Overdue') {
        result = result.filter(t => t.status !== 'Completed' && isPast(parseISO(t.deadline)) && !isToday(parseISO(t.deadline)));
      }
    }

    // Search — checks title, topic, description, and notes
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.topic && t.topic.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.subjectName && t.subjectName.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sorting === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sorting === 'priority') {
        const scores = { High: 3, Medium: 2, Low: 1 };
        return scores[b.priority] - scores[a.priority];
      }
      if (sorting === 'subject') return (a.subjectName || '').localeCompare(b.subjectName || '');
      return 0;
    });

    return result;
  }, [tasks, filters, sorting]);

  return { tasks: filteredTasks, addTask, updateTask, deleteTask };
};
