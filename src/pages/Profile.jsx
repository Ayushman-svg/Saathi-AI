import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, TrendingUp, Award, Rocket, 
  Activity, BarChart3, BrainCircuit, Shield, LogOut
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import WeeklyChart from '../components/WeeklyChart';

const Profile = () => {
  const { currentUser, logout } = useAuth();
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
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight  uppercase">USER PROFILE</h3>
            <div className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-wider text-xs">
                <Shield className="w-2.5 h-2.5 text-slate-600" />
                <span>SECURE ACCOUNT DATA</span>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Info Card */}
        <motion.div variants={item} className="lg:col-span-4 glass-card p-6 border-slate-200 bg-white space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white p-1 shadow-2xl">
                    <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center">
                        <User className="w-10 h-10 text-slate-900" />
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
                                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-zinc-400 w-full"
                             />
                             <button 
                                onClick={handleUpdateName}
                                className="w-full py-2 bg-blue-600 text-xs font-bold uppercase tracking-wider text-slate-900 rounded-lg"
                             >
                                Update Name
                             </button>
                        </div>
                    ) : (
                        <>
                            <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{currentUser.displayName}</h4>
                            <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-slate-600 uppercase mt-2 hover:text-slate-900 transition-colors">Edit Name</button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4 p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <User className="w-4 h-4 text-slate-700" />
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.displayName || 'Not Set'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <Mail className="w-4 h-4 text-slate-600" />
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Created</p>
                        <p className="text-sm font-bold text-slate-900">April 2026</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200">
                <button 
                    onClick={logout} 
                    className="w-full flex items-center justify-center gap-3 p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold uppercase tracking-[0.2em] text-sm transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    Sign Out
                </button>
            </div>
        </motion.div>

        {/* Stats and Graphs */}
        <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={item} className="glass-card p-6 border-slate-200 bg-white relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-slate-100/50 rounded-xl border border-slate-300 text-slate-700">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Study Mastery</p>
                            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{completionPercentage}%</h4>
                        </div>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} className="h-full bg-blue-600 text-white" />
                    </div>
                </motion.div>

                <motion.div variants={item} className="glass-card p-6 border-slate-200 bg-white relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Streak</p>
                            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{studyStreak} Days</h4>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 hidden">
                        <Award className="w-20 h-20 -mr-6 -mt-6" />
                    </div>
                </motion.div>
            </div>

            <motion.div variants={item} className="glass-card p-8 border-slate-200 bg-white">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 bg-zinc-500/10 rounded-xl border border-slate-400/20 text-slate-600">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Task Velocity & Study Completion</h4>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Tasks created vs. completed over the last 7 days</p>
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
