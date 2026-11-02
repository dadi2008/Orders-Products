import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { Server } from "socket.io";

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;
  async connectToRedis(url: string) { const publisher = new Redis(url); const subscriber = publisher.duplicate(); await Promise.all([publisher.ping(), subscriber.ping()]); this.adapterConstructor = createAdapter(publisher, subscriber); }
  createIOServer(port: number, options?: Record<string, unknown>) { const server = super.createIOServer(port, options) as Server; server.adapter(this.adapterConstructor); return server; }
}
