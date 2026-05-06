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

  icons: { id: string; label: string; icon: string; component?: string; url?: string }[] = [
    { id: 'cv-terminal', label: 'CV_Terminal', icon: 'assets/icons/terminal.svg', component: 'cv-terminal' },
    { id: 'trading-game', label: 'Trading_Simulator', icon: 'assets/icons/trading.svg', component: 'trading-game' },
    { id: 'cv-viewer-fr', label: 'CV_Français', icon: 'assets/icons/pdf.svg', component: 'cv-viewer-fr' },
    { id: 'cv-viewer-en', label: 'CV_English', icon: 'assets/icons/pdf.svg', component: 'cv-viewer-en' },
    { id: 'snake-game', label: 'Snake_Game', icon: 'assets/icons/snake.svg', component: 'snake-game' },
    { id: 'system-monitor', label: 'System_Monitor', icon: 'assets/icons/system-monitor.svg', component: 'system-monitor' },
    { id: 'github-package', label: 'GitHub_Package', icon: 'assets/icons/github.svg', url: 'https://github.com/SebHeuze/cv-site-package' },
    { id: 'github-gitops', label: 'GitHub_GitOps', icon: 'assets/icons/github.svg', url: 'https://github.com/SebHeuze/cv-site-gitops' }
  ];

  ngOnInit(): void {
    this.timeInterval = window.setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // Auto-open terminal on mobile
    if (this.isMobile()) {
      this.openWindow('cv-terminal');
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
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

    let title = 'Unknown';
    if (component === 'cv-terminal') title = 'CV Terminal';
    else if (component === 'trading-game') title = 'Trading Simulator';
    else if (component === 'cv-viewer-fr') title = 'CV Document (FR)';
    else if (component === 'cv-viewer-en') title = 'Resume (EN)';
    else if (component === 'snake-game') title = 'Snake Game';
    else if (component === 'system-monitor') title = 'System Monitor';

    // Calculate cascading position with offset for each new window
    const offset = this.windows.length * 30; // 30px offset for each window
    const windowWidth = 800;
    const windowHeight = 600;
    const baseX = 200; // Start with space for dock icons
    const baseY = 100; // Start with space below top bar
    const position = {
      x: baseX + offset,
      y: baseY + offset
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

  openUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  getAppIcon(component: string): string {
    const icon = this.icons.find(i => i.component === component);
    return icon ? icon.icon : 'assets/icons/terminal.svg';
  }
}
