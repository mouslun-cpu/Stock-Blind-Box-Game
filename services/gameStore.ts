
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, StockData } from '../types';
import { fetchStockData } from './csvService';
import { db } from './firebase';
import { ref, onValue, set, get, child } from 'firebase/database';

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
  const [isSyncing, setIsSyncing] = useState(false);

  // 使用 Ref 避免閉包舊值問題
  const stateRef = useRef(gameState);
  const dataRef = useRef(stockData);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { dataRef.current = stockData; }, [stockData]);

  // Firebase Realtime Subscription
  useEffect(() => {
    const gameRef = ref(db, 'rooms/defaultRoom');
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.gameState) {
          // Ensure assignments object exists
          const safeGameState = {
            ...data.gameState,
            assignments: data.gameState.assignments || {}
          };
          setGameState(safeGameState);
        }
        if (data.stockData) setStockData(data.stockData);
      } else {
        // Handle empty database case (optional: reset to initial?)
        // setGameState(INITIAL_STATE);
        // setStockData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 更新雲端的封裝函數
  const saveToCloud = async (newGameState: GameState, newStockData: StockData[]): Promise<boolean> => {
    setIsSyncing(true);
    try {
      await set(ref(db, 'rooms/defaultRoom'), {
        gameState: newGameState,
        stockData: newStockData,
        lastUpdate: Date.now()
      });
      return true;
    } catch (error) {
      console.error("Firebase update failed", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const initializeGame = useCallback(async () => {
    setLoading(true);
    const freshData = await fetchStockData();
    const newState = INITIAL_STATE;
    await saveToCloud(newState, freshData);
    setLoading(false);
  }, []);

  const startGame = useCallback(async () => {
    // 老師點擊開始時，重新抓取並打亂
    const freshData = await fetchStockData();
    const newState: GameState = {
      ...INITIAL_STATE,
      status: 'RUNNING',
      startTime: Date.now(),
    };
    // Optimistically update local state? 
    // We'll rely on the subscription to update the state to ensure sync,
    // but for the initiator, we might want to see it immediately.
    // However, to keep it simple and consistent, we'll write to DB and let the listener handle it.
    // Wait, if we don't set local state, `loading` might act weird?
    // Actually, `onValue` is fast.

    await saveToCloud(newState, freshData);
  }, []);

  const endGame = useCallback(async () => {
    const newState: GameState = {
      ...stateRef.current,
      status: 'ENDED',
      endTime: Date.now(),
    };
    await saveToCloud(newState, dataRef.current);
  }, []);

  const resetGame = useCallback(async () => {
    setLoading(true);
    // Clearing the room data or just resetting game state?
    // "Remove all localStorage logic" -> "resetGame" in original code cleared syncService.
    const newState = INITIAL_STATE;
    const newStockData: StockData[] = [];

    // In original code: setGameState(INITIAL_STATE); setStockData([]); await syncService.clear();
    // Here we can just set the data in firebase to initial.
    await saveToCloud(newState, newStockData);

    // syncService.clear() did a DELETE. Maybe we should remove the node?
    // set(ref(db, 'rooms/defaultRoom'), null);
    // But then the listener receives null.
    // If listener receives null, we might want to handle it.
    // In my listener above: `if (data) { ... } else { ... }`.
    // I'll stick to overwriting with empty state.

    // The previous implementation had a manual timeout for loading.
    // With firebase, `onValue` will fire.
    // But `saveToCloud` sets `isSyncing`.
  }, []);

  const claimBox = useCallback(async (stockId: string, analystName: string): Promise<boolean> => {
    // 1. 立即拉取最新雲端狀態，防止多人搶同一個
    // equivalent to syncService.pull()
    const snapshot = await get(child(ref(db), 'rooms/defaultRoom'));
    const cloud = snapshot.val();

    const currentGameState: GameState = cloud && cloud.gameState ? cloud.gameState : stateRef.current;
    // Current stock data should be consistent, but usually stockData doesn't change during claim.
    const currentStockData = cloud && cloud.stockData ? cloud.stockData : dataRef.current;

    // Ensure assignments check is safe
    const assignments = currentGameState.assignments || {};

    if (currentGameState.status !== 'RUNNING') return false;
    if (assignments[stockId]) return false;

    const alreadyClaimed = Object.values(assignments).includes(analystName);
    if (alreadyClaimed) return false;

    const newState = {
      ...currentGameState,
      assignments: {
        ...assignments,
        [stockId]: analystName,
      },
    };

    // 2. 推送到雲端
    const success = await saveToCloud(newState, currentStockData);
    // If success, the listener will update the state.
    // If we want to return true/false based on write success, `saveToCloud` returns bool.
    return success;
  }, []);

  return {
    gameState,
    stockData,
    loading,
    isSyncing,
    initializeGame,
    startGame,
    endGame,
    resetGame,
    claimBox,
  };
};
