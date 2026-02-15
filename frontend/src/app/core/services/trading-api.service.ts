import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';
import { GameSession, GameStatus, Score } from '../models/game-session.model';
import { Trade } from '../models/trade.model';
import { Candlestick } from '../models/candlestick.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class TradingApiService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.get('apiBaseUrl')}/api`;
  }

  // Get current BTC/USDT price
  getCurrentPrice(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/price/current`);
  }

  // Start new game
  startGame(userId: string, initialPosition: 'LONG' | 'SHORT' = 'LONG'): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiUrl}/game/start`, null, {
      params: { userId, initialPosition }
    });
  }

  // Go LONG (buy all-in)
  goLong(userId: string): Observable<Trade> {
    return this.http.post<Trade>(`${this.apiUrl}/game/long`, null, {
      params: { userId }
    });
  }

  // Go SHORT (sell all-in)
  goShort(userId: string): Observable<Trade> {
    return this.http.post<Trade>(`${this.apiUrl}/game/short`, null, {
      params: { userId }
    });
  }

  // Get game status (includes portfolio)
  getGameStatus(userId: string): Observable<GameStatus> {
    return this.http.get<GameStatus>(`${this.apiUrl}/game/status`, {
      params: { userId }
    });
  }

  // End game
  endGame(sessionId: string): Observable<Score> {
    return this.http.post<Score>(`${this.apiUrl}/game/end`, null, {
      params: { sessionId }
    });
  }

  // Get price history (last 5 minutes)
  getPriceHistory(): Observable<Candlestick[]> {
    return this.http.get<Candlestick[]>(`${this.apiUrl}/price/history`);
  }
}
