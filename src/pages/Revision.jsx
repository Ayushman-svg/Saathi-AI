import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO } from 'date-fns';
import { History, Layers, Target, BrainCircuit, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import { toast } from 'react-toastify';
import RevisionList from '../components/RevisionList';

const Revision = () => {
  const { revisionSchedules, completeRevision, tasks, subjects, updateTask } = useStudy();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Merge revisionSchedules with Tasks that are marked as 'Revision'
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

  const getRevisionForDate = (date) => {
    return mergedRevisions.filter(r => isSameDay(parseISO(r.date), date));
  };

  const handleComplete = (rev) => {
    if (rev.type === 'task') {
        updateTask(rev.id, { status: 'Completed' });
        toast.success('Task revision completed!');
    } else {
        completeRevision(rev.id);
        toast.success('Revision completed!');
    }
  };

  const selectedRevisions = getRevisionForDate(selectedDate);
  const pendingOverall = mergedRevisions.filter(r => r.status === 'Pending').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-4">
           <h3 className="text-2xl font-black text-white tracking-tighter text-glow uppercase">PLANNER</h3>
           <div className="h-4 w-px bg-white/10 hidden md:block" />
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:block leading-none mt-1">Schedule Revisions</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-3 hover:border-white/20 transition-all border-white/5 bg-slate-900/40 relative overflow-hidden group">
            <div className="flex flex-col items-end relative z-10">
                <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">Pending</span>
                <span className="text-lg font-black text-indigo-400 leading-none">{pendingOverall}</span>
            </div>
            <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 relative z-10">
                <BrainCircuit className="w-4 h-4" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 xl:col-span-5 space-y-4">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-4 border-white/5 bg-slate-900/40 relative group overflow-hidden h-fit">
                  <Calendar 
                    onChange={setSelectedDate} 
                    value={selectedDate}
                    tileClassName={({ date }) => 
                      getRevisionForDate(date).length > 0 ? 'revision-tile' : ''
                    }
                  />
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-4">
                      <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                             <span className="font-black text-[11px] text-slate-400 uppercase tracking-widest">Has revisions</span>
                          </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sync Status</p>
                         <div className="flex items-center gap-3">
                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500/30 w-full" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Up to date</span>
                         </div>
                      </div>
                  </div>
                  <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none group-hover:rotate-12 group-hover:scale-125 transition-all duration-1000">
                    <Activity className="w-64 h-64" />
                  </div>
              </motion.div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 relative group">
                <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">Revisions</h4>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{format(selectedDate, 'MMM dd, yyyy')}</p>
                    </div>
                </div>
                <div className="bg-slate-950 border border-white/5 px-4 py-1.5 rounded-xl flex items-center gap-2">
                    <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest leading-none bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">{selectedRevisions.length} Found</span>
                </div>
              </div>

              <div className="min-h-[400px]">
                <RevisionList 
                    revisions={selectedRevisions} 
                    onComplete={handleComplete} 
                />
              </div>
          </div>
      </div>

      <div className="absolute bottom-0 left-0 p-20 opacity-5 pointer-events-none select-none -ml-40 -mb-20 overflow-hidden">
         <Layers className="w-[800px] h-[800px] -rotate-12 blur-3xl text-indigo-500" />
      </div>
    </motion.div>
  );
};

export default Revision;
