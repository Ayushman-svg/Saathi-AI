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
      if (selectedTopic !== '') setValue('topic', '');
      return;
    }
    const hasTopic = selectedSubjectTopics.some((topic) => topic.name === selectedTopic);
    if (!hasTopic && selectedTopic !== '') setValue('topic', '');
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
             <h3 className="text-xl font-bold text-slate-900 tracking-tight  uppercase">OPERATIONS</h3>
             <div className="h-4 w-px bg-slate-200" />
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-none mt-1">TASKS</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingTask(null); reset(); setIsModalOpen(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-zinc-500 transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> ADD
          </motion.button>
      </div>

      <div className="space-y-4">
          <div className="card-premium p-3 flex items-center gap-4 border-slate-200 bg-white">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 shrink-0">
                   <Filter className="w-3 h-3 text-slate-600" />
                   <h5 className="font-bold text-slate-600 uppercase text-xs tracking-wider">Filters</h5>
                </div>
                
                 <div className="flex flex-nowrap items-center gap-6 grow overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-2 shrink-0">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Subject</label>
                       <select 
                         value={filterSubject} 
                         onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic('All'); }}
                         className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-bold outline-none focus:ring-1 focus:ring-blue-600/30 max-w-[140px] truncate"
                       >
                         <option value="All">All</option>
                         {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Topic</label>
                       <select 
                         value={filterTopic} 
                         onChange={(e) => setFilterTopic(e.target.value)}
                         className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-bold outline-none focus:ring-1 focus:ring-blue-600/30 max-w-[120px] truncate"
                       >
                         <option value="All">All</option>
                         {subjects.find(s => s.id === filterSubject)?.topics?.map(t => (
                             <option key={t.id} value={t.name}>{t.name}</option>
                         ))}
                       </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Priority</label>
                       <select 
                         value={filterPriority} 
                         onChange={(e) => setFilterPriority(e.target.value)}
                         className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-bold outline-none focus:ring-1 focus:ring-blue-600/30"
                       >
                         <option value="All">All</option>
                         <option value="High">High</option>
                         <option value="Medium">Medium</option>
                         <option value="Low">Low</option>
                       </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Status</label>
                       <select 
                         value={filterStatus} 
                         onChange={(e) => setFilterStatus(e.target.value)}
                         className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-bold outline-none focus:ring-1 focus:ring-blue-600/30"
                       >
                         <option value="All">All</option>
                         <option value="Pending">Pending</option>
                         <option value="Completed">Completed</option>
                         <option value="Revision">Revision</option>
                       </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">Sort</label>
                       <div className="flex gap-1">
                         {['deadline', 'priority'].map(s => (
                             <button 
                                 key={s} 
                                 onClick={() => setSorting(s)}
                                 className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${sorting === s ? 'bg-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
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
                  <div className="flex flex-wrap gap-1 card-premium p-0.5 border-slate-200 bg-white overflow-hidden relative shadow-2xl">
                    {tabs.map(tab => (
                      <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase text-xs tracking-wider transition-all relative z-10 ${activeTab === tab.label ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
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
                 <AnimatePresence>
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
                    className="py-40 flex flex-col items-center justify-center text-center opacity-30 gap-8 card-premium border-dashed border-2 border-slate-200 bg-white/30 group hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden group-hover:border-slate-400 transition-colors">
                        <Ban className="w-10 h-10 text-slate-600 group-hover:text-slate-700 transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-slate-900 uppercase tracking-tight text-2xl group-hover: transition-all">No Tasks</p>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-600 leading-relaxed">Add a task to get started.</p>
                    </div>
                  </motion.div>
                )}
              </div>
          </section>
      </div>

      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 md:left-[112px] z-45 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="card-premium w-full max-w-2xl p-8 space-y-6 border-slate-300 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 hidden">
                         <Brain className="w-40 h-40 -mr-12 -mt-12" />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                        <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight ">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-all"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Task Title</label>
                                <input {...register('title')} placeholder="Enter your subject" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-bold tracking-wider transition-all" />
                                {errors.title && <p className="text-red-400 text-sm font-bold uppercase tracking-wider mt-1.5 ml-1">Error: {errors.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Subject</label>
                                <div className="relative group">
                                    <select {...register('subjectId')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-bold tracking-wider appearance-none transition-all">
                                        <option value="">Select</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-900 transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                                {errors.subjectId && <p className="text-red-400 text-sm font-bold uppercase tracking-wider mt-1.5 ml-1">Error: {errors.subjectId.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Deadline</label>
                                <input 
                                    type="date" 
                                    {...register('deadline')} 
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-bold tracking-wider transition-all" 
                                />
                                {errors.deadline && <p className="text-red-400 text-xs font-bold uppercase tracking-wider mt-1.5 ml-1">Error: {errors.deadline.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Priority</label>
                                <div className="relative group">
                                    <select {...register('priority')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-bold tracking-wider appearance-none transition-all">
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-900 transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Status</label>
                                <div className="relative group">
                                    <select {...register('status')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-bold tracking-wider appearance-none transition-all">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Revision">Revision</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-900 transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Topic</label>
                                <div className="relative group">
                                    <select {...register('topic')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 uppercase font-bold tracking-wider appearance-none transition-all">
                                        <option value="">None</option>
                                        {selectedSubjectTopics.map(topic => (
                                          <option key={topic.id} value={topic.name}>{topic.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-900 transition-colors w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em] px-1 italic">Description</label>
                            <textarea {...register('description')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 h-28 resize-none font-medium leading-relaxed" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all border border-slate-300"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="flex-2 h-14 bg-blue-600 text-white text-slate-900 rounded-xl text-sm font-bold tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl leading-none border border-white/20">
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