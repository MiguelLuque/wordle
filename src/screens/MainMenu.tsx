import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { Game } from '../models/Game';
import useGameSubscription from '../hooks/useGameSubscription'; // Importar el nuevo hook

export default function MainMenu() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated, currentGame, setAuthenticated, setCurrentGame } = useGameStore();

  useGameSubscription(); // Usar el nuevo hook para suscribirse

  // Efecto para observar cambios en `currentGame`
  useEffect(() => {
    if (currentGame) {
      console.log(`Partida actualizada: ${currentGame}`);
      // Realiza acciones adicionales si necesitas basarte en el valor de `currentGame`
    }
  }, [currentGame]);

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      const { data: pendingGames, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'pending')
        //.neq('created_by', (await supabase.auth.getUser()).data.user?.id)
        .limit(1);

      if (fetchError) throw fetchError;
      let gameId;

      if (pendingGames && pendingGames.length > 0) {
        const existingGame = pendingGames[0] as unknown as Game;
        gameId = existingGame.id;

        setCurrentGame(gameId);
        //await supabase.from('gameplayers').insert([{ game_id: gameId, user_id: (await supabase.auth.getUser()).data.user?.id }]);
        await supabase.from('games').update({ status: 'in_progress' }).eq('id', gameId);

      } else {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data: gameData, error: createError } = await supabase
          .from('games')
          .insert([{ status: 'pending', created_by: userId }])
          .select();

        if (createError) throw createError;

        const newGame = gameData[0] as unknown as Game;
        gameId = newGame.id;
        setCurrentGame(gameId); // Actualizar el estado de `currentGame`
        console.log(`Juego creado con ID: ${gameId}`);
      }

      console.log('Suscritos');
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
