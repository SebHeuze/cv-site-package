import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-game-over-modal',
  imports: [],
  templateUrl: './game-over-modal.html',
  styleUrl: './game-over-modal.scss',
})
export class GameOverModal {
  @Input() survivalTime = 0;
  @Input() finalCapital = 0;
  @Input() tradeCount = 0;

  @Output() playAgain = new EventEmitter<void>();
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

  onClose(): void {
    this.close.emit();
  }
}
