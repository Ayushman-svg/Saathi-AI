import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckSquare, Clock, AlertCircle, Ban, 
  X, Target, Zap, Filter, ArrowUpDown, Brain, ChevronDown, Flag
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useTasks } from '../hooks/useTasks';
import { useStudy } from '../context/StudyContext';
import { useDebounce } from '../hooks/useDebounce';
import TaskCard from '../components/TaskCard';
import SearchBar from '../components/SearchBar';

// PRD Validation Schema
const taskSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title is too short'),
  subjectId: yup.string().required('Subject is required'),
  topic: yup.string(),
  deadline: yup.string()
    .required('Deadline is required')
    .test('is-future', 'Deadline cannot be in the past', (value) => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  priority: yup.string().required('Priority is required'),
  status: yup.string().required('Status is required'),
  description: yup.string(),
});

const Tasks = () => {
  const { subjects } = useStudy();
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sorting, setSorting] = useState('deadline');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDeadline, setFilterDeadline] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { tasks, addTask, updateTask, deleteTask } = useTasks({
    tab: activeTab === 'All Tasks' ? 'All' : activeTab,
    search: debouncedSearch,
    subject: filterSubject,
    topic: filterTopic,
    priority: filterPriority,
    status: filterStatus,
    deadline: filterDeadline
  }, sorting);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: { priority: 'Medium', status: 'Pending', deadline: new Date().toISOString().split('T')[0] }
  });
  const selectedSubjectId = watch('subjectId');
  const selectedTopic = watch('topic');
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId),
    [subjects, selectedSubjectId]
  );
  const selectedSubjectTopics = selectedSubject?.topics || [];

  useEffect(() => {
    if (!selectedSubjectId) {
      setValue('topic', '');
      return;
    }
    const hasTopic = selectedSubjectTopics.some((topic) => topic.name === selectedTopic);
    if (!hasTopic) setValue('topic', '');
  }, [selectedSubjectId, selectedSubjectTopics, selectedTopic, setValue]);

  const onSubmit = (data) => {
    const subject = subjects.find(s => s.id === data.subjectId);
    const taskData = {
      ...data,
      subjectName: subject?.name || 'Unassigned',
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully');
    } else {
      addTask(taskData);
      toast.success('Task added successfully');
    }
    
    setIsModalOpen(false);
    setEditingTask(null);
    reset();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    Object.keys(task).forEach(key => setValue(key, task[key]));
    setIsModalOpen(true);
  };

  const tabs = [
    { label: 'All Tasks', icon: CheckSquare },
    { label: 'Pending', icon: Clock },
    { label: 'Completed', icon: Target },
    { label: 'Overdue', icon: AlertCircle },
    { label: 'Revision', icon: Zap },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
             <h3 className="text-xl font-black text-white tracking-tighter text-glow uppercase">OPERATIONS</h3>
             <div className="h-4 w-px bg-white/10" />
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mt-1">TASKS</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingTask(null); reset(); setIsModalOpen(true); }}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-indigo-600 transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> ADD
          </motion.button>
      </div>

      <div className="space-y-4">
          <div className="glass-card p-3 flex flex-wrap items-center gap-4 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-2 pr-4 border-r border-white/5">
                   <Filter className="w-3 h-3 text-slate-500" />
                   <h5 className="font-black text-slate-500 uppercase text-[8px] tracking-widest">Filters</h5>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 grow">
                   <div className="flex items-center gap-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Subject</label>
                      <select 
                        value={filterSubject} 
                        onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic('All'); }}
                        className="bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-[9px] text-white uppercase font-black outline-none focus:ring-1 focus:ring-indigo-500/30"
                      >
                        <option value="All">All</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                   </div>

                   <div className="flex items-center gap-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Topic</label>
                      <select 
                        value={filterTopic} 
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-[9px] text-white uppercase font-black outline-none focus:ring-1 focus:ring-indigo-500/30 min-w-[80px]"
                      >
                        <option value="All">All</option>
                        {subjects.find(s => s.id === filterSubject)?.topics?.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                   </div>

                   <div className="flex items-center gap-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Priority</label>
                      <select 
                        value={filterPriority} 
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-[9px] text-white uppercase font-black outline-none focus:ring-1 focus:ring-indigo-500/30"
                      >
                        <option value="All">All</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                   </div>

                   <div className="flex items-center gap-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Status</label>
                      <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-[9px] text-white uppercase font-black outline-none focus:ring-1 focus:ring-indigo-500/30"
                      >
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Revision">Revision</option>
                      </select>
                   </div>

                   <div className="flex items-center gap-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Sort</label>
                      <div className="flex gap-1">
                        {['deadline', 'priority'].map(s => (
                            <button 
                                key={s} 
                                onClick={() => setSorting(s)}
                                className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase transition-all ${sorting === s ? 'bg-indigo-500 text-white' : 'bg-slate-950/40 border-white/5 text-slate-600'}`}
                            >
                                {s}
                            </button>
                        ))}
                      </div>
                   </div>
                </div>
          </div>

          <section className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1 glass-card p-0.5 border-white/5 bg-slate-900/60 overflow-hidden relative shadow-2xl">
                    {tabs.map(tab => (
                      <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black uppercase text-[8px] tracking-widest transition-all relative z-10 ${activeTab === tab.label ? 'bg-indigo-500 text-white shadow-xl' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                      >
                        <tab.icon className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="w-full max-w-[200px]">
                      <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
                  </div>
              </div>

              <div className="space-y-6">
                 <AnimatePresence mode="popLayout">
                    {tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onEdit={handleEdit}
                            onDelete={deleteTask}
                            onToggleStatus={(id, status) => updateTask(id, { status })}
                            compact={true}
                        />
                    ))}
                 </AnimatePresence>
                 
                 {tasks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-40 flex flex-col items-center justify-center text-center opacity-30 gap-8 glass-card border-dashed border-2 border-white/5 bg-slate-900/30 group hover:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden group-hover:border-indigo-500/50 transition-colors">
                        <Ban className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-white uppercase tracking-tighter text-2xl group-hover:text-glow transition-all">No Tasks</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-relaxed">Add a task to get started.</p>
                    </div>
                  </motion.div>
                )}
              </div>
          </section>
      </div>

      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 md:left-[112px] z-45 flex items-center justify-center p-4 bg-[#0a0b10]/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card w-full max-w-2xl p-8 space-y-6 border-white/10 bg-slate-900 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                         <Brain className="w-40 h-40 -mr-12 -mt-12" />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-glow">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Task Title</label>
                                <input {...register('title')} placeholder="e.g. Quantum Entropy Analysis" className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest transition-all" />
                                {errors.title && <p className="text-red-400 text-[9px] font-black uppercase tracking-widest mt-1.5 ml-1">Error: {errors.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Subject</label>
                                <div className="relative group">
                                    <select {...register('subjectId')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest appearance-none transition-all">
                                        <option value="">Select</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                                {errors.subjectId && <p className="text-red-400 text-[9px] font-black uppercase tracking-widest mt-1.5 ml-1">Error: {errors.subjectId.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Deadline</label>
                                <input 
                                    type="date" 
                                    {...register('deadline')} 
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest transition-all" 
                                />
                                {errors.deadline && <p className="text-red-400 text-[8px] font-black uppercase tracking-widest mt-1.5 ml-1">Error: {errors.deadline.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Priority</label>
                                <div className="relative group">
                                    <select {...register('priority')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest appearance-none transition-all">
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Status</label>
                                <div className="relative group">
                                    <select {...register('status')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest appearance-none transition-all">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Revision">Revision</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Topic</label>
                                <div className="relative group">
                                    <select {...register('topic')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest appearance-none transition-all">
                                        <option value="">None</option>
                                        {selectedSubjectTopics.map(topic => (
                                          <option key={topic.id} value={topic.name}>{topic.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Description</label>
                            <textarea {...register('description')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500/50 h-28 resize-none font-medium leading-relaxed" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="flex-2 h-14 premium-gradient-primary text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl leading-none border border-white/20">
                                Save Task
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;