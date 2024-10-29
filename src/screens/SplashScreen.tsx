import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function SplashScreen() {
  const navigate = useNavigate();
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/menu' : '/auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center">
      <div className="animate-bounce mb-8">
        <Swords className="w-24 h-24 text-white" />
      </div>
      <h1 className="text-5xl font-bold text-white mb-4">Wordle Battle</h1>
      <p className="text-white text-xl opacity-75">Get ready to compete!</p>
      <div className="mt-8">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    </div>
  );
}