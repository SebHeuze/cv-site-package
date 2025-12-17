export interface Trade {
  id?: string;
  userId: string;
  sessionId: string;
  type: 'LONG' | 'SHORT';
  btcAmount: number;
  usdtAmount: number;
  price: number;
  timestamp: Date;
  fee: number;
}
