import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../core/services/websocket.service';
import { TradeTick } from '../../../core/models/trade-tick.model';

@Component({
  selector: 'app-trade-feed',
  imports: [CommonModule],
  templateUrl: './trade-feed.html',
  styleUrl: './trade-feed.scss',
})
export class TradeFeed implements OnInit, OnDestroy {
  trades: TradeTick[] = [];
  private maxTrades = 20; // Keep last 20 trades
  private subscription?: Subscription;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.subscription = this.websocketService.connectToTradeStream().subscribe({
      next: (trade) => {
        this.trades.unshift(trade); // Add to beginning
        if (this.trades.length > this.maxTrades) {
          this.trades.pop(); // Remove oldest
        }
      },
      error: (error) => {
        console.error('Error in trade feed:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  formatQuantity(quantity: number): string {
    return quantity.toFixed(4);
  }

  isBuy(trade: TradeTick): boolean {
    return !trade.isBuyerMaker; // If buyer is maker, it's a sell order
  }

  trackByTradeId(index: number, trade: TradeTick): number {
    return trade.tradeId;
  }
}
