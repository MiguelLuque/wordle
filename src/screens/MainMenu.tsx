import { LogOut, Swords, Trophy, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGameSubscription from "../hooks/useGameSubscription";
import { supabase } from "../lib/supabase";
import { useGameStore } from "../store/gameStore";

export default function MainMenu() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Estado para el popup
  const [searchError, setSearchError] = useState<string | null>(null);
  const { setAuthenticated, setCurrentGame, setGameMode, authenticated, isGuest } = useGameStore();

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
    if (isGuest) {
      setShowPopup(true); // Mostrar el popup si es invitado
      return;
    }

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
    if (isGuest) {
      navigate('/auth');
      setAuthenticated(false);
      useGameStore.setState({ isGuest: false }); // Resetear el estado guest
    } else {
      await supabase.auth.signOut();
      setAuthenticated(false);
      setCurrentGame(null);
      navigate('/auth');
    }
  };

  const handleCancelSearch = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.rpc('cancel_game_search', {
        user_id: user.user?.id,
      });

      if (error) throw error;

      setIsSearching(false);
      setSearchError(null);
    } catch (error) {
      console.error('Error canceling game search:', error);
      setSearchError('Error al cancelar la búsqueda');
    }
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
            onClick={isSearching ? handleCancelSearch : handleFindMatch}
            disabled={false}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Cancelar búsqueda</span>
              </>
            ) : (
              <>
                <Swords className="w-5 h-5" />
                <span>Multiplayer Battle</span>
              </>
            )}
          </button>

          {searchError && (
            <p className="text-red-500 text-sm text-center">{searchError}</p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Mostrar Logout solo si no es invitado */}
          {authenticated && !isGuest ? (
            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Popup para mostrar mensaje si es invitado */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">Authentication Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              You must be logged in to play multiplayer battles.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
