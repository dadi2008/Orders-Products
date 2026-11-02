import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { Server, Socket } from "socket.io";

class RedisIoAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;

  async connectToRedis(url: string) {
    const publisher = new Redis(url);
    const subscriber = publisher.duplicate();
    await Promise.all([publisher.ping(), subscriber.ping()]);
    this.adapterConstructor = createAdapter(publisher, subscriber);
  }

  createIOServer(port: number, options?: Record<string, unknown>) {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.adapterConstructor);
    return server;
  }
}

@WebSocketGateway({ cors: { origin: true } })
class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    client.join("presence");
    this.publish();
  }

  handleDisconnect() { this.publish(); }

  private async publish() {
    const clients = await this.server.in("presence").fetchSockets();
    this.server.emit("presence", { activeSessions: clients.length });
  }
}

@Module({ providers: [PresenceGateway] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis(process.env.REDIS_URL ?? "redis://localhost:6379");
  app.useWebSocketAdapter(redisAdapter);
  await app.listen(process.env.PORT ?? 3003);
}

bootstrap();
