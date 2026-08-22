
export type LearningStyle = 'story' | 'steps' | 'formula' | 'diagram';
export type PreferenceLevel = 'simple' | 'medium' | 'deep';
export type ConfidenceLevel = 'beginner' | 'some' | 'confident';

export interface OnboardingQuestion {
  id: string;
  title: string;
  options: { label: string; value: string }[];
}

export interface UserProfile {
  name: string;
  email: string;
  learningHelper?: string;
  notUnderstandPreference?: string;
  frustrations?: string;
  exampleTheme?: string;
  interestType?: string;
  explanationDepth?: PreferenceLevel;
  stuckStrategy?: string;
  confidence?: ConfidenceLevel;
  isOnboarded: boolean;
  history: ChatMessage[];
  isAdmin?: boolean;
  responses?: Record<string, string>; // Flexible storage for dynamic questions
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isHint?: boolean;
}
