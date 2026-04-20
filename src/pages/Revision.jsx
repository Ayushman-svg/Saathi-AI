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
  const mergedRevisions = React.useMemo(() => [
    ...revisionSchedules.map(r => ({ ...r, type: 'schedule' })),
    ...tasks.filter(t => t.status === 'Revision').map(t => {
        const subject = subjects.find(s => s.id === t.subjectId);
        return {
            id: t.id,
            topicName: t.title,
            subjectName: subject ? subject.name : 'Unknown',
            date: t.deadline || t.createdAt || new Date().toISOString(),
            status: 'Pending',
            type: 'task'
        };
    })
  ], [revisionSchedules, tasks, subjects]);

  const getRevisionForDate = (date) => {
    if (!date) return [];
    return mergedRevisions.filter(r => {
        if (!r.date) return false;
        try {
            return isSameDay(parseISO(r.date), date);
        } catch (e) {
            console.error("Invalid date in revision:", r.date);
            return false;
        }
    });
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 pt-2">
        <div className="flex items-center gap-4">
           <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Revision Planner</h3>
           <div className="h-4 w-px bg-slate-200 hidden md:block" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block leading-none mt-1 italic">Optimize Recall</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm">
            <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Queue Status</span>
                <span className="text-lg font-bold text-slate-900 leading-none">{pendingOverall} Pending</span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
                <BrainCircuit className="w-5 h-5" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 xl:col-span-5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card-premium p-6 h-fit sticky top-8">
                  <Calendar 
                    onChange={setSelectedDate} 
                    value={selectedDate}
                    tileClassName={({ date }) => 
                      getRevisionForDate(date).length > 0 ? 'revision-tile' : ''
                    }
                  />
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                         <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Scheduled Sessions</span>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sync status</p>
                         <div className="flex items-center gap-4">
                            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-[95%]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Optimized</span>
                         </div>
                      </div>
                  </div>
              </motion.div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 relative group">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">Active Revisions</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{format(selectedDate, 'EEEE, MMMM dd')}</p>
                    </div>
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                    {selectedRevisions.length} Tasks
                </div>
              </div>

              <div className="min-h-[500px]">
                <RevisionList 
                    revisions={selectedRevisions} 
                    onComplete={handleComplete} 
                />
              </div>
          </div>
      </div>
    </motion.div>
  );
};

export default Revision;
