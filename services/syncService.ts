import { GameState, StockData } from '../types';

// 我們使用試算表網址的 ID 作為 Room ID 的一部分，確保不同班級不會互相干擾
const ROOM_ID = 'stock_game_room_v1_2PACX-1vSwgBecjYUtKoC0MoqVvEJbsaWpx93USXViXh7Sw-t5izoxFFpqkavxO90GaitAK-DwOTsXWGqt4vEg';
const BASE_URL = `https://kvdb.io/S2Vv8U8m3uPzL8W5k8L8/${ROOM_ID}`;

export interface CloudState {
  gameState: GameState;
  stockData: StockData[];
  lastUpdate: number;
}

export const syncService = {
  // 推送完整狀態到雲端
  push: async (state: CloudState): Promise<boolean> => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(state),
      });
      return response.ok;
    } catch (e) {
      console.error('Cloud Sync Push Error:', e);
      return false;
    }
  },

  // 從雲端拉取最新狀態
  pull: async (): Promise<CloudState | null> => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error('Cloud Sync Pull Error:', e);
      return null;
    }
  },

  // 重置雲端資料
  clear: async (): Promise<void> => {
    try {
      await fetch(BASE_URL, { method: 'DELETE' });
    } catch (e) {
      console.error('Cloud Sync Clear Error:', e);
    }
  }
};