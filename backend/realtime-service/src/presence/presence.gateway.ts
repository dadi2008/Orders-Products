import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: true } })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  async handleConnection(@ConnectedSocket() client: Socket) {
    await client.join("presence");
    await this.publish();
  }
  async handleDisconnect() {
    await this.publish();
  }
  private async publish() {
    const clients = await this.server.in("presence").fetchSockets();
    this.server.emit("presence", { activeSessions: clients.length });
  }
}
