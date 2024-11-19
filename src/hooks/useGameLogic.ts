import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GuessResult, GuessEntry, GameStatus, KeyState } from '../types/game.types';
import { GAME_CONSTANTS } from '../types/game.types';

export function useGameLogic(gameId: string | undefined) {
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [secretWord, setSecretWord] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[][]>([]);
  const [rivalAttempts, setRivalAttempts] = useState<string[]>([]);
  const [rivalGuessResults, setRivalGuessResults] = useState<GuessResult[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [channel, setChannel] = useState<any>(null);
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

    await channel?.send({
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
    } else if (attempts.length + 1 >= GAME_CONSTANTS.MAX_ATTEMPTS) {
      setGameStatus('lost');
    }
  };

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
      if (newGuess.player_id !== userId) {
        const newGuessResult = checkGuess(newGuess.word);
        setRivalGuessResults((prev) => [...prev, newGuessResult]);
        setRivalAttempts((prev) => [...prev, newGuess.word]);

        if (newGuess.word === secretWord) {
          setGameStatus('lost');
        }
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

  return {
    currentAttempt,
    secretWord,
    attempts,
    guessResults,
    rivalAttempts,
    rivalGuessResults,
    gameStatus,
    keyboardState,
    handleKeyPress,
    submitAttempt
  };
} 