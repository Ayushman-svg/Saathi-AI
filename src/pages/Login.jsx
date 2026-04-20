import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Successfully logged in!');
      } else {
        await signup(email, password, name);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-slate-100 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-slate-900 shadow-xl shadow-none mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Saathi-AI</h1>
            <p className="text-sm text-slate-700 mt-2 tracking-wider uppercase">Your Ultimate Study Companion</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-slate-600 group-focus-within:text-slate-700 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-zinc-400/50 transition-all"
                    placeholder="Full Name"
                  />
                </div>
              </motion.div>
            )}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-600 group-focus-within:text-slate-700 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-zinc-400/50 transition-all"
                  placeholder="Email Address"
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-slate-700 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-zinc-400/50 transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl text-sm font-bold uppercase tracking-wider text-slate-900 bg-blue-600 text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 focus:ring-offset-slate-900 disabled:hidden0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
