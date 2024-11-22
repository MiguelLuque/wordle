import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, LogOut, User } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import useGameSubscription from '../hooks/useGameSubscription';

export default function MainMenu() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const { setAuthenticated, setCurrentGame, setGameMode } = useGameStore();

  useGameSubscription();

  const handleSinglePlayer = async () => {
    try {
      const { data: randomWord, error: wordError } = await supabase.rpc('get_random_word');
      if (wordError) throw wordError;

      if (!randomWord[0]?.word) {
        throw new Error('No words available in the database');
      }

      setGameMode('single');
      setCurrentGame(randomWord[0].word.toUpperCase());
      navigate('/game/single');
    } catch (error) {
      console.error('Error starting single player game:', error);
    }
  };

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('join_or_create_game', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const { game_id, status } = data[0];
        setCurrentGame(game_id);

        // Redirige a la pantalla adecuada según el estado
        if (status === 'joined') {
          setGameMode('multi');
          navigate(`/game/${game_id}`);
        }
      }
    } catch (error) {
      console.error('Error finding match:', error);
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
            onClick={handleSinglePlayer}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Single Player</span>
          </button>

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
                <span>Multiplayer Battle</span>
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
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}