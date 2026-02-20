import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { DesktopWindow } from '../desktop/desktop';
import { CvTerminal } from '../cv-terminal/cv-terminal';
import { TradingGame } from '../trading-game/trading-game';
import { CvViewer } from '../cv-viewer/cv-viewer';
import { SnakeGame } from '../snake-game/snake-game';
import { SystemMonitor } from '../system-monitor/system-monitor';

@Component({
  selector: 'app-window',
  imports: [CvTerminal, TradingGame, CvViewer, SnakeGame, SystemMonitor],
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class Window implements AfterViewInit, OnDestroy {
  @Input() window!: DesktopWindow;
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();

  @ViewChild('windowElement') windowElement?: ElementRef<HTMLDivElement>;
  @ViewChild('titleBar') titleBar?: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private currentPosition = { x: 0, y: 0 };

  private isResizing = false;
  private resizeDirection = '';
  private resizeStartPos = { x: 0, y: 0 };
  private resizeStartSize = { width: 0, height: 0 };
  private resizeStartWindowPos = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    this.setupDragListeners();
    if (this.window.position) {
      this.currentPosition = { ...this.window.position };
    }
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
    // Clean up resize listeners in case component is destroyed mid-resize
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }

  private setupDragListeners(): void {
    if (!this.titleBar) return;

    const titleBarEl = this.titleBar.nativeElement;
    titleBarEl.addEventListener('mousedown', this.onDragStart);
  }

  private removeDragListeners(): void {
    if (!this.titleBar) return;

    const titleBarEl = this.titleBar.nativeElement;
    titleBarEl.removeEventListener('mousedown', this.onDragStart);
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
  }

  private onDragStart = (e: MouseEvent): void => {
    if (this.window.isMaximized) return;

    e.preventDefault();
    this.isDragging = true;
    this.focus.emit();

    const windowEl = this.windowElement?.nativeElement;
    if (windowEl) {
      const rect = windowEl.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  };

  private onDragMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;

    e.preventDefault();

    this.currentPosition = {
      x: e.clientX - this.dragOffset.x,
      y: e.clientY - this.dragOffset.y
    };

    // Update position directly via transform for better performance
    const windowEl = this.windowElement?.nativeElement;
    if (windowEl) {
      windowEl.style.transform = `translate(${this.currentPosition.x}px, ${this.currentPosition.y}px)`;
    }
  };

  private onDragEnd = (): void => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.positionChange.emit(this.currentPosition);

    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
  };

  onClose(): void {
    this.close.emit();
  }

  onMinimize(): void {
    this.minimize.emit();
  }

  onMaximize(): void {
    this.maximize.emit();
  }

  onWindowMouseDown(): void {
    this.focus.emit();
  }

  getTransform(): string {
    if (this.window.isMaximized) return 'none';
    if (!this.window.position) return 'none';
    return `translate(${this.window.position.x}px, ${this.window.position.y}px)`;
  }

  onResizeStart(e: MouseEvent, direction: string): void {
    e.preventDefault();
    e.stopPropagation();

    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStartPos = { x: e.clientX, y: e.clientY };
    this.focus.emit();

    const windowEl = this.windowElement?.nativeElement;
    if (windowEl) {
      const rect = windowEl.getBoundingClientRect();
      this.resizeStartSize = { width: rect.width, height: rect.height };
      this.resizeStartWindowPos = { x: rect.left, y: rect.top };
    }

    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeMove = (e: MouseEvent): void => {
    if (!this.isResizing) return;

    e.preventDefault();

    const deltaX = e.clientX - this.resizeStartPos.x;
    const deltaY = e.clientY - this.resizeStartPos.y;

    const windowEl = this.windowElement?.nativeElement;
    if (!windowEl) return;

    let newWidth = this.resizeStartSize.width;
    let newHeight = this.resizeStartSize.height;
    let newX = this.currentPosition.x;
    let newY = this.currentPosition.y;

    // Apply resize based on direction
    if (this.resizeDirection.includes('e')) {
      newWidth = Math.max(400, this.resizeStartSize.width + deltaX);
    }
    if (this.resizeDirection.includes('w')) {
      const widthChange = this.resizeStartSize.width - deltaX;
      if (widthChange >= 400) {
        newWidth = widthChange;
        newX = this.resizeStartWindowPos.x + deltaX;
      }
    }
    if (this.resizeDirection.includes('s')) {
      newHeight = Math.max(300, this.resizeStartSize.height + deltaY);
    }
    if (this.resizeDirection.includes('n')) {
      const heightChange = this.resizeStartSize.height - deltaY;
      if (heightChange >= 300) {
        newHeight = heightChange;
        newY = this.resizeStartWindowPos.y + deltaY;
      }
    }

    windowEl.style.width = `${newWidth}px`;
    windowEl.style.height = `${newHeight}px`;

    if (newX !== this.currentPosition.x || newY !== this.currentPosition.y) {
      this.currentPosition = { x: newX, y: newY };
      windowEl.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  };

  private onResizeEnd = (): void => {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.resizeDirection = '';

    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);

    // Emit position change if position changed during resize
    if (this.window.position &&
        (this.currentPosition.x !== this.window.position.x ||
         this.currentPosition.y !== this.window.position.y)) {
      this.positionChange.emit(this.currentPosition);
    }
  };
}
