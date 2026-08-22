
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { createSocraticTutor } from '../services/gemini';
import { Send, Sparkles, BookOpen, History, LogOut, ChevronDown, PlayCircle, X, Brain, CheckCircle2, Settings2, Lightbulb, Moon, Sun } from 'lucide-react';

interface ChatInterfaceProps {
  user: UserProfile;
  onResetOnboarding: () => void;
  onLogout: () => void;
}

type ModalView = 'none' | 'concepts' | 'history';
const STORAGE_KEY = 'lumina_users_v1';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onResetOnboarding, onLogout }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(user.history || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('none');
  const [concepts, setConcepts] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync with storage whenever messages change
  useEffect(() => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (db[user.email]) {
      db[user.email].history = messages;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  }, [messages, user.email]);

  useEffect(() => {
    chatRef.current = createSocraticTutor(user);
    const greet = async () => {
      // Only greet if history is empty
      if (messages.length > 0) return;
      
      setIsLoading(true);
      try {
        const result = await chatRef.current.sendMessage({ 
          message: `Session Start. Greet ${user.name} as LUMINA and ask what concept we are exploring today.` 
        });
        setMessages([{
          id: Date.now().toString(),
          role: 'model',
          content: result.text || "Hello! I am LUMINA. What shall we explore?",
          timestamp: Date.now()
        }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    greet();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMsg.content });
      
      let fullText = '';
      const modelId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelId, role: 'model', content: '', timestamp: Date.now() }]);

      for await (const chunk of result) {
        fullText += chunk.text || "";
        setMessages(prev => 
          prev.map(m => m.id === modelId ? { ...m, content: fullText } : m)
        );
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'model',
        content: "LUMINA encountered a connection ripple. Please try your thought again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractConcepts = async () => {
    if (messages.length < 2 || isExtracting) return;
    setIsExtracting(true);
    try {
      const result = await chatRef.current.sendMessage({
        message: `System Action: List the 5 most important academic concepts or keywords we have discussed in this session so far. Provide them as a simple comma-separated list. Do not explain them.`
      });
      const extracted = result.text?.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) || [];
      setConcepts(extracted);
    } catch (err) {
      console.error("Failed to extract concepts", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleOpenModal = (view: ModalView) => {
    setModalView(view);
    if (view === 'concepts') {
      extractConcepts();
    }
  };

  const formatContent = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => (
      <p key={idx} className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300 text-[15px] whitespace-pre-wrap">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-10">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <Lightbulb size={20} />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">LUMINA</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Tutor</div>
            <div className="font-black text-slate-900 dark:text-white text-sm">LUMINA AI</div>
          </div>
        </div>
        
        <div className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => handleOpenModal('concepts')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all"
          >
            <BookOpen size={18} />
            <span>Active Concepts</span>
          </button>
          <button 
            onClick={() => handleOpenModal('history')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all"
          >
            <History size={18} />
            <span>Learning History</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl md:hidden text-indigo-600 dark:text-indigo-400">
              <Lightbulb size={18} />
            </div>
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              <Sparkles size={14} className="text-indigo-500" />
              Your Personal Mentor
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-all border border-slate-100 dark:border-slate-800"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-black text-xs">
                  {user.name.charAt(0)}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 pb-4 border-b border-slate-50 dark:border-slate-800">
                     <div className="font-black text-slate-900 dark:text-white text-lg">{user.name}</div>
                     <div className="text-xs text-slate-400 font-medium truncate">{user.email}</div>
                  </div>
                  <div className="px-2 pt-3 space-y-1">
                    <button 
                      onClick={onResetOnboarding}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <Settings2 size={16} className="text-slate-400" />
                      Modify Learning Profile
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                    >
                      <LogOut size={16} />
                      Exit Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 scroll-smooth pb-32">
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] md:max-w-[80%] rounded-3xl ${
                  msg.role === 'user' 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none p-6 shadow-xl shadow-slate-100 dark:shadow-none' 
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm p-6'
                }`}>
                  <div className="text-[15px] font-medium">
                    {msg.role === 'model' ? (
                      <div>
                         {msg.content ? formatContent(msg.content) : (
                           <div className="flex gap-2 py-2">
                             <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                             <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           </div>
                         )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && !messages[messages.length - 1]?.content && (
               <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">LUMINA is reflecting...</span>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-slate-950 via-white/90 dark:via-slate-950/90 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="relative group flex items-center shadow-2xl shadow-indigo-100 dark:shadow-none rounded-2xl">
              <div className="absolute left-5 text-slate-300 dark:text-slate-600 transition-colors group-focus-within:text-indigo-500">
                <PlayCircle size={22} />
              </div>
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask LUMINA 'Why?'..."
                className="w-full pl-14 pr-16 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-indigo-400 focus:ring-0 outline-none transition-all text-slate-700 dark:text-slate-200 font-medium text-base placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-center mt-4 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Inquiry-driven learning powered by Gemini</p>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {modalView !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setModalView('none')}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  {modalView === 'concepts' ? <Brain size={24} /> : <History size={24} />}
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">
                  {modalView === 'concepts' ? 'Active Concepts' : 'Learning Progress'}
                </h3>
              </div>
              <button 
                onClick={() => setModalView('none')}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 max-h-[60vh] overflow-y-auto">
              {modalView === 'concepts' ? (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Key intellectual pillars discussed in this session:</p>
                  {isExtracting ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 w-full shimmer rounded-2xl" />
                      ))}
                    </div>
                  ) : concepts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {concepts.map((concept, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 group hover:border-indigo-300 transition-all active:scale-[0.98]">
                          <CheckCircle2 size={20} className="text-indigo-500" />
                          <span className="font-bold text-indigo-950 dark:text-indigo-200">{concept}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain size={32} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 font-bold italic tracking-tight">No major concepts identified yet. Keep investigating!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-start gap-6 relative">
                    <div className="w-1 h-full bg-slate-100 dark:bg-slate-800 absolute left-4 top-0" />
                    <div className="relative z-10 space-y-10">
                      <div className="flex gap-5">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-xl shadow-indigo-100 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Session Started</div>
                          <div className="text-base font-bold text-slate-700 dark:text-slate-300">Initial investigation initiated with LUMINA.</div>
                        </div>
                      </div>
                      <div className="flex gap-5">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Current Status</div>
                          <div className="text-base font-bold text-slate-700 dark:text-slate-300">Analyzing patterns and identifying knowledge gaps.</div>
                        </div>
                      </div>
                      <div className="flex gap-5 opacity-40">
                        <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Coming Next</div>
                          <div className="text-base font-bold text-slate-500 dark:text-slate-500 italic">Conceptual mastery verification.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setModalView('none')}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl hover:opacity-90 transition-all shadow-2xl shadow-slate-200 dark:shadow-none active:scale-95"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
