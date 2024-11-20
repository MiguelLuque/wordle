import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSinglePlayerLogic } from '../hooks/useSinglePlayerLogic';
import { useGameStore } from '../store/gameStore';
import { OpponentProgress } from '../components/game/OpponentProgress';
import { GameBoard } from '../components/game/GameBoard';
import { VirtualKeyboard } from '../components/game/VirtualKeyboard';

export default function GameScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { gameMode, currentGame } = useGameStore();

  const multiplayerGame = useGameLogic(gameId);
  const singlePlayerGame = useSinglePlayerLogic(
    gameMode === 'single' ? currentGame as string : ''
  );

  const game = gameMode === 'single' ? singlePlayerGame : multiplayerGame;

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/menu')}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">
          {gameMode === 'single' ? 'Wordle' : 'Wordle Battle'}
        </h1>
        <div className="w-6"></div>
      </header>

      {game.gameStatus !== 'playing' && (
        <div
          className={`p-2 text-center text-white font-bold ${game.gameStatus === 'won' ? 'bg-green-500' : 'bg-red-500'
            }`}
        >
          {game.gameStatus === 'won'
            ? '¡Ganaste!'
            : `¡Perdiste! La palabra era ${game.secretWord}`}
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 gap-4">
        {gameMode === 'multi' && (
          <OpponentProgress
            rivalAttempts={multiplayerGame.rivalAttempts}
            rivalGuessResults={multiplayerGame.rivalGuessResults}
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