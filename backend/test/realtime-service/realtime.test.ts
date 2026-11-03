import { describe, expect, it, vi } from "vitest";
import { sign } from "jsonwebtoken";
import { PresenceGateway } from "../../realtime-service/src/presence/presence.gateway";

describe("PresenceGateway", () => {
  it("joins clients to the presence room and broadcasts the active count", async () => {
    const emit = vi.fn();
    const server = {
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([
          { data: { browserSessionId: "11111111-1111-1111-1111-111111111111" } },
          { data: { browserSessionId: "22222222-2222-2222-2222-222222222222" } },
        ]),
      }),
      emit,
    };
    const client = {
      handshake: {
        auth: {
          accessToken: sign(
            { sub: 1, type: "access" },
            "development-access-secret-change-me",
          ),
          browserSessionId: "11111111-1111-1111-1111-111111111111",
        },
      },
      data: {},
      join: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PresenceGateway();
    gateway.server = server as never;

    await gateway.handleConnection(client as never);
    await gateway.handleDisconnect(client as never);

    expect(client.join).toHaveBeenCalledWith("presence");
    expect(emit).toHaveBeenCalledWith("presence", { activeSessions: 2 });
    expect(emit).toHaveBeenCalledTimes(2);
  });
});
