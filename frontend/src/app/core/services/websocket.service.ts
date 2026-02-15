import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { TradeTick } from '../models/trade-tick.model';

export interface PriceUpdate {
  price: number;
  symbol: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client?: Client;
  private priceSubject = new Subject<PriceUpdate>();
  private tradeSubject = new Subject<TradeTick>();
  private connected = false;

  constructor() {}

  // Connect to WebSocket and subscribe to price updates
  connectToPriceStream(): Observable<PriceUpdate> {
    if (!this.connected) {
      this.connect();
    }
    return this.priceSubject.asObservable();
  }

  // Subscribe to trade feed
  connectToTradeStream(): Observable<TradeTick> {
    if (!this.connected) {
      this.connect();
    }
    return this.tradeSubject.asObservable();
  }

  private connect(): void {
    // Create STOMP client with SockJS - connect directly to backend
    // Use secure protocol (https/wss) if page is loaded over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const wsUrl = `${protocol}//${host}${port}/ws`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as any,
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Handle connection
    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.connected = true;

      // Subscribe to price updates
      this.client?.subscribe('/topic/price', (message: IMessage) => {
        try {
          const priceUpdate: PriceUpdate = JSON.parse(message.body);
          this.priceSubject.next(priceUpdate);
        } catch (error) {
          console.error('Error parsing price update:', error);
        }
      });

      // Subscribe to trade feed
      this.client?.subscribe('/topic/trades', (message: IMessage) => {
        try {
          const tradeTick: TradeTick = JSON.parse(message.body);
          this.tradeSubject.next(tradeTick);
        } catch (error) {
          console.error('Error parsing trade tick:', error);
        }
      });
    };

    // Handle errors
    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connected = false;
    };

    // Handle WebSocket errors
    this.client.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
      this.connected = false;
    };

    // Activate the client
    this.client.activate();
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }
}
