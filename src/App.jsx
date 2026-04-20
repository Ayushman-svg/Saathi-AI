import React, { useState, useEffect } from 'react';
console.log("STUDY AI APP LOADED - VERSION 2.0 MAX MINIMIZED");
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, CheckSquare, Calendar, Brain, User,
  Bell, Activity, Cpu, Layers, Menu, X, LogOut
} from 'lucide-react';
import { useStudy } from './context/StudyContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Context
import { StudyProvider } from './context/StudyContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import Revision from './pages/Revision';
import AITools from './pages/AITools';
import Profile from './pages/Profile';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const Navigation = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/revision', label: 'Revision', icon: Calendar },
    { to: '/ai-tools', label: 'AI Tools', icon: Brain }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <nav className={`fixed md:sticky top-0 left-0 z-50 w-[112px] border-r border-white/5 h-screen flex flex-col p-3 bg-slate-950/95 md:bg-slate-950/40 backdrop-blur-xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col items-center gap-1 mb-8 relative z-10 pt-4 group cursor-pointer">
        <div className="w-12 h-12 premium-gradient-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
          <Brain className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div className="mt-2 text-center">
            <h1 className="text-[10px] font-black text-white tracking-tighter uppercase leading-none">Saathi</h1>
            <p className="text-[6px] font-black text-indigo-400 tracking-[0.2em] uppercase leading-none mt-1">AI OPS</p>
        </div>
      </div>
      
      <div className="space-y-2 grow relative z-10 overflow-y-auto flex flex-col items-center">
        {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={label}
              className={({ isActive }) => `w-full flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all duration-500 relative group/link ${isActive ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-500 group-hover/link:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span className="text-[7px] font-black uppercase tracking-widest text-center leading-none">{label}</span>
                </>
              )}
            </NavLink>
        ))}
      </div>
    </nav>
    </>
  );
};

const Header = () => {
  const { currentUser } = useAuth();
  return (
    <header className="px-4 py-1.5 border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
      <div className="flex items-center gap-3">
          {/* Status badge removed per user request */}
      </div>
      <div className="flex items-center gap-3">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group">
             <div className="hidden sm:block text-right">
                <div className="text-xs font-black text-white leading-none uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</div>
             </div>
             <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <User className="w-4 h-4" />
             </div>
          </Link>
      </div>
    </header>
  );
};

const ProtectedLayout = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  
  return (
    <>
      <button 
        onClick={() => setSidebarOpen(true)}
        className="fixed top-6 left-6 z-30 p-3 bg-slate-900/90 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all md:hidden backdrop-blur-sm shadow-2xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Navigation 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0b10]">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-5 relative z-10 scrollbar-thin">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-0 right-0 p-20 opacity-5 pointer-events-none select-none z-0 overflow-hidden">
         <Layers className="w-[1000px] h-[1000px] rotate-12 blur-3xl text-indigo-500" />
      </div>
    </>
  );
};


const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ToastContainer 
        position="bottom-right" 
        theme="dark" 
        toastClassName="!glass-card !border-white/10 !bg-slate-900/90 !backdrop-blur-xl !text-white font-black uppercase text-[8px] tracking-widest shadow-2xl"
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={
          <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0b10] flex flex-col md:flex-row relative overflow-hidden">
              <ProtectedLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/profile" element={<Profile />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <StudyProvider>
          <AppContent />
        </StudyProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;