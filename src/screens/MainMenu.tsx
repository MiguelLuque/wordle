import { LogOut, Swords, Trophy, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGameSubscription from "../hooks/useGameSubscription";
import { supabase } from "../lib/supabase";
import { useGameStore } from "../store/gameStore";
import { cn } from "../utils/styleUtils";
import { styles } from "../styles/theme";

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
    <div className={styles.layout.page}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b4513]/10 to-[#6b46c1]/10" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-[#8b4513]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-[#6b46c1]/20 rounded-full blur-3xl" />

      <div className={cn(
        styles.card.variants.glass,
        "w-full max-w-md p-8 relative z-10"
      )}>
        <div className="flex justify-center mb-8">
          <div className={cn(
            "p-4 rounded-full",
            styles.effects.glow,
            "bg-gradient-to-br from-[#8b4513] to-[#723a0f]"
          )}>
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className={cn(
          styles.text.heading.h1,
          "text-center mb-8 text-[#2c1810]"
        )}>
          Wordle Battle
        </h1>

        <div className="space-y-3">
          <button
            onClick={handleSinglePlayer}
            className={cn(
              styles.button.base,
              styles.button.variants.primary,
              "w-full h-12 flex items-center justify-center gap-3"
            )}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Un Jugador</span>
          </button>

          <button
            onClick={isSearching ? handleCancelSearch : handleFindMatch}
            disabled={false}
            className={cn(
              styles.button.base,
              styles.button.variants.secondary,
              "w-full h-12 flex items-center justify-center gap-3",
              isSearching && "bg-opacity-90"
            )}
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-[#2c1810] border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Cancelar búsqueda</span>
              </>
            ) : (
              <>
                <Swords className="w-5 h-5" />
                <span className="font-medium">Batalla Multijugador</span>
              </>
            )}
          </button>

          {searchError && (
            <p className={cn(
              styles.text.body.small,
              "text-red-500 text-center mt-2"
            )}>
              {searchError}
            </p>
          )}

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#8b4513]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">

            </div>
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              styles.button.base,
              styles.button.variants.secondary,
              "w-full h-12 flex items-center justify-center gap-3"
            )}
          >
            <LogOut className="w-5 h-5 text-[#2c1810]" />
            <span className="font-medium">
              {authenticated && !isGuest ? 'Cerrar Sesión' : 'Iniciar Sesión'}
            </span>
          </button>
        </div>
      </div>

      {/* Popup de autenticación requerida */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={cn(
            styles.card.variants.primary,
            "p-6 max-w-sm mx-4"
          )}>
            <h3 className={styles.text.heading.h3}>
              Autenticación Requerida
            </h3>
            <p className={cn(
              styles.text.body.base,
              "mt-2 mb-4"
            )}>
              Debes iniciar sesión para jugar partidas multijugador.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className={cn(
                styles.button.base,
                styles.button.variants.primary,
                "w-full h-12 flex items-center justify-center"
              )}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
