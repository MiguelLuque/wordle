import { create } from 'zustand';

type GameMode = 'single' | 'multi';

interface GameStore {
  authenticated: boolean;
  currentGame: string | null;
  gameMode: GameMode | null;
  setAuthenticated: (value: boolean) => void;
  setCurrentGame: (gameId: string | null) => void;
  setGameMode: (mode: GameMode) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  authenticated: false,
  currentGame: null,
  gameMode: null,
  setAuthenticated: (value) => {
    console.log('Setting authenticated:', value);
    set({ authenticated: value });
  },
  setCurrentGame: (gameId) => set({ currentGame: gameId }),
  setGameMode: (mode) => set({ gameMode: mode }),
}));