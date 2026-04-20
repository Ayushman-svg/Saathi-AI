import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Calendar, Book, Activity, 
  Layers, Search, Plus, ListTodo
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    totalTasks, completedTasks, pendingTasks, revisionTasks
  } = useProgress();

  const { tasks, updateTask, deleteTask } = useTasks({ tab: 'All' }, 'deadline');

  const stats = [
    { label: 'Active', value: totalTasks, icon: Book, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Pending', value: pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 pt-2">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h3>
            <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <Activity className="w-3 h-3 text-blue-500" />
                <span>Productivity Stats</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/tasks')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold tracking-tight transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={item} className={`bg-white p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative group`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h4>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task List Section */}
      <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                  <ListTodo className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-xl font-bold text-slate-900 tracking-tight">Active Task Queue</h4>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">System Status: Optimized</p>
                  </div>
              </div>
          </div>

          <div className="space-y-3">
             <AnimatePresence>
                {tasks.slice(0, 10).map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={() => navigate('/tasks')}
                        onDelete={deleteTask}
                        onToggleStatus={(id, status) => updateTask(id, { status })}
                        compact={true}
                    />
                ))}
             </AnimatePresence>
             
             {tasks.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center opacity-20 gap-4 border-dashed border-2 border-slate-200 rounded-xl">
                <Search className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-bold uppercase tracking-wider">No active tasks in queue</p>
              </div>
            )}

            {tasks.length > 10 && (
                <button 
                    onClick={() => navigate('/tasks')}
                    className="w-full py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 transition-all border border-dashed border-slate-200 rounded-xl"
                >
                    View All {tasks.length} Tasks
                </button>
            )}
          </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;