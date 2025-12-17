import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesktopWindow } from '../desktop/desktop';
import { CvTerminal } from '../cv-terminal/cv-terminal';
import { TradingGame } from '../trading-game/trading-game';

@Component({
  selector: 'app-window',
  imports: [CommonModule, CvTerminal, TradingGame],
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

  ngAfterViewInit(): void {
    this.setupDragListeners();
    if (this.window.position) {
      this.currentPosition = { ...this.window.position };
    }
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
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
}
