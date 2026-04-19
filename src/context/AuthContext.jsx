import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isMock } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      // Mock auth for development if no firebase keys
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) setCurrentUser(JSON.parse(mockUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (isMock) {
      const user = { uid: 'mock-123', email };
      localStorage.setItem('mock_user', JSON.stringify(user));
      setCurrentUser(user);
      return { user };
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, name) => {
    if (isMock) {
      const user = { uid: 'mock-123', email, displayName: name };
      localStorage.setItem('mock_user', JSON.stringify(user));
      setCurrentUser(user);
      return { user };
    }
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      setCurrentUser({ ...res.user, displayName: name });
    }
    return res;
  };

  const logout = async () => {
    if (isMock) {
      localStorage.removeItem('mock_user');
      setCurrentUser(null);
      return;
    }
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-[#0a0b10] flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse rounded-full" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white font-black uppercase tracking-[0.3em] text-xs">Initializing</h2>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
