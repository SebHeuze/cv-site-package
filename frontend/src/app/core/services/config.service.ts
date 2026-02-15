import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  grafanaPublicDashboardUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Load configuration from assets/config.json at application startup
   */
  async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/assets/config.json')
      );
      console.log('Configuration loaded:', this.config);
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Get a configuration value by key
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!this.config) {
      throw new Error('Configuration not loaded. Ensure ConfigService.loadConfig() is called before accessing config.');
    }
    return this.config[key];
  }

  /**
   * Get the entire configuration object
   */
  getAll(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Ensure ConfigService.loadConfig() is called before accessing config.');
    }
    return this.config;
  }
}
