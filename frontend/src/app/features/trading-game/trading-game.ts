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
import { GameSession, Score } from '../../core/models/game-session.model';

@Component({
  selector: 'app-trading-game',
  imports: [CommonModule, FormsModule, PriceChart, PortfolioDisplay, GameOverModal, TradeFeed],
  templateUrl: './trading-game.html',
  styleUrl: './trading-game.scss',
})
export class TradingGame implements OnInit, OnDestroy {
  @ViewChild(PriceChart) priceChart?: PriceChart;

  username = '';
  isGameStarted = false;
  hasChosenPosition = false; // New state: waiting for first position choice
  isGameOver = false;
  currentPrice = 0;
  portfolio: Portfolio | null = null;
  survivalTime = 0;
  leaderboard: Score[] = [];

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
    if (!this.username.trim()) {
      alert('Please enter a username');
      return;
    }

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

  goLong(): void {
    if (this.isGameOver) return;

    if (!this.hasChosenPosition) {
      // First position - start the game
      this.hasChosenPosition = true;
      this.gameService.startGame(this.username, 'LONG');
    } else {
      // Switching position
      this.gameService.goLong(this.username);
    }
  }

  goShort(): void {
    if (this.isGameOver) return;

    if (!this.hasChosenPosition) {
      // First position - start the game
      this.hasChosenPosition = true;
      this.gameService.startGame(this.username, 'SHORT');
    } else {
      // Switching position
      this.gameService.goShort(this.username);
    }
  }

  onPriceUpdate(price: number): void {
    this.currentPrice = price;
  }

  private handleGameOver(session: GameSession): void {
    this.isGameOver = true;
    // Load leaderboard (mock data for now)
    this.leaderboard = this.getMockLeaderboard();
  }

  private getMockLeaderboard(): Score[] {
    return [
      {
        userId: 'alice-1',
        username: 'Alice',
        survivalTime: 4425, // 01:13:45
        finalCapital: 15234,
        achievedAt: new Date(),
        rank: 1
      },
      {
        userId: 'bob-2',
        username: 'Bob',
        survivalTime: 3492, // 00:58:12
        finalCapital: 12456,
        achievedAt: new Date(),
        rank: 2
      },
      {
        userId: 'charlie-3',
        username: 'Charlie',
        survivalTime: 2730, // 00:45:30
        finalCapital: 9876,
        achievedAt: new Date(),
        rank: 3
      }
    ];
  }

  onPlayAgain(): void {
    this.isGameOver = false;
    this.isGameStarted = false;
    this.gameService.resetGame();
  }

  onViewLeaderboard(): void {
    // In real implementation, call API
    this.leaderboard = this.getMockLeaderboard();
  }

  onCloseGameOver(): void {
    this.isGameOver = false;
    this.isGameStarted = false;
    this.gameService.resetGame();
  }
}
