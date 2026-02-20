import { Component } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-system-monitor',
  imports: [],
  templateUrl: './system-monitor.html',
  styleUrl: './system-monitor.scss',
})
export class SystemMonitor {
  isLoading = true;
  hasError = false;
  safeGrafanaUrl: SafeResourceUrl | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private configService: ConfigService
  ) {
    try {
      const grafanaUrl = this.configService.get('grafanaPublicDashboardUrl');

      if (!grafanaUrl || grafanaUrl.includes('PLACEHOLDER')) {
        this.hasError = true;
        this.isLoading = false;
        console.warn('Grafana dashboard URL not configured');
      } else {
        // Append dark theme parameter to match desktop theme
        const urlWithTheme = `${grafanaUrl}?theme=dark`;
        this.safeGrafanaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithTheme);
      }
    } catch (error) {
      console.error('Failed to load Grafana configuration:', error);
      this.hasError = true;
      this.isLoading = false;
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
