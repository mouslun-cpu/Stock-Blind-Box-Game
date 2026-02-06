import { useState, useEffect, useCallback } from 'react';
import { GameState, StockData } from '../types';
import { fetchStockData } from './csvService';

const STORAGE_KEY_STATE = 'stock_game_state';
const STORAGE_KEY_DATA = 'stock_game_data';

const INITIAL_STATE: GameState = {
  status: 'IDLE',
  startTime: null,
  endTime: null,
  assignments: {},
};

export const useGameStore = (role: 'TEACHER' | 'STUDENT') => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      // Load Data
      const storedData = localStorage.getItem(STORAGE_KEY_DATA);
      if (storedData) {
        setStockData(JSON.parse(storedData));
      } else if (role === 'TEACHER') {
        // Only teacher fetches fresh data to avoid race conditions on init
        const data = await fetchStockData();
        setStockData(data);
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
      }

      // Load State
      const storedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (storedState) {
        setGameState(JSON.parse(storedState));
      }
      
      setLoading(false);
    };
    load();
  }, [role]);

  // Sync listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_STATE && e.newValue) {
        setGameState(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEY_DATA && e.newValue) {
        setStockData(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Actions
  const updateState = useCallback((newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(newState));
  }, []);

  const startGame = useCallback(() => {
    const newState: GameState = {
      ...gameState,
      status: 'RUNNING',
      startTime: Date.now(),
      endTime: null,
      assignments: {}, // Reset assignments on new game
    };
    updateState(newState);
  }, [gameState, updateState]);

  const endGame = useCallback(() => {
    const newState: GameState = {
      ...gameState,
      status: 'ENDED',
      endTime: Date.now(),
    };
    updateState(newState);
  }, [gameState, updateState]);

  const resetGame = useCallback(async () => {
    // Re-fetch data to ensure fresh list
    if (role === 'TEACHER') {
        const data = await fetchStockData();
        setStockData(data);
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    }
    updateState(INITIAL_STATE);
  }, [role, updateState]);

  const claimBox = useCallback((stockId: string, analystName: string): boolean => {
    // Read fresh state from local storage to minimize race conditions
    const currentStoredRaw = localStorage.getItem(STORAGE_KEY_STATE);
    const current: GameState = currentStoredRaw ? JSON.parse(currentStoredRaw) : gameState;

    if (current.status !== 'RUNNING') return false;
    
    // Check 1: Is the box already taken?
    if (current.assignments[stockId]) return false; 

    // Check 2: Has this analyst already claimed a box? (One box per person rule)
    const alreadyClaimed = Object.values(current.assignments).includes(analystName);
    if (alreadyClaimed) return false;

    const newState = {
      ...current,
      assignments: {
        ...current.assignments,
        [stockId]: analystName,
      },
    };

    updateState(newState);
    return true;
  }, [gameState, updateState]);

  return {
    gameState,
    stockData,
    loading,
    startGame,
    endGame,
    resetGame,
    claimBox,
  };
};