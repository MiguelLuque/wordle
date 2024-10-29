import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Users, Trophy, LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

export default function MainMenu() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const setAuthenticated = useGameStore((state) => state.setAuthenticated);
  const setCurrentGame = useGameStore((state) => state.setCurrentGame);

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      // Simulate finding a match (replace with actual Supabase implementation)
      const gameId = `game_${Date.now()}`;
      setTimeout(() => {
        setCurrentGame(gameId);
        navigate(`/game/${gameId}`);
      }, 2000);
    } catch (error) {
      console.error('Error finding match:', error);
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setCurrentGame(null);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Wordle Battle</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleFindMatch}
            disabled={isSearching}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Finding Match...</span>
              </>
            ) : (
              <>
                <Swords className="w-5 h-5" />
                <span>Find Match</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          <span>Players Online: 42</span>
        </div>
      </div>
    </div>
  );
}