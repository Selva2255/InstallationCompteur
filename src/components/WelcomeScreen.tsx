import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-amber-600"></div>
      
      <div className="relative z-10 text-center text-white px-8">
        <div className="mb-8 animate-pulse">
          <img 
            src="/logo-prodair.png" 
            alt="Prod'Air Logo" 
            className="w-32 h-32 mx-auto mb-6 drop-shadow-2xl animate-bounce"
          />
        </div>
        
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-wide">
            Prod'Air
          </h1>
          
          <div className="flex items-center justify-center space-x-2 text-amber-300">
            <img 
              src="/hadirate Al anwar.png" 
              alt="Hadirate Al Anwar" 
              className="w-8 h-8"
            />
            <p className="text-xl font-medium">Hadirate Al Anwar</p>
          </div>
          
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-semibold">Installation Compteurs LoRa</span>
            </div>
            <p className="text-sm text-blue-100">Système de gestion professionnel</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;