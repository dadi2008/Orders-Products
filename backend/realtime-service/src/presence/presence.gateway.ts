import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
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
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

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

  private isValidAccessToken(accessToken: string): boolean {
    try {
      const payload = verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET ?? "development-access-secret-change-me",
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
