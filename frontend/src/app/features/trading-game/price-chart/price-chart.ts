import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createChart, IChartApi, Time, ColorType, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { WebsocketService } from '../../../core/services/websocket.service';
import { TradingApiService } from '../../../core/services/trading-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-price-chart',
  imports: [CommonModule],
  templateUrl: './price-chart.html',
  styleUrl: './price-chart.scss',
})
export class PriceChart implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Output() priceUpdate = new EventEmitter<number>();

  currentPrice = 0;
  private chart?: IChartApi;
  private candlestickSeries?: ISeriesApi<'Candlestick'>;
  private lastCandle?: CandlestickData;
  private priceSubscription?: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private tradingApi: TradingApiService
  ) {}

  ngOnInit(): void {
    this.initChart();
    this.connectToWebSocket();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.remove();
    }
    if (this.priceSubscription) {
      this.priceSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  private connectToWebSocket(): void {
    this.priceSubscription = this.websocketService.connectToPriceStream().subscribe({
      next: (update) => {
        console.log('Received price update:', update.price);
        this.currentPrice = update.price;
        this.updatePrice(update.price);
        this.priceUpdate.emit(update.price);
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      }
    });
  }

  private initChart(): void {
    const container = this.chartContainer.nativeElement;

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2b2b43' },
        horzLines: { color: '#2b2b43' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: true,
      },
    });

    // Add candlestick series for price visualization
    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Initialize with some historical data
    this.initializeHistoricalData();

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  private initializeHistoricalData(): void {
    // Fetch historical price data from backend
    this.tradingApi.getPriceHistory().subscribe({
      next: (history) => {
        console.log('Loaded price history:', history.length, 'candlesticks');

        if (history.length > 0 && this.candlestickSeries) {
          // Convert and set all historical candlesticks
          const candlesticks: CandlestickData[] = history.map(candle => ({
            time: candle.time as Time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }));

          this.candlestickSeries.setData(candlesticks);

          // Set the last candle for future updates
          const lastHistoricalCandle = history[history.length - 1];
          this.lastCandle = {
            time: lastHistoricalCandle.time as Time,
            open: lastHistoricalCandle.open,
            high: lastHistoricalCandle.high,
            low: lastHistoricalCandle.low,
            close: lastHistoricalCandle.close,
          };

          console.log('Chart initialized with historical data');
        } else {
          console.log('No historical data available, starting fresh');
          this.lastCandle = undefined;
        }
      },
      error: (error) => {
        console.error('Error loading price history:', error);
        this.lastCandle = undefined;
      }
    });
  }

  updatePrice(price: number): void {
    if (!this.candlestickSeries) {
      console.warn('Candlestick series not initialized');
      return;
    }

    const time = Math.floor(Date.now() / 1000) as Time;

    console.log('Updating chart with price:', price, 'at time:', time);

    if (!this.lastCandle) {
      // Create first candle
      this.lastCandle = {
        time,
        open: price,
        high: price,
        low: price,
        close: price,
      };
      this.candlestickSeries.update(this.lastCandle);
    } else {
      // Update existing candle or create new one
      // If same second, update the candle
      if (this.lastCandle.time === time) {
        this.lastCandle = {
          time,
          open: this.lastCandle.open,
          high: Math.max(this.lastCandle.high, price),
          low: Math.min(this.lastCandle.low, price),
          close: price,
        };
      } else {
        // New time period, create new candle
        this.lastCandle = {
          time,
          open: price,
          high: price,
          low: price,
          close: price,
        };
      }
      this.candlestickSeries.update(this.lastCandle);
    }
  }

  private handleResize = (): void => {
    if (this.chart && this.chartContainer) {
      const container = this.chartContainer.nativeElement;
      this.chart.resize(container.clientWidth, 500);
    }
  };
}
