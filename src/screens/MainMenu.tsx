import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import useGameSubscription from '../hooks/useGameSubscription';

export default function MainMenu() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const { setAuthenticated, setCurrentGame } = useGameStore();

  useGameSubscription();

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      // First check for pending games
      const { data: pendingGames, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'pending')
        .limit(1);

      if (fetchError) throw fetchError;
      let gameId;

      if (pendingGames && pendingGames.length > 0) {
        // Join existing game
        gameId = pendingGames[0].id;
        setCurrentGame(gameId);
        await supabase
          .from('games')
          .update({ status: 'in_progress' })
          .eq('id', gameId);
      } else {
        // Get random word using efficient random selection
        const { data: randomWord, error: wordError } = await supabase.rpc('get_random_word');
        if (wordError) throw wordError;

        if (!randomWord[0]?.word) {
          throw new Error('No words available in the database');
        }

        // Create new game with random word
        const { data: gameData, error: createError } = await supabase
          .from('games')
          .insert([{
            status: 'pending',
            created_by: (await supabase.auth.getUser()).data.user?.id,
            secret_word: randomWord[0].word.toUpperCase()
          }])
          .select();

        if (createError) throw createError;

        gameId = gameData[0].id;
        setCurrentGame(gameId);
      }
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