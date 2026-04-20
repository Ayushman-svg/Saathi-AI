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
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight  uppercase">LIBRARY</h3>
                    <div className="h-4 w-px bg-slate-200 hidden md:block" />
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider hidden md:block leading-none mt-1">Manage Subjects</p>
                </div>
                <div className="flex items-center gap-3">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search..." />
                    <button 
                        onClick={() => { setEditingSubject(null); reset(); setIsSubjectModalOpen(true); }}
                        className="px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-slate-200 transition-all shadow-xl flex items-center gap-2 whitespace-nowrap"
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
                    <div className="col-span-full py-40 glass-card border-dashed border-2 flex flex-col items-center justify-center opacity-30 gap-6 border-slate-200 bg-slate-1000 group hover:border-slate-400 transition-all cursor-pointer">
                         <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-700 flex items-center justify-center relative overflow-hidden">
                            <Book className="text-slate-600 w-10 h-10 group-hover:text-slate-600 transition-colors" />
                         </div>
                         <div className="space-y-1 text-center">
                            <p className="font-bold text-slate-900 uppercase tracking-tight text-2xl group-hover: transition-all">No Subjects</p>
                            <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Add a subject to get started.</p>
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
                            className="glass-card w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative border-slate-300 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="md:w-[35%] p-10 bg-white/80 border-r border-slate-200 flex flex-col gap-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-slate-900 shadow-2xl shadow-none" style={{ backgroundColor: selectedSubject.color }}>
                                        <Book className="w-7 h-7" />
                                    </div>
                                    <button onClick={() => setSelectedSubjectId(null)} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-all"><X className="w-6 h-6" /></button>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight  truncate">{selectedSubject.name}</h4>
                                    <p className="text-slate-700 font-medium text-base leading-relaxed">{selectedSubject.description || 'No description added yet.'}</p>
                                </div>
                                <div className="mt-auto space-y-3 border-t border-slate-200 pt-8">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Subject Metrics</p>
                                    <div className="flex items-center justify-between text-sm font-bold text-slate-700 uppercase tracking-wider">
                                        <span>Total topics</span>
                                        <span className="text-slate-700">{selectedSubject.topics?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-10 flex flex-col gap-8 overflow-y-auto max-h-[92vh] bg-slate-50 relative">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <BrainCircuit className="w-6 h-6 text-slate-600" />
                                        <h5 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Topics</h5>
                                    </div>
                                    <button 
                                        onClick={() => { setEditingTopic(null); resetTopic(); setIsTopicModalOpen(true); }}
                                        className="text-sm font-bold bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-zinc-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-none"
                                    >
                                        + Add Topic
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {getFilteredTopics(selectedSubject).length > 0 ? (
                                        getFilteredTopics(selectedSubject).map(topic => (
                                            <div key={topic.id} className="glass-card p-4 flex items-center justify-between group hover:border-white/20 transition-all border-slate-200 bg-white shadow-lg">
                                               <div className="flex items-center gap-4">
                                                  <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${topic.status === 'Completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-slate-200'}`} />
                                                  <div>
                                                     <h6 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors uppercase tracking-tight">{topic.name}</h6>
                                                     <div className="flex gap-4 items-center mt-0.5">
                                                        <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg border ${topic.difficulty === 'Hard' ? 'bg-red-400/10 text-red-400 border-red-500/20' : topic.difficulty === 'Medium' ? 'bg-amber-400/10 text-amber-400 border-amber-500/20' : 'bg-green-400/10 text-green-400 border-green-500/20'}`}>
                                                            {topic.difficulty}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider border border-slate-200 px-1.5 py-0.5 rounded-lg bg-black/20">{topic.status}</span>
                                                     </div>
                                                  </div>
                                               </div>
                                               <div className="flex gap-2">
                                                  <button onClick={() => handleEditTopic(topic)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                  <button onClick={() => deleteTopic(selectedSubjectId, topic.id)} className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                               </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-32 flex flex-col items-center justify-center opacity-10 gap-6 border-dashed border-2 border-slate-300 rounded-2xl">
                                            <List className="w-16 h-16" />
                                            <p className="font-bold text-sm uppercase tracking-wider">No topics added yet.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-0 right-0 p-20 hidden pointer-events-none select-none">
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
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-xl p-10 space-y-10 border-slate-300 bg-white overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                            <div className="absolute top-0 right-0 p-4 hidden">
                                 <Ghost className="w-48 h-48 -mr-16 -mt-16" />
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight ">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h3>
                                <button onClick={() => setIsSubjectModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmitSubject)} className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Subject Name</label>
                                    <input {...register('name')} placeholder="e.g. Theoretical Physics" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-zinc-400/50 uppercase font-bold tracking-wider transition-all" />
                                    {errors.name && <p className="text-red-400 text-sm font-bold uppercase tracking-wider mt-2 ml-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">Error: {errors.name.message}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Description</label>
                                    <textarea {...register('description')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-zinc-400/50 min-h-[140px] resize-none font-medium leading-relaxed" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Color</label>
                                    <div className="flex flex-wrap gap-4">
                                        {colors.map(c => (
                                            <button 
                                                key={c} type="button" 
                                                onClick={() => setValue('color', c)}
                                                className={`w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-95 border-2 ${editingSubject?.color === c ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-black/50 overflow-hidden shadow-xl'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full h-16 bg-blue-600 text-white text-slate-900 rounded-xl text-sm font-bold tracking-wider uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-none mt-4 leading-none">
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
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-xl p-10 space-y-10 border-slate-300 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight ">{editingTopic ? 'Edit Topic' : 'Add Topic'}</h3>
                                <button onClick={() => setIsTopicModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleSubmitTopic(onSubmitTopic)} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Topic Name</label>
                                    <input {...registerTopic('name')} placeholder="e.g. Quantum Entanglement" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-zinc-400/50 uppercase font-bold tracking-wider transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Difficulty</label>
                                        <select {...registerTopic('difficulty')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-zinc-400/50 uppercase font-bold tracking-wider appearance-none">
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Status</label>
                                        <select {...registerTopic('status')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-zinc-400/50 uppercase font-bold tracking-wider appearance-none">
                                            <option value="Not Started">Not Started</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Needs Revision">Needs Revision</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold uppercase text-slate-600 tracking-[0.2em] px-1 italic">Notes</label>
                                    <textarea {...registerTopic('notes')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-zinc-400/50 h-32 resize-none font-medium leading-relaxed shadow-inner" />
                                </div>
                                <button type="submit" className="w-full h-16 bg-blue-600 text-white text-slate-900 rounded-xl text-sm font-bold tracking-wider uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-none mt-4 leading-none">
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