
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Lock, Lightbulb, Sun, Moon } from 'lucide-react';

interface AuthProps {
  onAuth: (email: string) => void;
}

const STORAGE_KEY = 'lumina_users_v1';
const ADMIN_PASSWORD = 'LUMINA_ADMIN_2025';
const THEME_KEY = 'lumina_theme_v1';

const RobotLogo = () => (
  <div className="robot-logo-wrapper select-none">
    <span className="text-5xl font-black font-tech metallic-text">LUM</span>
    <div className="relative mx-1 animate-float">
      <svg 
        width="32" 
        height="50" 
        viewBox="0 0 32 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="robot-icon-svg"
      >
        {/* Robot Head */}
        <rect x="8" y="2" width="16" height="12" rx="2" fill="#22D3EE" />
        <rect x="10" y="5" width="4" height="3" rx="1" fill="white" />
        <rect x="18" y="5" width="4" height="3" rx="1" fill="white" />
        {/* Antennas */}
        <rect x="10" y="0" width="2" height="4" fill="#22D3EE" />
        <rect x="20" y="0" width="2" height="4" fill="#22D3EE" />
        {/* Neck */}
        <rect x="13" y="14" width="6" height="2" fill="#22D3EE" />
        {/* Body */}
        <rect x="6" y="16" width="20" height="22" rx="1" fill="#22D3EE" />
        {/* Body Details */}
        <rect x="10" y="20" width="12" height="2" fill="white" opacity="0.3" />
        <rect x="10" y="24" width="12" height="8" rx="1" fill="white" opacity="0.1" />
        {/* Arms */}
        <rect x="2" y="18" width="4" height="14" rx="1" fill="#22D3EE" />
        <rect x="26" y="18" width="4" height="14" rx="1" fill="#22D3EE" />
        {/* Stand / Legs */}
        <rect x="12" y="38" width="8" height="6" fill="#22D3EE" />
        <rect x="8" y="44" width="16" height="4" rx="1" fill="#22D3EE" />
      </svg>
    </div>
    <span className="text-5xl font-black font-tech metallic-text">NA</span>
  </div>
);

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (adminKey === ADMIN_PASSWORD) {
        onAuth('admin@lumina.ai');
      } else {
        setError('Invalid Admin Key.');
      }
      return;
    }

    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (isLogin) {
      const user = db[email];
      if (!user) {
        setError('No account found.');
        return;
      }
      if (user.password !== password) {
        setError('Incorrect password.');
        return;
      }
      onAuth(email);
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (db[email]) {
        setError('Account exists.');
        return;
      }

      db[email] = {
        email,
        password,
        name,
        isOnboarded: false,
        history: []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      onAuth(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative transition-colors duration-500 font-sans">
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-50 bg-white/60 backdrop-blur-lg shadow-md border border-white/20"
      >
        {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
      </button>

      {isAdminMode ? (
        <div className="max-w-[400px] w-full bg-slate-900 dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 rounded-2xl mb-4 text-white">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase font-tech">Admin Login</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="password" 
              autoFocus
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-white outline-none font-tech"
              placeholder="Enter admin key..."
            />
            <button type="submit" className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all font-tech text-xs tracking-widest">
              VERIFY
            </button>
          </form>
          <button onClick={() => setIsAdminMode(false)} className="w-full mt-6 text-white/50 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
            Back to User Portal
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-[440px]">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-white border border-indigo-100 dark:bg-[#1d29d4] rounded-xl text-[#1d29d4] dark:text-white mb-6 shadow-xl shadow-indigo-50/50 dark:shadow-none">
              <Lightbulb size={36} />
            </div>
            <RobotLogo />
            <p className="text-slate-400 dark:text-slate-500 mt-4 text-[10px] font-bold uppercase tracking-[0.45em] font-tech text-center w-full">
              Personal Knowledge Engine
            </p>
          </div>

          {/* Form Card with defined stroke/border */}
          <div className="w-full bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 transition-all">
            {error && (
              <div className="mb-4 text-center text-rose-500 text-xs font-bold font-tech uppercase tracking-widest">{error}</div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-black dark:text-white uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-[#f5f7fa] dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1d29d4]/10 border border-slate-100 dark:border-slate-800 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all font-tech text-sm"
                    placeholder="Enter name"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-black dark:text-white uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-[#f5f7fa] dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1d29d4]/10 border border-slate-100 dark:border-slate-800 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all font-tech text-sm"
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black text-black dark:text-white uppercase tracking-widest ml-1">Security Key</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-[#f5f7fa] dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1d29d4]/10 border border-slate-100 dark:border-slate-800 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all font-tech text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1d29d4] hover:bg-[#1a25be] text-white font-bold py-5 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest font-tech btn-glow"
              >
                {isLogin ? 'ENTER SESSION' : 'INITIALIZE'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest hover:text-[#1d29d4] transition-colors"
              >
                {isLogin ? "No account? sign up" : "Existing learner? sign in"}
              </button>
            </div>

            {/* Admin Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setIsAdminMode(true)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest font-tech"
              >
                Administrative Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
