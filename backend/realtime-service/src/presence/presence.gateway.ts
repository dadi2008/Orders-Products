import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { OnModuleDestroy } from "@nestjs/common";
import { verify } from "jsonwebtoken";
import { Server, Socket } from "socket.io";

interface AccessTokenPayload {
  sub?: unknown;
  type?: unknown;
}

const browserSessionIdPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

@WebSocketGateway({
  namespace: "/presence",
  cors: { origin: process.env.WEB_ORIGIN ?? "http://localhost:3005" },
})
export class PresenceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer() server!: Server;
  private clockTimer?: ReturnType<typeof setInterval>;
  private readonly accessSecret: string;

  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret.trim().length < 32) {
      throw new Error("JWT_ACCESS_SECRET must be configured with at least 32 characters");
    }
    this.accessSecret = secret;
  }

  afterInit() {
    this.clockTimer = setInterval(() => {
      this.publishServerTime();
    }, 1_000);
  }

  onModuleDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const auth = client.handshake.auth as Record<string, unknown>;
    const accessToken = auth.accessToken;
    const browserSessionId = auth.browserSessionId;
    if (
      typeof accessToken !== "string" ||
      typeof browserSessionId !== "string" ||
      !browserSessionIdPattern.test(browserSessionId) ||
      !this.isValidAccessToken(accessToken)
    ) {
      client.disconnect(true);
      return;
    }

    setBrowserSessionId(client, browserSessionId);
    await client.join("presence");
    client.emit("server-time", { timestamp: Date.now() });
    await this.publish();
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    if (!getBrowserSessionId(client)) return;
    await this.publish();
  }

  private async publish() {
    const clients = await this.server.in("presence").fetchSockets();
    const activeSessions = clients.reduce<Set<string>>((sessions, client) => {
      const browserSessionId = getBrowserSessionId(client);
      if (browserSessionId) sessions.add(browserSessionId);
      return sessions;
    }, new Set()).size;
    this.server.emit("presence", { activeSessions });
  }

  private publishServerTime() {
    this.server.local.emit("server-time", { timestamp: Date.now() });
  }

  private isValidAccessToken(accessToken: string): boolean {
    try {
      const payload = verify(
        accessToken,
        this.accessSecret,
      ) as AccessTokenPayload;
      return payload.type === "access" && typeof payload.sub === "number";
    } catch {
      return false;
    }
  }
}

function setBrowserSessionId(client: Socket, browserSessionId: string): void {
  const data = client.data as Record<string, unknown>;
  data.browserSessionId = browserSessionId;
}

function getBrowserSessionId(socket: { data: unknown }): string | undefined {
  const { data } = socket;
  if (typeof data !== "object" || data === null) return undefined;
  const browserSessionId = (data as Record<string, unknown>).browserSessionId;
  return typeof browserSessionId === "string" ? browserSessionId : undefined;
}
