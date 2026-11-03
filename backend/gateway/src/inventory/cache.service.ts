import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly pending = new Map<string, Promise<unknown>>();

  constructor(config: ConfigService) {
    this.redis = new Redis(
      config.get("REDIS_URL") ?? "redis://localhost:6379",
      {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      },
    );
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.read<T>(key);
    if (cached !== undefined) return cached;
    const local = this.pending.get(key) as Promise<T> | undefined;
    if (local) return local;
    const task = this.loadOnce(key, ttlSeconds, load);
    this.pending.set(key, task);
    try {
      return await task;
    } finally {
      this.pending.delete(key);
    }
  }

  async invalidate(...keys: string[]): Promise<void> {
    if (keys.length) await this.redis.del(...keys).catch(() => undefined);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    const keys: string[] = [];
    let cursor = "0";
    do {
      const [next, found] = await this.redis.scan(
        cursor,
        "MATCH",
        `${prefix}*`,
        "COUNT",
        100,
      );
      cursor = next;
      keys.push(...found);
    } while (cursor !== "0");
    if (keys.length) await this.redis.del(...keys);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  private async loadOnce<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const lockKey = `lock:${key}`;
    const lock = await this.redis
      .set(lockKey, "1", "PX", 10_000, "NX")
      .catch(() => null);
    if (!lock) {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const cached = await this.read<T>(key);
        if (cached !== undefined) return cached;
      }
    }
    try {
      const value = await load();
      await this.redis
        .set(key, JSON.stringify(value), "EX", ttlSeconds)
        .catch(() => undefined);
      return value;
    } finally {
      if (lock) await this.redis.del(lockKey).catch(() => undefined);
    }
  }

  private async read<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key).catch(() => null);
    return value ? (JSON.parse(value) as T) : undefined;
  }
}
