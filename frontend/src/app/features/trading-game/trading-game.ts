import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PriceChart } from './price-chart/price-chart';
import { PortfolioDisplay } from './portfolio-display/portfolio-display';
import { GameOverModal } from './game-over-modal/game-over-modal';
import { TradeFeed } from './trade-feed/trade-feed';
import { GameService } from '../../core/services/game.service';
import { Portfolio } from '../../core/models/portfolio.model';
import { GameSession } from '../../core/models/game-session.model';

@Component({
  selector: 'app-trading-game',
  imports: [CommonModule, FormsModule, PriceChart, PortfolioDisplay, GameOverModal, TradeFeed],
  templateUrl: './trading-game.html',
  styleUrl: './trading-game.scss',
})
export class TradingGame implements OnInit, OnDestroy {
  @ViewChild(PriceChart) priceChart?: PriceChart;

  sessionId = '';
  isGameStarted = false;
  hasChosenPosition = false; // New state: waiting for first position choice
  isGameOver = false;
  currentPrice = 0;
  portfolio: Portfolio | null = null;
  survivalTime = 0;

  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Subscribe to portfolio updates
    this.subscriptions.push(
      this.gameService.getPortfolio().subscribe(portfolio => {
        this.portfolio = portfolio;
      })
    );

    // Subscribe to survival time
    this.subscriptions.push(
      this.gameService.getSurvivalTime().subscribe(time => {
        this.survivalTime = time;
      })
    );

    // Subscribe to game session
    this.subscriptions.push(
      this.gameService.getCurrentSession().subscribe(session => {
        if (session && !session.alive) {
          this.handleGameOver(session);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.gameService.resetGame();
  }

  startGame(): void {
    // Generate a unique session ID
    this.sessionId = this.generateSessionId();

    this.isGameStarted = true;
    this.hasChosenPosition = false;
    this.isGameOver = false;

    // Start WebSocket to show live prices on the chart
    // but don't start the actual game/timer yet
    this.subscriptions.push(
      this.gameService.getCurrentPrice().subscribe(price => {
        this.currentPrice = price;
      })
    );
  }

  private generateSessionId(): string {
    return 'sim-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  goLong(): void {
    if (this.isGameOver) return;

    if (!this.hasChosenPosition) {
      // First position - start the game
      this.hasChosenPosition = true;
      this.gameService.startGame(this.sessionId, 'LONG');
    } else {
      // Switching position
      this.gameService.goLong(this.sessionId);
    }
  }

  goShort(): void {
    if (this.isGameOver) return;

    if (!this.hasChosenPosition) {
      // First position - start the game
      this.hasChosenPosition = true;
      this.gameService.startGame(this.sessionId, 'SHORT');
    } else {
      // Switching position
      this.gameService.goShort(this.sessionId);
    }
  }

  onPriceUpdate(price: number): void {
    this.currentPrice = price;
  }

  private handleGameOver(session: GameSession): void {
    this.isGameOver = true;
  }

  onPlayAgain(): void {
    this.isGameOver = false;
    this.isGameStarted = false;
    this.gameService.resetGame();
  }

  onCloseGameOver(): void {
    this.isGameOver = false;
    this.isGameStarted = false;
    this.gameService.resetGame();
  }
}
