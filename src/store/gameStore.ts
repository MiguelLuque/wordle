import { create } from 'zustand';

interface GameState {
  isAuthenticated: boolean;
  currentGame: string | null;
  setAuthenticated: (value: boolean) => void;
  setCurrentGame: (gameId: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isAuthenticated: false,
  currentGame: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setCurrentGame: (gameId) => set({ currentGame: gameId }),
}));