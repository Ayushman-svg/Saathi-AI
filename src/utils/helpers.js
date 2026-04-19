import { format, isPast, isToday, parseISO } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return 'Undated';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const getTaskStatus = (task) => {
  if (task.status === 'Completed') return 'Completed';
  if (isPast(parseISO(task.deadline)) && !isToday(parseISO(task.deadline))) return 'Overdue';
  return 'Pending';
};

export const calculatePriorityScore = (priority) => {
  const scores = { High: 3, Medium: 2, Low: 1 };
  return scores[priority] || 0;
};

export const filterTasks = (tasks, activeTab) => {
  if (activeTab === 'All Tasks' || activeTab === 'All') return tasks;
  
  return tasks.filter(task => {
    const status = getTaskStatus(task);
    if (activeTab === 'Pending') return status === 'Pending';
    if (activeTab === 'Completed') return status === 'Completed';
    if (activeTab === 'Overdue') return status === 'Overdue';
    if (activeTab === 'Revision') return task.priority === 'High' && status === 'Pending';
    return true;
  });
};
