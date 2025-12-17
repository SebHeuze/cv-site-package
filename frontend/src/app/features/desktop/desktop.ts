import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Window } from '../window/window';
import { DesktopIcon } from './desktop-icon/desktop-icon';

export interface DesktopWindow {
  id: string;
  title: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
}

@Component({
  selector: 'app-desktop',
  imports: [CommonModule, Window, DesktopIcon],
  templateUrl: './desktop.html',
  styleUrl: './desktop.scss',
})
export class Desktop implements OnInit, OnDestroy {
  windows: DesktopWindow[] = [];
  maxZIndex = 1000;
  currentTime = new Date();
  activeWindowId: string | null = null;
  private timeInterval?: number;

  icons = [
    { id: 'cv-terminal', label: 'CV_Terminal', icon: 'assets/icons/terminal.svg', component: 'cv-terminal' },
    { id: 'trading-game', label: 'Trading_Game', icon: 'assets/icons/trading.svg', component: 'trading-game' }
  ];

  ngOnInit(): void {
    this.timeInterval = window.setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  openWindow(component: string): void {
    const existingWindow = this.windows.find(w => w.component === component);

    if (existingWindow) {
      if (existingWindow.isMinimized) {
        this.restoreWindow(existingWindow.id);
      }
      this.bringToFront(existingWindow.id);
      return;
    }

    const title = component === 'cv-terminal' ? 'CV Terminal' : 'Trading Game';

    // Calculate center position for all windows
    const windowWidth = component === 'trading-game' ? 1200 : 800;
    const windowHeight = component === 'trading-game' ? 800 : 600;
    const position = {
      x: (window.innerWidth - windowWidth) / 2,
      y: (window.innerHeight - windowHeight - 48) / 2 // 48px for taskbar
    };

    const newWindow: DesktopWindow = {
      id: `window-${Date.now()}`,
      title,
      component,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: ++this.maxZIndex,
      position
    };

    this.windows.push(newWindow);
  }

  closeWindow(windowId: string): void {
    const index = this.windows.findIndex(w => w.id === windowId);
    if (index !== -1) {
      this.windows.splice(index, 1);
    }
  }

  minimizeWindow(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.isMinimized = true;
    }
  }

  restoreWindow(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.isMinimized = false;
      window.isMaximized = false;
      this.bringToFront(windowId);
    }
  }

  maximizeWindow(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.isMaximized = !window.isMaximized;
      this.bringToFront(windowId);
    }
  }

  bringToFront(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.zIndex = ++this.maxZIndex;
      this.activeWindowId = windowId;
    }
  }

  getOpenWindows(): DesktopWindow[] {
    return this.windows.filter(w => w.isOpen && !w.isMinimized);
  }

  getTaskbarWindows(): DesktopWindow[] {
    return this.windows.filter(w => w.isOpen);
  }

  isAppOpen(component: string): boolean {
    return this.windows.some(w => w.component === component && w.isOpen);
  }

  isAppActive(component: string): boolean {
    if (!this.activeWindowId) return false;
    const activeWindow = this.windows.find(w => w.id === this.activeWindowId);
    return activeWindow?.component === component && !activeWindow.isMinimized;
  }

  clearActiveWindow(): void {
    this.activeWindowId = null;
  }

  updateWindowPosition(windowId: string, position: { x: number; y: number }): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.position = position;
    }
  }
}
