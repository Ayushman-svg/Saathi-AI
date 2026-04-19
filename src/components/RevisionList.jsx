import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, BrainCircuit, Target, Ghost } from 'lucide-react';

const RevisionList = ({ revisions, onComplete }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <AnimatePresence mode="popLayout">
        {revisions.map(revision => (
          <motion.div 
              key={revision.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 group hover:border-indigo-500/50 transition-all border-transparent flex items-center justify-between gap-4 relative overflow-hidden bg-slate-900/40 rounded-xl"
          >
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto overflow-hidden">
               <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0 ${revision.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-indigo-500/20'}`}>
                  {revision.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 font-black" /> : <BrainCircuit className="w-5 h-5 font-black animate-pulse" />}
               </div>
               <div className="overflow-hidden">
                  <h5 className={`text-sm font-black tracking-tight uppercase transition-all truncate ${revision.status === 'Completed' ? 'text-slate-600 line-through' : 'text-white group-hover:text-indigo-400'}`}>{revision.topicName}</h5>
                  <div className="flex gap-2 items-center mt-0.5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Subject</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400/90 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 truncate max-w-[120px]">{revision.subjectName}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center shrink-0 relative z-10">
              {revision.status === 'Pending' ? (
                <button 
                  onClick={() => onComplete(revision)}
                  className="px-5 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-indigo-600 transition-all shadow-xl"
                >
                   Complete
                </button>
              ) : (
                <div className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 flex items-center gap-1.5">
                   <Target className="w-3 h-3" /> Done
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {revisions.length === 0 && (
         <div className="py-32 flex flex-col items-center justify-center opacity-30 gap-8 border-dashed border-2 bg-white/5 border-white/10 rounded-3xl group">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden group-hover:border-indigo-500/50 transition-colors">
               <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:opacity-100 transition-opacity" />
               <History className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-black text-white uppercase tracking-tighter text-2xl group-hover:text-glow transition-all">No Revisions</p>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">No revisions scheduled for this date.</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default RevisionList;
