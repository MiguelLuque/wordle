import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Crown } from 'lucide-react';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const SECRET_WORD = 'GATOS';

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface GuessResult {
  letter: string;
  state: LetterState;
}

export default function GameScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>(
    'playing'
  );
  const [opponentProgress, setOpponentProgress] = useState(0);

  useEffect(() => {
    // Simulate opponent progress updates
    const interval = setInterval(() => {
      setOpponentProgress((prev) => Math.min(prev + 1, MAX_ATTEMPTS));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkGuess = (guess: string): GuessResult[] => {
    const result: GuessResult[] = [];
    const secretLetters = SECRET_WORD.split('');
    const remainingLetters = [...secretLetters];

    // First pass: mark correct letters
    guess.split('').forEach((letter, i) => {
      if (letter === secretLetters[i]) {
        result[i] = { letter, state: 'correct' };
        remainingLetters[i] = '';
      }
    });

    // Second pass: mark present and absent letters
    guess.split('').forEach((letter, i) => {
      if (!result[i]) {
        const letterIndex = remainingLetters.indexOf(letter);
        if (letterIndex !== -1) {
          result[i] = { letter, state: 'present' };
          remainingLetters[letterIndex] = '';
        } else {
          result[i] = { letter, state: 'absent' };
        }
      }
    });

    return result;
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'Backspace') {
      setCurrentAttempt((prev) => prev.slice(0, -1));
    } else if (key === 'Enter' && currentAttempt.length === WORD_LENGTH) {
      submitAttempt();
    } else if (currentAttempt.length < WORD_LENGTH && /^[A-Za-z]$/.test(key)) {
      setCurrentAttempt((prev) => prev + key.toUpperCase());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAttempt, gameStatus]);

  const submitAttempt = () => {
    const newGuessResult = checkGuess(currentAttempt);
    setGuessResults((prev) => [...prev, newGuessResult]);
    setAttempts((prev) => [...prev, currentAttempt]);
    setCurrentAttempt('');

    if (currentAttempt === SECRET_WORD) {
      setGameStatus('won');
      showGameEndModal('won');
    } else if (attempts.length + 1 >= MAX_ATTEMPTS) {
      setGameStatus('lost');
      showGameEndModal('lost');
    }
  };

  const showGameEndModal = (result: 'won' | 'lost') => {
    setTimeout(() => {
      navigate('/menu');
    }, 3000);
  };

  const getLetterClassName = (state: LetterState) => {
    const baseClass =
      'w-full aspect-square border-2 rounded flex items-center justify-center text-xl font-bold uppercase transition-colors';
    switch (state) {
      case 'correct':
        return `${baseClass} bg-green-500 text-white border-green-600`;
      case 'present':
        return `${baseClass} bg-yellow-500 text-white border-yellow-600`;
      case 'absent':
        return `${baseClass} bg-gray-500 text-white border-gray-600`;
      default:
        return `${baseClass} bg-white border-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/menu')}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Wordle Battle</h1>
        <div className="w-6"></div>
      </div>

      {/* Game Status */}
      {gameStatus !== 'playing' && (
        <div
          className={`p-4 text-center text-white font-bold ${
            gameStatus === 'won' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {gameStatus === 'won'
            ? '¡Ganaste!'
            : `¡Perdiste! La palabra era ${SECRET_WORD}`}
        </div>
      )}

      {/* Game Area */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        {/* Player's Board */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <Crown className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="font-semibold">Your Board</span>
          </div>
          <div className="grid gap-2">
            {[...Array(MAX_ATTEMPTS)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                {[...Array(WORD_LENGTH)].map((_, j) => {
                  const letter =
                    i === attempts.length
                      ? currentAttempt[j] || ''
                      : attempts[i]?.[j] || '';
                  const state = guessResults[i]?.[j]?.state || 'empty';

                  return (
                    <div key={j} className={getLetterClassName(state)}>
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Opponent's Board */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-4">
            <span className="font-semibold">Opponent's Progress</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(opponentProgress / MAX_ATTEMPTS) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard */}
      <div className="bg-white shadow-lg p-4">
        <div className="flex justify-center mb-2">
          <input
            type="text"
            value={currentAttempt}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              if (value.length <= WORD_LENGTH && /^[A-Z]*$/.test(value)) {
                setCurrentAttempt(value);
              }
            }}
            maxLength={WORD_LENGTH}
            className="w-full max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Type your guess..."
            disabled={gameStatus !== 'playing'}
          />
          <button
            onClick={() =>
              currentAttempt.length === WORD_LENGTH && submitAttempt()
            }
            className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={
              currentAttempt.length !== WORD_LENGTH || gameStatus !== 'playing'
            }
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
