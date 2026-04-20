import React, { useState, useEffect, useRef } from 'react';
import { 
  BrowserRouter as Router, Routes, Route, Navigate, 
  NavLink, useLocation, Outlet, useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, CheckSquare, Calendar, Brain, User,
  Menu, X, LogOut, ChevronDown, Activity, Settings
} from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

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

// --- AUTH GUARD ---
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-white text-blue-600 font-bold uppercase tracking-widest animate-pulse">Initializing...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ isOpen, onClose }) => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/revision', label: 'Revision', icon: Calendar },
    { to: '/ai-tools', label: 'Study Assistant', icon: Brain }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <nav className={`fixed md:sticky top-0 left-0 z-50 w-[160px] border-r border-slate-200 h-screen flex flex-col p-4 bg-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col items-center gap-1 mb-10 pt-4 group cursor-pointer">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div className="mt-3 text-center">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight uppercase leading-none">Saathi</h1>
            <p className="text-[9px] font-bold text-slate-400 tracking-[0.1em] uppercase leading-none mt-1.5">Academic Intelligence</p>
          </div>
        </div>
        
        <div className="space-y-1 grow flex flex-col items-center overflow-y-auto no-scrollbar">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `w-full flex flex-col items-center gap-2 py-4 rounded-xl transition-all duration-200 relative group ${isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.div layoutId="navMarker" className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wide text-center leading-none px-2 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 relative z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600"><Menu className="w-6 h-6" /></button>
          
          <div className="hidden md:block">
             <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Operational</span>
             </div>
          </div>

          <div className="flex items-center gap-6" ref={profileRef}>
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">{currentUser?.displayName || 'Student'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Student Portal</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-sm">
                  {currentUser?.displayName?.[0] || 'S'}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-2"
                  >
                    <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="w-full px-5 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-wider">
                      <User className="w-4 h-4" /> View Profile
                    </button>
                    <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full px-5 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-slate-100 uppercase tracking-wider">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>

      <ToastContainer position="bottom-right" theme="light" />
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <StudyProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="revision" element={<Revision />} />
              <Route path="ai-tools" element={<AITools />} />
              <Route path="profile" element={<Profile />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </StudyProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;