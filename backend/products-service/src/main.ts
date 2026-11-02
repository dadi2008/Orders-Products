import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  const brokers = process.env.KAFKA_BROKERS?.split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);
  if (!brokers?.length) throw new Error("KAFKA_BROKERS is required");
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: "products-service", brokers },
      consumer: { groupId: "products-service-orders" },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
}

void bootstrap();
