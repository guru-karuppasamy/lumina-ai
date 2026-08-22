
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfile } from './types';

const STORAGE_KEY = 'lumina_users_v1';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');

  // Handle successful Authentication (Login or Initial Signup)
  const handleAuth = (authEmail: string) => {
    setEmail(authEmail);
    setIsLoggedIn(true);

    if (authEmail === 'admin@lumina.ai') {
      setIsAdmin(true);
      return;
    }

    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userInDb = db[authEmail];
    
    // Only set as currentUser if they've completed the onboarding profile
    if (userInDb && userInDb.isOnboarded) {
      setCurrentUser(userInDb);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const credentials = db[profile.email];
    
    const fullUserData = {
      ...credentials,
      ...profile,
      isOnboarded: true,
      history: credentials?.history || [],
    };
    
    db[profile.email] = fullUserData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    
    setCurrentUser(fullUserData);
  };

  const handleResetOnboarding = () => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (db[email]) {
      db[email].isOnboarded = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
    setCurrentUser(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setEmail('');
  };

  if (!isLoggedIn) {
    return <Auth onAuth={handleAuth} />;
  }

  // Admin bypasses onboarding entirely
  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // If logged in but no profile data found, they need to onboard
  if (!currentUser) {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const user = db[email];
    return <Onboarding email={email} initialName={user?.name || ''} onComplete={handleOnboardingComplete} />;
  }

  return <ChatInterface user={currentUser} onResetOnboarding={handleResetOnboarding} onLogout={handleLogout} />;
};

export default App;
