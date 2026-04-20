import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, BrainCircuit, Target, Ghost } from 'lucide-react';

const RevisionList = ({ revisions, onComplete }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <AnimatePresence>
        {revisions.map(revision => (
          <motion.div 
              key={revision.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 group hover:border-slate-400 transition-all border-transparent flex items-center justify-between gap-4 relative overflow-hidden bg-white rounded-xl"
          >
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto overflow-hidden">
               <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0 ${revision.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-slate-100/50 text-slate-700 border border-slate-300 shadow-none'}`}>
                  {revision.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 font-bold" /> : <BrainCircuit className="w-5 h-5 font-bold animate-pulse" />}
               </div>
               <div className="overflow-hidden">
                  <h5 className={`text-sm font-bold tracking-tight uppercase transition-all truncate ${revision.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-slate-700'}`}>{revision.topicName}</h5>
                  <div className="flex gap-2 items-center mt-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700/90 bg-slate-100/50 px-2 py-0.5 rounded-lg border border-slate-300 truncate max-w-[120px]">{revision.subjectName}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center shrink-0 relative z-10">
              {revision.status === 'Pending' ? (
                <button 
                  onClick={() => onComplete(revision)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-zinc-500 transition-all shadow-xl"
                >
                   Complete
                </button>
              ) : (
                <div className="text-xs font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 flex items-center gap-1.5">
                   <Target className="w-3 h-3" /> Done
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {revisions.length === 0 && (
         <div className="py-32 flex flex-col items-center justify-center opacity-30 gap-8 border-dashed border-2 bg-slate-100 border-slate-300 rounded-2xl group">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden group-hover:border-slate-400 transition-colors">
               <div className="absolute inset-0 bg-blue-600/5 hidden group-hover:opacity-100 transition-opacity" />
               <History className="w-10 h-10 text-slate-600 group-hover:text-slate-700 transition-colors" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-bold text-slate-900 uppercase tracking-tight text-2xl group-hover: transition-all">No Revisions</p>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-600">No revisions scheduled for this date.</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default RevisionList;
