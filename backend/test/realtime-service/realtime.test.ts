import { describe, expect, it, vi } from "vitest";
import { PresenceGateway } from "../../realtime-service/src/presence/presence.gateway";

describe("PresenceGateway", () => {
  it("joins clients to the presence room and broadcasts the active count", async () => {
    const emit = vi.fn();
    const server = {
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([{}, {}]),
      }),
      emit,
    };
    const client = { join: vi.fn().mockResolvedValue(undefined) };
    const gateway = new PresenceGateway();
    gateway.server = server as never;

    await gateway.handleConnection(client as never);
    await gateway.handleDisconnect();

    expect(client.join).toHaveBeenCalledWith("presence");
    expect(emit).toHaveBeenCalledWith("presence", { activeSessions: 2 });
    expect(emit).toHaveBeenCalledTimes(2);
  });
});
