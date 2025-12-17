export interface TradeTick {
  tradeId: number;
  price: number;
  quantity: number;
  timestamp: string;
  isBuyerMaker: boolean;  // true = sell (red), false = buy (green)
}
