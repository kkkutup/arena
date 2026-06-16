import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MarketService } from './market.service';

// Broadcasts live prices to connected clients ~1/s on the `prices` event.
@WebSocketGateway({ cors: { origin: '*' } })
export class MarketGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer() server!: Server;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly market: MarketService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      this.server.emit('prices', {
        prices: this.market.getPrices(),
        at: this.market.getUpdatedAt(),
      });
    }, 1000);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
