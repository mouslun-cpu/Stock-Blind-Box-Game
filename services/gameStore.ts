
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, StockData } from '../types';
import { fetchStockData } from './csvService';
import { syncService, CloudState } from './syncService';

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

  // 定期同步 (Polling)
  useEffect(() => {
    const sync = async () => {
      const cloud = await syncService.pull();
      if (cloud) {
        // 如果雲端有資料且較新，則更新本地
        setGameState(cloud.gameState);
        setStockData(cloud.stockData);
      }
      setLoading(false);
    };

    sync(); // 初始讀取
    const interval = setInterval(sync, 2500); // 每 2.5 秒檢查一次雲端
    return () => clearInterval(interval);
  }, []);

  // 更新雲端的封裝函數
  // Fix: saveToCloud now returns the boolean result from syncService.push
  const saveToCloud = async (newGameState: GameState, newStockData: StockData[]): Promise<boolean> => {
    setIsSyncing(true);
    const success = await syncService.push({
      gameState: newGameState,
      stockData: newStockData,
      lastUpdate: Date.now()
    });
    setIsSyncing(false);
    return success;
  };

  const startGame = useCallback(async () => {
    // 老師點擊開始時，重新抓取並打亂
    const freshData = await fetchStockData();
    const newState: GameState = {
      ...INITIAL_STATE,
      status: 'RUNNING',
      startTime: Date.now(),
    };
    setGameState(newState);
    setStockData(freshData);
    await saveToCloud(newState, freshData);
  }, []);

  const endGame = useCallback(async () => {
    const newState: GameState = {
      ...stateRef.current,
      status: 'ENDED',
      endTime: Date.now(),
    };
    setGameState(newState);
    await saveToCloud(newState, dataRef.current);
  }, []);

  const resetGame = useCallback(async () => {
    setGameState(INITIAL_STATE);
    setStockData([]);
    await syncService.clear();
    setLoading(true);
    // 重啟同步流程
    setTimeout(() => setLoading(false), 500);
  }, []);

  const claimBox = useCallback(async (stockId: string, analystName: string): Promise<boolean> => {
    // 1. 立即拉取最新雲端狀態，防止多人搶同一個
    const cloud = await syncService.pull();
    const current = cloud ? cloud.gameState : stateRef.current;

    if (current.status !== 'RUNNING') return false;
    if (current.assignments[stockId]) return false; 
    
    const alreadyClaimed = Object.values(current.assignments).includes(analystName);
    if (alreadyClaimed) return false;

    const newState = {
      ...current,
      assignments: {
        ...current.assignments,
        [stockId]: analystName,
      },
    };

    // 2. 推送到雲端
    const success = await saveToCloud(newState, dataRef.current);
    if (success) {
      setGameState(newState);
      return true;
    }
    return false;
  }, []);

  return {
    gameState,
    stockData,
    loading,
    isSyncing,
    startGame,
    endGame,
    resetGame,
    claimBox,
  };
};
