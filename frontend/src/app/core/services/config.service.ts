import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  grafanaPublicDashboardUrl: string;
  apiBaseUrl: string;
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
  private readonly defaults: AppConfig = {
    grafanaPublicDashboardUrl: '',
    apiBaseUrl: '',
  };

  async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/assets/config.json')
      );
      console.log('Configuration loaded:', this.config);
    } catch (error) {
      console.warn('Failed to load configuration, using defaults:', error);
      this.config = { ...this.defaults };
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
