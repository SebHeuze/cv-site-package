import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesktopWindow } from '../desktop';

@Component({
  selector: 'app-taskbar',
  imports: [CommonModule],
  templateUrl: './taskbar.html',
  styleUrl: './taskbar.scss',
})
export class Taskbar {
  @Input() windows: DesktopWindow[] = [];
  @Output() windowClick = new EventEmitter<string>();

  currentTime = new Date();

  constructor() {
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  onWindowClick(windowId: string): void {
    this.windowClick.emit(windowId);
  }

  formatTime(): string {
    const hours = this.currentTime.getHours().toString().padStart(2, '0');
    const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(): string {
    const day = this.currentTime.getDate().toString().padStart(2, '0');
    const month = (this.currentTime.getMonth() + 1).toString().padStart(2, '0');
    const year = this.currentTime.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
