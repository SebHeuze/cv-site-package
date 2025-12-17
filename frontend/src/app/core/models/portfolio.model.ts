export interface Portfolio {
  userId: string;
  currentBtcValue: number;      // Current total value
  unrealizedPnl: number;        // Current unrealized P&L
  totalPnl: number;             // Total P&L (currentValue - 10000)
  currentBtcPrice: number;
  positionType: 'LONG' | 'SHORT'; // Current position
  entryPrice: number;           // Entry price of current position
  positionSize: number;         // Position size in USDT
  capitalUSDT: number;          // Current capital in USDT
  lastUpdated: string;
}
