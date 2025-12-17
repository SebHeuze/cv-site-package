import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Score } from '../../../core/models/game-session.model';

@Component({
  selector: 'app-game-over-modal',
  imports: [CommonModule],
  templateUrl: './game-over-modal.html',
  styleUrl: './game-over-modal.scss',
})
export class GameOverModal {
  @Input() survivalTime = 0;
  @Input() finalCapital = 0;
  @Input() tradeCount = 0;
  @Input() leaderboard: Score[] = [];
  @Input() showLeaderboard = false;

  @Output() playAgain = new EventEmitter<void>();
  @Output() viewLeaderboard = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onPlayAgain(): void {
    this.playAgain.emit();
  }

  onViewLeaderboard(): void {
    this.showLeaderboard = !this.showLeaderboard;
    if (this.showLeaderboard) {
      this.viewLeaderboard.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
