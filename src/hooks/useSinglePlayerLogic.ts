import { useState } from 'react';
import { GuessResult, GameStatus, KeyState } from '../types/game.types';
import { GAME_CONSTANTS } from '../types/game.types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function useSinglePlayerLogic(secretWord: string) {
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [keyboardState, setKeyboardState] = useState<Record<string, KeyState>>({});

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

  const checkWordExists = async (word: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('buscar_palabra', {
        palabra: word.toLowerCase()
      });

      if (error) {
        console.error('Error al validar la palabra:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error en checkWordExists:', error);
      return false;
    }
  };

  const submitAttempt = async () => {
    if (!secretWord) return;

    const palabraExiste = await checkWordExists(currentAttempt);
    
    if (!palabraExiste) {
      toast.error('La palabra no existe en el diccionario', {
        duration: 2000,
        position: 'top-center',
      });
      const currentRow = document.querySelector('.current-row');
      currentRow?.classList.add('shake');
      setTimeout(() => {
        currentRow?.classList.remove('shake');
      }, 500);
      return;
    }

    const newGuessResult = checkGuess(currentAttempt);
    updateKeyboardState(newGuessResult);
    setGuessResults((prev) => [...prev, newGuessResult]);
    setAttempts((prev) => [...prev, currentAttempt]);
    setCurrentAttempt('');

    if (currentAttempt === secretWord) {
      setGameStatus('won');
    } else if (attempts.length + 1 >= GAME_CONSTANTS.MAX_ATTEMPTS) {
      setGameStatus('lost');
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    const normalizedKey = key.toUpperCase();

    if (key === 'DEL' || key === 'Backspace' || key === 'Delete') {
      setCurrentAttempt((prev) => prev.slice(0, -1));
    } else if ((key === 'ENTER' || key === 'Enter') && currentAttempt.length === GAME_CONSTANTS.WORD_LENGTH) {
      submitAttempt();
    } else if (currentAttempt.length < GAME_CONSTANTS.WORD_LENGTH) {
      if (/^[A-ZÑ]$/.test(normalizedKey)) {
        setCurrentAttempt((prev) => prev + normalizedKey);
      }
    }
  };

  return {
    currentAttempt,
    secretWord,
    attempts,
    guessResults,
    gameStatus,
    keyboardState,
    handleKeyPress,
    rivalAttempts: [], // Para mantener la interfaz consistente con useGameLogic
    rivalGuessResults: [], // Para mantener la interfaz consistente con useGameLogic
  };
} 