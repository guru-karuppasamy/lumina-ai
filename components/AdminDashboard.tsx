
import React, { useState, useEffect } from 'react';
import { UserProfile, OnboardingQuestion } from '../types';
import { Users, MessageSquare, Database, LogOut, Search, User as UserIcon, ArrowLeft, Settings, Plus, Trash2, Save, ListChecks, Lightbulb } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const STORAGE_KEY = 'lumina_users_v1';
const CONFIG_KEY = 'lumina_config_v1';

const DEFAULT_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'learningHelper',
    title: 'When learning something new, what helps you most?',
    options: [
      { label: 'A story or real-life example', value: 'story' },
      { label: 'Step-by-step explanation', value: 'steps' },
      { label: 'Formula or rules first', value: 'formula' },
      { label: 'Diagram or visual', value: 'diagram' }
    ]
  },
  {
    id: 'notUnderstandPreference',
    title: 'If you don’t understand a topic, what do you prefer?',
    options: [
      { label: 'Someone explains it in another way', value: 'explanation' },
      { label: 'More examples', value: 'examples' },
      { label: 'Practice problems', value: 'practice' },
      { label: 'Short summary', value: 'summary' }
    ]
  },
  {
    id: 'frustrations',
    title: 'Which frustrates you the most while studying?',
    options: [
      { label: 'Long explanations', value: 'long' },
      { label: 'Jumping directly to answers', value: 'direct' },
      { label: 'Too many formulas', value: 'formulas' },
      { label: 'No clear structure', value: 'structure' }
    ]
  },
  {
    id: 'exampleTheme',
    title: 'Which type of examples feel most natural to you?',
    options: [
      { label: 'Nature / environment', value: 'Nature' },
      { label: 'Technology / apps', value: 'Tech' },
      { label: 'Sports / games', value: 'Sports' },
      { label: 'Daily life', value: 'Daily Life' }
    ]
  },
  {
    id: 'interestType',
    title: 'Pick one you enjoy more:',
    options: [
      { label: 'Watching how things grow or flow', value: 'growth' },
      { label: 'Understanding how systems work', value: 'systems' },
      { label: 'Competing or improving performance', value: 'performance' },
      { label: 'Solving everyday problems', value: 'everyday' }
    ]
  },
  {
    id: 'explanationDepth',
    title: 'How do you prefer explanations?',
    options: [
      { label: 'Very simple first, then details', value: 'simple' },
      { label: 'Medium detail is enough', value: 'medium' },
      { label: 'Deep explanation from the start', value: 'deep' },
      { label: 'Only key points', value: 'key points' }
    ]
  },
  {
    id: 'stuckStrategy',
    title: 'If you get stuck, what should the system do?',
    options: [
      { label: 'Give a hint', value: 'hint' },
      { label: 'Give another analogy', value: 'analogy' },
      { label: 'Show part of the solution', value: 'partial' },
      { label: 'Show full answer', value: 'full' }
    ]
  },
  {
    id: 'confidence',
    title: 'How confident are you with this subject?',
    options: [
      { label: 'Beginner', value: 'beginner' },
      { label: 'Some idea', value: 'some' },
      { label: 'Confident', value: 'confident' },
      { label: 'Expert', value: 'expert' }
    ]
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'onboarding'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      setQuestions(JSON.parse(saved));
    } else {
      setQuestions(DEFAULT_QUESTIONS);
      localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_QUESTIONS));
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(questions));
    alert('Onboarding configuration saved successfully!');
  };

  const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const users: UserProfile[] = Object.values(db);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    onboarded: users.filter(u => u.isOnboarded).length,
    totalMessages: users.reduce((acc, u) => acc + (u.history?.length || 0), 0)
  };

  const updateQuestion = (id: string, field: keyof OnboardingQuestion, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const addQuestion = () => {
    const newQ: OnboardingQuestion = {
      id: `q_${Date.now()}`,
      title: 'New Question Title',
      options: [{ label: 'Option 1', value: 'val1' }]
    };
    setQuestions([...questions, newQ]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 font-bold transition-colors uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} />
            Back to Registry
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.5rem] flex items-center justify-center font-black text-3xl mb-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  {selectedUser.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{selectedUser.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{selectedUser.email}</p>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedUser.isOnboarded ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                    {selectedUser.isOnboarded ? 'Onboarded' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[650px] overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Session Dialogue</h3>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400 px-4 py-2 rounded-xl">
                    {selectedUser.history?.length || 0} MESSAGES
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 dark:bg-slate-950/30">
                  {selectedUser.history?.length ? (
                    selectedUser.history.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] p-5 rounded-2xl text-[14px] leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none shadow-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 mt-2 px-1 uppercase tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 italic gap-4">
                      <MessageSquare size={48} strokeWidth={1} />
                      <p className="font-bold uppercase tracking-widest text-xs">Awaiting first inquiry...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-10 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <Lightbulb size={20} />
            </div>
            <h1 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white uppercase">Control</h1>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users size={14} />
              Registry
            </button>
            <button 
              onClick={() => setActiveTab('onboarding')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'onboarding' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Settings size={14} />
              Config
            </button>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-950/20 px-6 py-3 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </nav>

      <main className="p-10 max-w-7xl mx-auto">
        {activeTab === 'users' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6">
                <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-3xl"><Users size={28} /></div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6">
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-3xl"><ListChecks size={28} /></div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Onboarded</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.onboarded}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-6">
                <div className="p-5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-3xl"><MessageSquare size={28} /></div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inquiries</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalMessages}</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="font-black text-slate-800 dark:text-white text-xl tracking-tight uppercase">User Registry</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Filter by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-indigo-400 dark:focus:border-indigo-500 outline-none text-sm w-full md:w-80 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/30 dark:bg-slate-950/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5">Learner Profile</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Interaction Volume</th>
                      <th className="px-8 py-5 text-right">Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-base shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                              {user.name?.charAt(0) || <Lightbulb size={20} />}
                            </div>
                            <div>
                              <div className="font-black text-slate-800 dark:text-white text-base tracking-tight">{user.name || 'Anonymous Learner'}</div>
                              <div className="text-xs font-bold text-slate-400 dark:text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${user.isOnboarded ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                            {user.isOnboarded ? 'READY' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-400">
                            <MessageSquare size={16} className="text-slate-300 dark:text-slate-700" />
                            {user.history?.length || 0}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 py-3 px-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            Inspect History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Inquiry Configuration</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Refine the foundational questions used to build learner archetypes.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <Plus size={16} /> Add Inquiry
                </button>
                <button 
                  onClick={saveConfig}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-none active:scale-95"
                >
                  <Save size={16} /> Deploy Config
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-50/50 dark:hover:shadow-none">
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-20 group-hover:opacity-100 transition-all" />
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1 mr-8">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 block">Inquiry Phase {idx + 1}</label>
                      <input 
                        type="text" 
                        value={q.title}
                        onChange={(e) => updateQuestion(q.id, 'title', e.target.value)}
                        className="w-full text-2xl font-black text-slate-800 dark:text-white bg-transparent border-b-2 border-slate-50 dark:border-slate-800 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none pb-3 transition-all placeholder:text-slate-200"
                      />
                    </div>
                    <button 
                      onClick={() => deleteQuestion(q.id)}
                      className="p-3 text-slate-200 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Archetype Responses</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group/opt hover:border-indigo-200 transition-colors">
                          <input 
                            type="text" 
                            value={opt.label}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[optIdx].label = e.target.value;
                              updateQuestion(q.id, 'options', newOpts);
                            }}
                            className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none w-full placeholder:text-slate-300"
                            placeholder="Option Label"
                          />
                          <button 
                            onClick={() => {
                              const newOpts = q.options.filter((_, i) => i !== optIdx);
                              updateQuestion(q.id, 'options', newOpts);
                            }}
                            className="p-2 text-slate-200 dark:text-slate-700 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newOpts = [...q.options, { label: 'New Option', value: `val_${Date.now()}` }];
                          updateQuestion(q.id, 'options', newOpts);
                        }}
                        className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all"
                      >
                        <Plus size={16} /> Add Path
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
