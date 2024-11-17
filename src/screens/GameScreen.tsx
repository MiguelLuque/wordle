import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface GuessResult {
  letter: string;
  state: LetterState;
}

interface GuessEntry {
  word: string;
  player_id: string;
  attempts: number;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

type KeyState = 'correct' | 'present' | 'absent' | 'unused';

export default function GameScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [secretWord, setSecretWord] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[][]>([]);
  const [rivalAttempts, setRivalAttempts] = useState<string[]>([]);
  const [rivalGuessResults, setrivalGuessResults] = useState<GuessResult[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [channel, setChannel] = useState<any>(null);
  const [keyboardState, setKeyboardState] = useState<Record<string, KeyState>>({});

  useEffect(() => {
    const fetchSecretWord = async () => {
      if (!gameId) return;

      const { data: game, error } = await supabase
        .from('games')
        .select('secret_word')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Error fetching secret word:', error);
        return;
      }

      if (game?.secret_word) {
        setSecretWord(game.secret_word.toUpperCase());
      }
    };

    fetchSecretWord();
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !secretWord) return;

    const gameChannel = supabase.channel(`game_channel_${gameId}`);

    const handleBroadcastGuess = async (newGuess: GuessEntry) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (newGuess.player_id === userId) {
        // Manejar el intento del propio jugador si es necesario
      } else {
        setOpponentGuesses(newGuess);
      }
    };

