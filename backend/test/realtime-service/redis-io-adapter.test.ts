import { describe, expect, it, vi } from "vitest";
import { IoAdapter } from "@nestjs/platform-socket.io";

const dependencies = vi.hoisted(() => {
  const publisher = {
    ping: vi.fn().mockResolvedValue("PONG"),
    duplicate: vi.fn(),
  };
  const subscriber = { ping: vi.fn().mockResolvedValue("PONG") };
  publisher.duplicate.mockReturnValue(subscriber);

  return {
    Redis: vi.fn().mockImplementation(() => publisher),
    createAdapter: vi.fn().mockReturnValue(vi.fn()),
    publisher,
    subscriber,
  };
});

vi.mock("ioredis", () => ({ default: dependencies.Redis }));
vi.mock("@socket.io/redis-adapter", () => ({
  createAdapter: dependencies.createAdapter,
}));

import { RedisIoAdapter } from "../../realtime-service/src/infrastructure/redis-io.adapter";

describe("RedisIoAdapter", () => {
  it("creates and verifies Redis pub/sub clients", async () => {
    const adapter = new RedisIoAdapter({} as never);

    await adapter.connectToRedis("redis://redis:6379");

    expect(dependencies.Redis).toHaveBeenCalledWith("redis://redis:6379");
    expect(dependencies.publisher.duplicate).toHaveBeenCalledOnce();
    expect(dependencies.publisher.ping).toHaveBeenCalledOnce();
    expect(dependencies.subscriber.ping).toHaveBeenCalledOnce();
    expect(dependencies.createAdapter).toHaveBeenCalledWith(
      dependencies.publisher,
      dependencies.subscriber,
    );
  });

  it("attaches the Redis adapter to the Socket.IO server", async () => {
    const server = { adapter: vi.fn() };
    vi.spyOn(IoAdapter.prototype, "createIOServer").mockReturnValue(
      server as never,
    );
    const adapter = new RedisIoAdapter({} as never);

    await adapter.connectToRedis("redis://redis:6379");
    expect(adapter.createIOServer(3003)).toBe(server);
    expect(server.adapter).toHaveBeenCalledWith(
      dependencies.createAdapter.mock.results.at(-1)?.value,
    );
  });
});
