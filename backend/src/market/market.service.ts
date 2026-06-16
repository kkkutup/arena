import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { INSTRUMENTS, SYMBOLS } from './instruments';

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

// Server-authoritative price cache. Keeps a live WebSocket to Binance's public
// market-data host so fills and liquidations (B3) use a true, moving price.
@Injectable()
export class MarketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketService.name);
  private prices: Record<string, number> = {};
  private updatedAt = 0;
  private ws: WebSocket | null = null;
  private closed = false;
  private readonly rest: string;
  private readonly wsUrl: string;

  constructor(config: ConfigService) {
    this.rest = config.get<string>('BINANCE_REST') ?? 'https://data-api.binance.vision';
    this.wsUrl = config.get<string>('BINANCE_WS') ?? 'wss://data-stream.binance.vision/ws';
  }

  async onModuleInit(): Promise<void> {
    await this.seed();
    this.connect();
  }

  onModuleDestroy(): void {
    this.closed = true;
    this.ws?.close();
  }

  private async seed(): Promise<void> {
    try {
      const url = `${this.rest}/api/v3/ticker/price?symbols=${encodeURIComponent(
        JSON.stringify(SYMBOLS),
      )}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as { symbol: string; price: string }[];
      for (const d of data) this.prices[d.symbol] = parseFloat(d.price);
      this.updatedAt = Date.now();
    } catch {
      /* WS will populate shortly */
    }
  }

  private connect(): void {
    const ws = new WebSocket(this.wsUrl);
    this.ws = ws;
    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          method: 'SUBSCRIBE',
          params: SYMBOLS.map((s) => s.toLowerCase() + '@miniTicker'),
          id: 1,
        }),
      );
      this.logger.log('Binance market WS connected');
    });
    ws.on('message', (buf: WebSocket.RawData) => {
      try {
        const m = JSON.parse(buf.toString()) as { s?: string; c?: string };
        if (m.s && m.c) {
          this.prices[m.s] = parseFloat(m.c);
          this.updatedAt = Date.now();
        }
      } catch {
        /* ignore */
      }
    });
    ws.on('close', () => {
      if (!this.closed) setTimeout(() => this.connect(), 1500);
    });
    ws.on('error', () => {
      try {
        ws.close();
      } catch {
        /* noop */
      }
    });
  }

  getInstruments() {
    return INSTRUMENTS;
  }
  getPrices(): Record<string, number> {
    return this.prices;
  }
  getPrice(symbol: string): number | undefined {
    return this.prices[symbol];
  }
  getUpdatedAt(): number {
    return this.updatedAt;
  }

  async getCandles(symbol: string, interval = '1m', limit = 200): Promise<Candle[]> {
    const url = `${this.rest}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const raw = (await res.json()) as unknown[][];
    return raw.map((k) => ({
      time: Math.floor((k[0] as number) / 1000),
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
    }));
  }
}
