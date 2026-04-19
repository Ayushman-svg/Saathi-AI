import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Trash2, Edit2, Calendar, Flag } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus, compact }) => {
  const isOverdue = task.status === 'Pending' && isPast(parseISO(task.deadline)) && !isToday(parseISO(task.deadline));
  const isDueToday = isToday(parseISO(task.deadline));

  const priorityColors = {
    High: 'text-red-400 bg-red-400/10 border-red-500/20',
    Medium: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
    Low: 'text-green-400 bg-green-400/10 border-green-500/20',
  };

  return (
    <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={`glass-card ${compact ? 'p-3 gap-4' : 'p-6 gap-6'} flex items-center group hover:border-white/10 transition-all ${task.status === 'Completed' ? 'opacity-40 grayscale' : ''} relative`}
    >
      <div className="shrink-0 relative z-10">
        <button 
          onClick={() => onToggleStatus(task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
          className={`${compact ? 'w-6 h-6 rounded-lg' : 'w-8 h-8 rounded-xl'} border flex items-center justify-center transition-all duration-500 ${task.status === 'Completed' ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'border-white/10 text-transparent hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5'}`}
        >
          <CheckCircle className={`${compact ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
        </button>
      </div>

      <div className="grow overflow-hidden relative z-10">
        <div className="flex flex-wrap items-center gap-2">
             <h4 className={`${compact ? 'text-[11px]' : 'text-xl'} font-black transition-all tracking-tight truncate uppercase leading-none ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-white group-hover:text-glow'}`}>{task.title}</h4>
             <span className={`${compact ? 'text-[6px] px-1.5 py-0.5' : 'text-[9px] px-2 py-1'} font-black uppercase tracking-[0.2em] rounded-md border flex items-center gap-1 ${priorityColors[task.priority]}`}>
                <Flag className={`${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} /> {task.priority}
             </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
             <div className={`${compact ? 'text-[7px] px-2 py-0.5' : 'text-[10px] px-3 py-1'} font-black text-slate-500 uppercase tracking-widest bg-white/5 border border-white/5 rounded-lg truncate max-w-[140px]`}>{task.subjectName}</div>
             <div className="h-2 w-px bg-white/5" />
             <div className={`${compact ? 'text-[7px]' : 'text-[10px]'} flex items-center gap-1.5 font-black uppercase tracking-widest ${isOverdue ? 'text-red-400 animate-pulse' : isDueToday ? 'text-amber-400' : 'text-slate-500'}`}>
                <Calendar className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
                <span>{format(parseISO(task.deadline), compact ? 'MMM dd' : 'MMM dd, yyyy')}</span>
             </div>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0 relative z-10">
         <button onClick={() => onEdit(task)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
         <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
      </div>
    </motion.div>
  );
};

export default TaskCard;
