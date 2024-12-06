import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSinglePlayerLogic } from '../hooks/useSinglePlayerLogic';
import { useAutoRedirect } from '../hooks/useAutoRedirect';
import { useGameStore } from '../store/gameStore';
import { OpponentProgress } from '../components/game/OpponentProgress';
import { GameBoard } from '../components/game/GameBoard';
import { VirtualKeyboard } from '../components/game/VirtualKeyboard';
import { styles } from '../styles/theme';

export default function GameScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { currentGame, setCurrentGame, setGameMode } = useGameStore();

  /*   const multiplayerGame = useGameLogic(gameId);
    const singlePlayerGame = useSinglePlayerLogic(
      gameId === 'single' ? currentGame as string : ''
    ); */

  const game = gameId === 'single' ? useSinglePlayerLogic(
    gameId === 'single' ? currentGame as string : ''
  ) : useGameLogic(gameId);

  const handleBackToMenu = () => {
    setCurrentGame(null);
    setGameMode('multi');
    navigate('/menu');
  };

  // Solo configurar redirección automática para juego individual
  useAutoRedirect({
    condition: gameId === 'single' && game.gameStatus !== 'playing',
    delay: 3000,
    path: '/menu',
    onRedirect: () => {
      setCurrentGame(null);
      setGameMode('multi');
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
      }
      game.handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.currentAttempt, game.gameStatus]);

  if (!game.secretWord) {
    return (
      <div className={styles.layout.page}>
        <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] ${styles.layout.page}`}>
      <header className={styles.layout.header}>
        <button
          onClick={() => navigate('/menu')}
          className={styles.button.variants.icon}
        >
          <ArrowLeft className={styles.icon.variants.primary} />
        </button>
        <h1 className={styles.text.heading.h3}>
          {gameId === 'single' ? 'Wordle' : 'Wordle Battle'}
        </h1>
        <div className="w-6"></div>
      </header>

      {/* Modal para juego multijugador */}
      {gameId !== 'single' && game.gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${styles.card.variants.primary} max-w-md w-full mx-4`}>
            <div className="p-6 flex flex-col items-center gap-4">
              <h2 className={`${styles.text.heading.h2} text-center ${game.gameStatus === 'won' ? 'text-green-600' : 'text-red-600'
                }`}>
                {game.gameStatus === 'won' ? '¡Victoria!' : '¡Derrota!'}
              </h2>
              <p className={`${styles.text.body.base} text-center`}>
                La palabra era: <span className="font-bold">{game.secretWord}</span>
              </p>
              <button
                onClick={handleBackToMenu}
                className={`${styles.button.variants.primary} ${styles.button.sizes.lg} w-full mt-4`}
              >
                Volver al Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner para juego individual */}
      {gameId === 'single' && game.gameStatus !== 'playing' && (
        <div
          className={`p-2 text-center text-white font-bold shadow-lg ${game.gameStatus === 'won'
            ? 'bg-green-600'
            : 'bg-red-600'
            }`}
        >
          <div className="flex flex-col items-center">
            <div className="text-lg">
              {game.gameStatus === 'won'
                ? '¡Ganaste!'
                : `¡Perdiste! La palabra era ${game.secretWord}`}
            </div>
            <div className="text-sm mt-1 opacity-90">
              Volviendo al menú en 3 segundos...
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 gap-4 ${styles.card.variants.game}`}>
        {gameId !== 'single' && (
          <OpponentProgress
            rivalAttempts={game.rivalAttempts}
            rivalGuessResults={game.rivalGuessResults}
          />
        )}
        <GameBoard game={game} />
        <VirtualKeyboard
          keyboardState={game.keyboardState}
          onKeyPress={game.handleKeyPress}
          gameStatus={game.gameStatus}
        />
      </div>
    </div>
  );
} 