import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, TrendingUp, Award, Rocket, 
  Activity, BarChart3, BrainCircuit, Shield
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import WeeklyChart from '../components/WeeklyChart';

const Profile = () => {
  const { currentUser } = useAuth();
  const { 
    completionPercentage, weeklyProductivity, studyStreak 
  } = useProgress();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const [newName, setNewName] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  const handleUpdateName = () => {
    if (!newName) return;
    const updatedUser = { ...currentUser, displayName: newName };
    localStorage.setItem('mock_user', JSON.stringify(updatedUser));
    window.location.reload(); // Quickest way to sync context for now
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tighter text-glow uppercase">USER PROFILE</h3>
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[8px]">
                <Shield className="w-2.5 h-2.5 text-indigo-500" />
                <span>SECURE ACCOUNT DATA</span>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Info Card */}
        <motion.div variants={item} className="lg:col-span-4 glass-card p-6 border-white/5 bg-slate-900/40 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full premium-gradient-primary p-1 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                    </div>
                </div>
                <div>
                    {(!currentUser?.displayName || isEditing) ? (
                        <div className="space-y-2">
                             <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter Full Name"
                                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                             />
                             <button 
                                onClick={handleUpdateName}
                                className="w-full py-2 bg-indigo-500 text-[8px] font-black uppercase tracking-widest text-white rounded-lg"
                             >
                                Update Name
                             </button>
                        </div>
                    ) : (
                        <>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{currentUser.displayName}</h4>
                            <button onClick={() => setIsEditing(true)} className="text-[7px] font-black text-slate-500 uppercase mt-2 hover:text-white transition-colors">Edit Name</button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <User className="w-4 h-4 text-indigo-400" />
                    <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Full Name</p>
                        <p className="text-xs font-bold text-white truncate">{currentUser?.displayName || 'Not Set'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Email Address</p>
                        <p className="text-xs font-bold text-white truncate">{currentUser?.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Account Created</p>
                        <p className="text-xs font-bold text-white">April 2026</p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Stats and Graphs */}
        <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={item} className="glass-card p-6 border-white/5 bg-slate-900/60 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Study Mastery</p>
                            <h4 className="text-3xl font-black text-white tracking-tighter">{completionPercentage}%</h4>
                        </div>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} className="h-full premium-gradient-primary" />
                    </div>
                </motion.div>

                <motion.div variants={item} className="glass-card p-6 border-white/5 bg-slate-900/60 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Streak</p>
                            <h4 className="text-3xl font-black text-white tracking-tighter">{studyStreak} Days</h4>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Award className="w-20 h-20 -mr-6 -mt-6" />
                    </div>
                </motion.div>
            </div>

            <motion.div variants={item} className="glass-card p-8 border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Task Velocity & Study Completion</h4>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tasks created vs. completed over the last 7 days</p>
                    </div>
                </div>
                <WeeklyChart data={weeklyProductivity} height={200} />
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
