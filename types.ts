export interface StockData {
  id: string;
  symbol: string;
  name: string;
  industry: string;
  hint: string;
}

export interface GameState {
  status: 'IDLE' | 'RUNNING' | 'ENDED';
  startTime: number | null;
  endTime: number | null;
  // Map of stock ID to analyst name (student who opened it)
  assignments: Record<string, string>;
}

export type UserRole = 'TEACHER' | 'STUDENT' | null;
