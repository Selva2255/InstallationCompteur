import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import InstallationForm from './components/InstallationForm';
import { User } from './types';
import { storage } from './utils/storage';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user should be remembered
    if (storage.getRememberMe()) {
      const savedUser = storage.getCurrentUser();
      if (savedUser) {
        setCurrentUser(savedUser);
        setIsAuthenticated(true);
        setShowWelcome(false);
      }
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleLogin = (user: User, rememberMe: boolean) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    storage.setCurrentUser(user);
    storage.setRememberMe(rememberMe);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    storage.setCurrentUser(null);
    storage.setRememberMe(false);
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="py-8">
        <InstallationForm user={currentUser} />
      </main>
    </div>
  );
}

export default App;