import { create } from 'zustand';

type GameMode = 'single' | 'multi';

interface GameStore {
  authenticated: boolean;
  isGuest: boolean;
  currentGame: string | null;
  gameMode: GameMode;
  setAuthenticated: (value: boolean) => void;
  setGuest: (value: boolean) => void;
  setCurrentGame: (gameId: string | null) => void;
  setGameMode: (mode: GameMode) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  authenticated: false,
  isGuest: false,
  currentGame: null,
  gameMode: 'single',
  setAuthenticated: (value) => {
    set({ authenticated: value });
  },
  setGuest: (value) => set({ isGuest: value }),
  setCurrentGame: (gameId) => set({ currentGame: gameId }),
  setGameMode: (mode) => set({ gameMode: mode }),
}));