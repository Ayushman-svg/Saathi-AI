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
    { label: 'Active', value: totalTasks, icon: Book, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Pending', value: pendingTasks, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white tracking-tighter text-glow uppercase">OPERATIONS CENTER</h3>
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[8px]">
                <Activity className="w-2.5 h-2.5 text-indigo-500" />
                <span>TASK CONTROL UNIT</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 bg-white/5 border border-white/5 hover:border-white/20 text-white rounded-lg text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add Task
          </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={item} className={`glass-card p-6 group hover:border-white/20 transition-all border-white/5 bg-slate-900/40 relative overflow-hidden`}>
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <h4 className="text-4xl font-black text-white tracking-tighter text-glow">{stat.value}</h4>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <stat.icon className="w-24 h-24 -mr-8 -mt-8" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task List Section */}
      <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                  <ListTodo className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">Active Task Queue</h4>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Live Status: System Optimized</p>
                  </div>
              </div>
          </div>

          <div className="space-y-3">
             <AnimatePresence mode="popLayout">
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
              <div className="py-20 flex flex-col items-center justify-center opacity-20 gap-4 border-dashed border-2 border-white/5 rounded-2xl">
                <Search className="w-10 h-10 text-slate-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">No active tasks in queue</p>
              </div>
            )}

            {tasks.length > 10 && (
                <button 
                    onClick={() => navigate('/tasks')}
                    className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all border border-dashed border-white/5 rounded-xl"
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