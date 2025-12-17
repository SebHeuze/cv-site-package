import { Portfolio } from './portfolio.model';

export interface GameSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  initialCapital: number;
  finalCapital?: number;
  alive: boolean;
  tradeCount: number;
  survivalTime?: number; // in seconds
}

export interface GameStatus {
  session: GameSession;
  portfolio: Portfolio;
  currentPrice: number;
  alive: boolean;
}

export interface Score {
  id?: number;
  userId: string;
  username: string;
  survivalTime: number; // in seconds
  finalCapital: number;
  achievedAt: Date;
  rank?: number;
}
