import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { DesktopWindow } from '../desktop';

@Component({
  selector: 'app-taskbar',
  imports: [],
  templateUrl: './taskbar.html',
  styleUrl: './taskbar.scss',
})
export class Taskbar implements OnDestroy {
  @Input() windows: DesktopWindow[] = [];
  @Output() windowClick = new EventEmitter<string>();

  currentTime = new Date();

  private clockInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
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
