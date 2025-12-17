import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Portfolio } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-portfolio-display',
  imports: [CommonModule],
  templateUrl: './portfolio-display.html',
  styleUrl: './portfolio-display.scss',
})
export class PortfolioDisplay {
  @Input() portfolio: Portfolio | null = null;
  @Input() survivalTime = 0;

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getProfitLossClass(): string {
    if (!this.portfolio || this.portfolio.unrealizedPnl === undefined) return '';
    return this.portfolio.unrealizedPnl >= 0 ? 'profit' : 'loss';
  }

  getTotalValueClass(): string {
    if (!this.portfolio || this.portfolio.totalPnl === undefined) return '';
    return this.portfolio.totalPnl >= 0 ? 'profit' : 'loss';
  }
}
