export type LetterState = 'correct' | 'present' | 'absent' | 'empty';
export type GameStatus = 'playing' | 'won' | 'lost';
export type KeyState = 'correct' | 'present' | 'absent' | 'unused';

export interface GuessResult {
  letter: string;
  state: LetterState;
}

export interface GuessEntry {
  word: string;
  player_id: string;
  attempts: number;
}

export const GAME_CONSTANTS = {
  WORD_LENGTH: 5,
  MAX_ATTEMPTS: 6,
  KEYBOARD_ROWS: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ]
} as const; 