    gameChannel
      .on('broadcast', { event: 'guess' }, (payload) => {
        handleBroadcastGuess(payload.payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(gameChannel);
        }
      });

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, secretWord]);


  async function handleBroadcastGuess(newGuess: GuessEntry) {
    if (newGuess.player_id === (await supabase.auth.getUser()).data.user?.id) {
      // Handle player's own guess
      //setPlayerGuesses((prev) => [newGuess, ...prev]);

    } else {
      setOpponentGuesses(newGuess);
    }
  }

  const checkGuess = (guess: string): GuessResult[] => {
    if (!secretWord) return [];

    const result: GuessResult[] = [];
    const secretLetters = secretWord.split('');
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

    // Normalizar la tecla a mayúsculas para el teclado físico
    const normalizedKey = key.toUpperCase();

    if (key === 'DEL' || key === 'Backspace' || key === 'Delete') {
      setCurrentAttempt((prev) => prev.slice(0, -1));
    } else if ((key === 'ENTER' || key === 'Enter') && currentAttempt.length === WORD_LENGTH) {
      submitAttempt();
    } else if (currentAttempt.length < WORD_LENGTH) {
      // Verificar si es una letra válida (incluyendo Ñ)
      if (/^[A-ZÑ]$/.test(normalizedKey)) {
        setCurrentAttempt((prev) => prev + normalizedKey);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevenir el comportamiento por defecto para evitar doble entrada
      if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
      }
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAttempt, gameStatus]);

  const updateKeyboardState = (guessResult: GuessResult[]) => {
    setKeyboardState(prevState => {
      const newState = { ...prevState };
      guessResult.forEach(({ letter, state }) => {
        if (state === 'correct') {
          newState[letter] = 'correct';
        } else if (state === 'present' && newState[letter] !== 'correct') {
          newState[letter] = 'present';
        } else if (state === 'absent' && !newState[letter]) {
          newState[letter] = 'absent';
        }
      });
      return newState;
    });
  };

  const submitAttempt = async () => {
    if (!secretWord) return;

    const newGuessResult = checkGuess(currentAttempt);
    updateKeyboardState(newGuessResult);
    setGuessResults((prev) => [...prev, newGuessResult]);
    setAttempts((prev) => [...prev, currentAttempt]);
    setCurrentAttempt('');

    const newGuess: GuessEntry = {
      word: currentAttempt,
      player_id: (await supabase.auth.getUser()).data.user?.id!,
      attempts: attempts.length,
    };

    await channel.send({
      type: 'broadcast',
      event: 'guess',
      payload: newGuess,
    });

    if (currentAttempt === secretWord) {
      await supabase
        .from('games')
        .update({
          status: 'finished',
          winner: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', gameId);

      setGameStatus('won');
      showGameEndModal('won');
    } else if (attempts.length + 1 >= MAX_ATTEMPTS) {
      setGameStatus('lost');
      showGameEndModal('lost');
    }
  };

  const setOpponentGuesses = async (guess: GuessEntry) => {
    if (!secretWord) return;

    const newGuessResult = checkGuess(guess.word);
    setrivalGuessResults((prev) => [...prev, newGuessResult]);
    setRivalAttempts((prev) => [...prev, guess.word]);

    if (guess.word === secretWord) {
      setGameStatus('lost');
      showGameEndModal('lost');
    } else if (guess.attempts >= MAX_ATTEMPTS) {
      await supabase
        .from('games')
        .update({
          status: 'finished',
          winner: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', gameId);

      setGameStatus('won');
      showGameEndModal('won');
    }
  };

  const showGameEndModal = (result: 'won' | 'lost') => {
    setTimeout(() => {
      navigate('/menu');
    }, 3000);
  };

  const getLetterClassName = (state: LetterState) => {
    const baseClass =
      'w-12 h-12 sm:w-14 sm:h-14 border-2 rounded flex items-center justify-center font-bold uppercase transition-colors text-base sm:text-lg';
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

  const renderKeyboard = () => (
    <div className="grid gap-1.5">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map((key) => {
            const keyState = keyboardState[key] || 'unused';
            const isSpecialKey = key === 'ENTER' || key === 'DEL';

            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={gameStatus !== 'playing'}
                className={`
                  ${isSpecialKey ? 'px-3 sm:px-4' : 'px-2.5 sm:px-3.5'} 
                  py-3 sm:py-4 
                  rounded 
                  font-semibold 
                  text-sm sm:text-base 
                  transition-colors
                  ${keyState === 'correct' ? 'bg-green-500 text-white' :
                    keyState === 'present' ? 'bg-yellow-500 text-white' :
                      keyState === 'absent' ? 'bg-gray-500 text-white' :
                        'bg-gray-200 hover:bg-gray-300'
                  }
                `}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  if (!secretWord) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm p-2 flex items-center justify-between">
        <button
          onClick={() => navigate('/menu')}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold">Wordle Battle</h1>
        <div className="w-5 sm:w-6"></div>
      </div>

      {gameStatus !== 'playing' && (
        <div className={`p-2 text-center text-white font-bold text-sm ${gameStatus === 'won' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {gameStatus === 'won'
            ? '¡Ganaste!'
            : `¡Perdiste! La palabra era ${secretWord}`}
        </div>
      )}

      <div className="flex-1 p-3 flex flex-col gap-3 max-w-lg mx-auto w-full">
        {/* Opponent's Progress Card */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2" />
              <span className="font-semibold text-sm sm:text-base text-gray-600">Opponent's Progress</span>
            </div>
            <span className="text-sm text-gray-500">
              {rivalAttempts.length}/{MAX_ATTEMPTS} attempts
            </span>
          </div>

          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
            {rivalGuessResults.map((result, attemptIndex) => (
              <div key={attemptIndex} className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {result.map((guess, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${guess.state === 'correct'
                        ? 'bg-green-500'
                        : guess.state === 'present'
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Game Card - Board and Keyboard Combined */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-3 flex flex-col gap-4">
          <div>
            <div className="flex items-center mb-3">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-semibold text-sm sm:text-base">Your Board</span>
            </div>
            <div className="grid gap-2 mx-auto" style={{ maxWidth: "fit-content" }}>
              {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-1">
                  {[...Array(WORD_LENGTH)].map((_, j) => {
                    const letter =
                      i === attempts.length
                        ? currentAttempt[j] || ''
                        : attempts[i]?.[j] || '';
                    const state = guessResults[i]?.[j]?.state || 'empty';

                    return (
                      <div
                        key={j}
                        className={`${getLetterClassName(state)} text-base sm:text-xl`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto"> {/* Esto empujará el teclado hacia abajo */}
            {renderKeyboard()}
          </div>
        </div>
      </div>
    </div>
  );
} 