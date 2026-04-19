import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Book, Edit2, Trash2, List, BrainCircuit, Target, Ghost } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useSubjects } from '../hooks/useSubjects';
import { useDebounce } from '../hooks/useDebounce';
import SubjectCard from '../components/SubjectCard';
import SearchBar from '../components/SearchBar';

// PRD Validation Schema
const subjectSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name is too short'),
  description: yup.string().max(200, 'Max 200 characters'),
  color: yup.string().default('#6366f1'),
});

const topicSchema = yup.object().shape({
  name: yup.string().required('Topic name required'),
  difficulty: yup.string().required('Difficulty is required'),
  status: yup.string().required('Status is required'),
  notes: yup.string(),
});

const Subjects = () => {
    const { subjects, addSubject, updateSubject, deleteSubject, addTopic, updateTopic, deleteTopic } = useSubjects();
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
        resolver: yupResolver(subjectSchema),
    });

    const { register: registerTopic, handleSubmit: handleSubmitTopic, reset: resetTopic, formState: { errors: topicErrors }, setValue: setTopicValue } = useForm({
        resolver: yupResolver(topicSchema),
    });

    const onSubmitSubject = (data) => {
        if (editingSubject) {
            updateSubject(editingSubject.id, data);
            toast.success('Subject updated successfully');
        } else {
            addSubject(data);
            toast.success('Subject added successfully');
        }
        setIsSubjectModalOpen(false);
        setEditingSubject(null);
        reset();
    };

    const onSubmitTopic = (data) => {
        if (editingTopic) {
            updateTopic(selectedSubjectId, editingTopic.id, data);
            toast.success('Topic updated successfully');
        } else {
            addTopic(selectedSubjectId, data);
            toast.success('Topic added successfully');
        }
        setIsTopicModalOpen(false);
        setEditingTopic(null);
        resetTopic();
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setValue('name', subject.name);
        setValue('description', subject.description);
        setValue('color', subject.color);
        setIsSubjectModalOpen(true);
    };

    const handleEditTopic = (topic) => {
        setEditingTopic(topic);
        setTopicValue('name', topic.name);
        setTopicValue('difficulty', topic.difficulty);
        setTopicValue('status', topic.status);
        setTopicValue('notes', topic.notes);
        setIsTopicModalOpen(true);
    };

    const colors = ['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

    const filteredSubjects = subjects.filter(s => {
        const q = debouncedSearch.toLowerCase();
        return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
    });

    const getFilteredTopics = (subject) => {
        if (!subject.topics) return [];
        const q = debouncedSearch.toLowerCase();
        return subject.topics.filter(t => 
            t.name.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-white tracking-tighter text-glow uppercase">LIBRARY</h3>
                    <div className="h-4 w-px bg-white/10 hidden md:block" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:block leading-none mt-1">Manage Subjects</p>
                </div>
                <div className="flex items-center gap-3">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
                    <button 
                        onClick={() => { setEditingSubject(null); reset(); setIsSubjectModalOpen(true); }}
                        className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredSubjects.map(subject => (
                    <SubjectCard 
                        key={subject.id} 
                        subject={subject} 
                        onEdit={handleEditSubject}
                        onDelete={deleteSubject}
                        onClick={(s) => setSelectedSubjectId(s.id)}
                        compact={true}
                    />
                ))}
                {filteredSubjects.length === 0 && (
                    <div className="col-span-full py-40 glass-card border-dashed border-2 flex flex-col items-center justify-center opacity-30 gap-6 border-white/5 bg-slate-900/50 group hover:border-indigo-500/50 transition-all cursor-pointer">
                         <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden">
                            <Book className="text-slate-500 w-10 h-10 group-hover:text-indigo-500 transition-colors" />
                         </div>
                         <div className="space-y-1 text-center">
                            <p className="font-black text-white uppercase tracking-tighter text-2xl group-hover:text-glow transition-all">No Subjects</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Add a subject to get started.</p>
                         </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedSubject && (
                    <div className="fixed inset-0 md:left-[112px] z-50 flex items-center justify-center p-3 bg-[#050608]/90 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-card w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="md:w-[35%] p-10 bg-slate-900/80 border-r border-white/5 flex flex-col gap-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20" style={{ backgroundColor: selectedSubject.color }}>
                                        <Book className="w-7 h-7" />
                                    </div>
                                    <button onClick={() => setSelectedSubjectId(null)} className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-4xl font-black text-white leading-tight tracking-tighter text-glow truncate">{selectedSubject.name}</h4>
                                    <p className="text-slate-400 font-medium text-base leading-relaxed">{selectedSubject.description || 'No description added yet.'}</p>
                                </div>
                                <div className="mt-auto space-y-3 border-t border-white/5 pt-8">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Subject Metrics</p>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Total topics</span>
                                        <span className="text-indigo-400">{selectedSubject.topics?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-10 flex flex-col gap-8 overflow-y-auto max-h-[92vh] bg-slate-950/40 relative">
                                <div className="flex items-center justify-between border-b border-white/5 pb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                                        <h5 className="text-xl font-black text-white uppercase tracking-tight">Topics</h5>
                                    </div>
                                    <button 
                                        onClick={() => { setEditingTopic(null); resetTopic(); setIsTopicModalOpen(true); }}
                                        className="text-xs font-black bg-indigo-500 text-white px-6 py-3 rounded-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                                    >
                                        + Add Topic
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {getFilteredTopics(selectedSubject).length > 0 ? (
                                        getFilteredTopics(selectedSubject).map(topic => (
                                            <div key={topic.id} className="glass-card p-4 flex items-center justify-between group hover:border-white/20 transition-all border-white/5 bg-slate-900/60 shadow-lg">
                                               <div className="flex items-center gap-4">
                                                  <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${topic.status === 'Completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-slate-700'}`} />
                                                  <div>
                                                     <h6 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{topic.name}</h6>
                                                     <div className="flex gap-4 items-center mt-0.5">
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg border ${topic.difficulty === 'Hard' ? 'bg-red-400/10 text-red-400 border-red-500/20' : topic.difficulty === 'Medium' ? 'bg-amber-400/10 text-amber-400 border-amber-500/20' : 'bg-green-400/10 text-green-400 border-green-500/20'}`}>
                                                            {topic.difficulty}
                                                        </span>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded-lg bg-black/20">{topic.status}</span>
                                                     </div>
                                                  </div>
                                               </div>
                                               <div className="flex gap-2">
                                                  <button onClick={() => handleEditTopic(topic)} className="p-2.5 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                                  <button onClick={() => deleteTopic(selectedSubjectId, topic.id)} className="p-2.5 hover:bg-red-500/10 rounded-2xl text-slate-500 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                               </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-32 flex flex-col items-center justify-center opacity-10 gap-6 border-dashed border-2 border-white/10 rounded-3xl">
                                            <List className="w-16 h-16" />
                                            <p className="font-black text-xs uppercase tracking-widest">No topics added yet.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none select-none">
                                    <Target className="w-64 h-64 -mr-20 -mt-20" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(isSubjectModalOpen) && (
                    <div className="fixed inset-0 md:left-[112px] z-60 flex items-center justify-center p-3 bg-[#050608]/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-xl p-10 space-y-10 border-white/10 bg-slate-900 overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                 <Ghost className="w-48 h-48 -mr-16 -mt-16" />
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter text-glow">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
                                <button onClick={() => setIsSubjectModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmitSubject)} className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Subject Name</label>
                                    <input {...register('name')} placeholder="e.g. Theoretical Physics" className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest transition-all" />
                                    {errors.name && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">Error: {errors.name.message}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Description</label>
                                    <textarea {...register('description')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[140px] resize-none font-medium leading-relaxed" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Color</label>
                                    <div className="flex flex-wrap gap-4">
                                        {colors.map(c => (
                                            <button 
                                                key={c} type="button" 
                                                onClick={() => setValue('color', c)}
                                                className={`w-10 h-10 rounded-2xl transition-all hover:scale-110 active:scale-95 border-2 ${editingSubject?.color === c ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-black/50 overflow-hidden shadow-xl'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full h-16 premium-gradient-primary text-white rounded-2xl text-sm font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 mt-4 leading-none">
                                    Save Subject
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isTopicModalOpen && (
                    <div className="fixed inset-0 md:left-[112px] z-70 flex items-center justify-center p-3 bg-[#050608]/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-xl p-10 space-y-10 border-white/10 bg-slate-900 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter text-glow">{editingTopic ? 'Edit Topic' : 'Add Topic'}</h3>
                                <button onClick={() => setIsTopicModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleSubmitTopic(onSubmitTopic)} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Topic Name</label>
                                    <input {...registerTopic('name')} placeholder="e.g. Quantum Entanglement" className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Difficulty</label>
                                        <select {...registerTopic('difficulty')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest appearance-none">
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Status</label>
                                        <select {...registerTopic('status')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black tracking-widest appearance-none">
                                            <option value="Not Started">Not Started</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Needs Revision">Needs Revision</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-1 italic">Notes</label>
                                    <textarea {...registerTopic('notes')} className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 h-32 resize-none font-medium leading-relaxed shadow-inner" />
                                </div>
                                <button type="submit" className="w-full h-16 premium-gradient-primary text-white rounded-2xl text-sm font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 mt-4 leading-none">
                                    Save Topic
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Subjects;