import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RedisIoAdapter } from "./infrastructure/redis-io.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis(process.env.REDIS_URL ?? "redis://localhost:6379");
  app.useWebSocketAdapter(redisAdapter);
  await app.listen(process.env.PORT ?? 3003);
}

void bootstrap();
