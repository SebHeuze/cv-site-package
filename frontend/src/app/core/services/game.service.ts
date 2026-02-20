import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GameSession } from '../models/game-session.model';
import { Portfolio } from '../models/portfolio.model';
import { TradingApiService } from './trading-api.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentSession$ = new BehaviorSubject<GameSession | null>(null);
  private portfolio$ = new BehaviorSubject<Portfolio | null>(null);
  private currentPrice$ = new BehaviorSubject<number>(0);
  private survivalTimer$ = new BehaviorSubject<number>(0);
  private timerInterval?: any;
  private priceSubscription?: Subscription;

  constructor(
    private tradingApi: TradingApiService,
    private websocket: WebsocketService
  ) {}

  // Get current session
  getCurrentSession(): Observable<GameSession | null> {
    return this.currentSession$.asObservable();
  }

  // Get portfolio
  getPortfolio(): Observable<Portfolio | null> {
    return this.portfolio$.asObservable();
  }

  // Get current price
  getCurrentPrice(): Observable<number> {
    return this.currentPrice$.asObservable();
  }

  // Get survival time
  getSurvivalTime(): Observable<number> {
    return this.survivalTimer$.asObservable();
  }

  // Start new game
  startGame(userId: string, initialPosition: 'LONG' | 'SHORT' = 'LONG'): void {
    this.tradingApi.startGame(userId, initialPosition).subscribe(session => {
      this.currentSession$.next(session);
      this.startTimer();
      this.startPriceUpdates();
      this.updatePortfolioFromStatus(userId);
    });
  }

  // Execute LONG trade
  goLong(userId: string): void {
    this.tradingApi.goLong(userId).subscribe(() => {
      this.updatePortfolioFromStatus(userId);
    });
  }

  // Execute SHORT trade
  goShort(userId: string): void {
    this.tradingApi.goShort(userId).subscribe(() => {
      this.updatePortfolioFromStatus(userId);
    });
  }

  // Update portfolio from game status (includes portfolio and alive check)
  private updatePortfolioFromStatus(userId: string): void {
    this.tradingApi.getGameStatus(userId).subscribe(status => {
      this.portfolio$.next(status.portfolio);
      this.currentSession$.next(status.session);
      if (!status.alive) {
        this.endGame(status.session.id);
      }
    });
  }

  // Start price updates
  private startPriceUpdates(): void {
    // Unsubscribe any existing subscription before creating a new one
    if (this.priceSubscription) {
      this.priceSubscription.unsubscribe();
    }
    this.priceSubscription = this.websocket.connectToPriceStream().subscribe({
      next: (priceUpdate) => {
        this.currentPrice$.next(priceUpdate.price);
        // Calculate P&L locally without calling backend
        this.updatePortfolioLocally(priceUpdate.price);
      },
      error: (err) => console.error('Price stream error:', err)
    });
  }

  // Update portfolio locally with real-time price
  private updatePortfolioLocally(currentPrice: number): void {
    const portfolio = this.portfolio$.value;
    const session = this.currentSession$.value;
    if (!portfolio || !session) return;

    const LEVERAGE = 1000;
    const INITIAL_CAPITAL = 10000;

    // Calculate P&L based on position type with 1000x leverage
    const priceDiff = portfolio.positionType === 'LONG'
      ? currentPrice - portfolio.entryPrice
      : portfolio.entryPrice - currentPrice;

    const priceChangePercent = priceDiff / portfolio.entryPrice;
    const unrealizedPnl = priceChangePercent * portfolio.positionSize * LEVERAGE;

    // Current total value = capital + unrealized P&L
    const currentValue = portfolio.capitalUSDT + unrealizedPnl;

    // Total P&L is current value minus initial capital
    const totalPnl = currentValue - INITIAL_CAPITAL;

    // Check for game over condition (total value <= 0)
    if (currentValue <= 0 && session.alive) {
      console.warn('Game over detected - Total value:', currentValue);
      // Emit final portfolio state so UI reflects liquidation before game over
      this.portfolio$.next({
        ...portfolio,
        currentBtcPrice: currentPrice,
        unrealizedPnl: unrealizedPnl,
        currentBtcValue: 0,
        totalPnl: -INITIAL_CAPITAL,
        lastUpdated: new Date().toISOString()
      });
      // Fetch latest status from backend to confirm game over
      this.updatePortfolioFromStatus(session.userId);
      return;
    }

    // Update portfolio with new calculations
    this.portfolio$.next({
      ...portfolio,
      currentBtcPrice: currentPrice,
      unrealizedPnl: unrealizedPnl,
      currentBtcValue: currentValue,
      totalPnl: totalPnl,
      lastUpdated: new Date().toISOString()
    });
  }

  // Start survival timer
  private startTimer(): void {
    this.survivalTimer$.next(0);
    this.timerInterval = setInterval(() => {
      this.survivalTimer$.next(this.survivalTimer$.value + 1);
    }, 1000);
  }

  // End game
  endGame(sessionId: string): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.priceSubscription) {
      this.priceSubscription.unsubscribe();
      this.priceSubscription = undefined;
    }
    this.websocket.disconnect();
    this.tradingApi.endGame(sessionId).subscribe({
      error: (err) => console.error('Error ending game:', err)
    });
  }

  // Reset game
  resetGame(): void {
    this.currentSession$.next(null);
    this.portfolio$.next(null);
    this.currentPrice$.next(0);
    this.survivalTimer$.next(0);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.priceSubscription) {
      this.priceSubscription.unsubscribe();
      this.priceSubscription = undefined;
    }
  }
}
