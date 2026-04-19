import React from 'react';
import { motion } from 'framer-motion';
import { Book, Edit2, Trash2, ChevronRight, Layers } from 'lucide-react';

const SubjectCard = ({ subject, onEdit, onDelete, onClick, compact }) => {
  const completedTopics = subject.topics ? subject.topics.filter(t => t.status === 'Completed').length : 0;
  const totalTopics = subject.topics ? subject.topics.length : 0;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onClick(subject)}
      className={`${compact ? 'p-1.5' : 'p-6'} glass-card cursor-pointer group hover:border-indigo-500/50 transition-all border-transparent flex flex-col justify-between h-full bg-slate-900/50 rounded-lg`}
    >
      <div className={`flex justify-between items-start ${compact ? 'mb-2' : 'mb-6'}`}>
        <div className="flex items-center gap-2 grow overflow-hidden">
          <div className={`${compact ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-2xl'} shrink-0 flex items-center justify-center text-white shadow-xl`} style={{ backgroundColor: subject.color || '#6366f1' }}>
            <Book className={`${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <div className="overflow-hidden">
            <h4 className={`${compact ? 'text-sm' : 'text-xl'} font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate`}>{subject.name}</h4>
            {!compact && <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Subject</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onEdit(subject); }} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(subject.id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {!compact && <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-8 font-medium">{subject.description || 'No description added yet.'}</p>}

      <div className={`${compact ? 'space-y-2' : 'space-y-4'}`}>
        <div className={`flex items-center justify-between font-black text-slate-500 uppercase tracking-widest border-b border-white/5 ${compact ? 'text-[8px] pb-1' : 'text-[10px] pb-2'}`}>
            <div className="flex items-center gap-1.5">
                 <Layers className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                 <span>{totalTopics}</span>
            </div>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full"
            />
        </div>
      </div>
      
      {!compact && (
          <div className="mt-6 flex items-center justify-end">
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
      )}
    </motion.div>
  );
};

export default SubjectCard;
