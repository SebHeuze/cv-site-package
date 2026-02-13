import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-system-monitor',
  imports: [CommonModule],
  templateUrl: './system-monitor.html',
  styleUrl: './system-monitor.scss',
})
export class SystemMonitor {
  isLoading = true;
  hasError = false;
  safeGrafanaUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {
    const grafanaUrl = environment.grafanaPublicDashboardUrl;

    if (!grafanaUrl) {
      this.hasError = true;
      this.isLoading = false;
    } else {
      // Append dark theme parameter to match desktop theme
      const urlWithTheme = `${grafanaUrl}?theme=dark`;
      this.safeGrafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithTheme);
    }
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  onIframeError(): void {
    this.isLoading = false;
    this.hasError = true;
  }
}
