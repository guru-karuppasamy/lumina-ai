
import React, { useState, useEffect } from 'react';
import { UserProfile, OnboardingQuestion } from '../types';
import { Lightbulb, ChevronLeft, Check } from 'lucide-react';

interface OnboardingProps {
  email: string;
  initialName: string;
  onComplete: (profile: UserProfile) => void;
}

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

export const Onboarding: React.FC<OnboardingProps> = ({ email, initialName, onComplete }) => {
  const [step, setStep] = useState(initialName ? 1 : 0); 
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: initialName,
    email: email,
    responses: {}
  });

  useEffect(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      setQuestions(JSON.parse(saved));
    } else {
      setQuestions(DEFAULT_QUESTIONS);
    }
  }, []);

  const handleNext = (value?: string) => {
    if (step === 0) {
      if (!formData.name) return;
      setStep(1);
    } else {
      const currentQ = questions[step - 1];
      const updatedResponses = { ...(formData.responses || {}), [currentQ.id]: value };
      
      const updatedData = { 
        ...formData, 
        [currentQ.id]: value, 
        responses: updatedResponses 
      };
      
      setFormData(updatedData);
      
      if (step < questions.length) {
        setStep(step + 1);
      } else {
        onComplete({
          ...updatedData,
          isOnboarded: true,
          history: []
        } as UserProfile);
      }
    }
  };

  if (questions.length === 0 && step > 0) return null;

  const progress = (step / (questions.length + 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <div className="max-w-xl w-full glass-effect dark:bg-slate-900/90 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800">
        <div className="h-2 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="p-10 md:p-14">
          {step === 0 ? (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex p-5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 mb-6">
                  <Lightbulb size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Welcome to LUMINA</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">Let's build your personalized tutor profile.</p>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">What should we call you?</label>
                <input 
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full px-8 py-5 text-2xl font-bold border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-3xl focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 outline-none transition-all dark:text-white"
                  placeholder="Your Name"
                />
                <button 
                  onClick={() => handleNext()}
                  disabled={!formData.name}
                  className="w-full mt-4 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-3xl transition-all disabled:opacity-50 shadow-2xl shadow-indigo-100 dark:shadow-none active:scale-95"
                >
                  Start Journey
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Step {step} of {questions.length}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-[1.15] tracking-tight">
                {questions[step - 1].title}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {questions[step - 1].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleNext(option.value)}
                    className="group relative p-6 text-left border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-3xl transition-all duration-300"
                  >
                    <span className="font-bold text-lg text-slate-700 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-white transition-colors">{option.label}</span>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                          <Check size={18} className="text-white" strokeWidth={3} />
                       </div>
                    </div>
                  </button>
                ))}
              </div>
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
