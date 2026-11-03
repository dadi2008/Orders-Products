import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "app.module";
import { getKafkaBrokers } from "helpers/kafka";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  const brokers = getKafkaBrokers(new ConfigService());
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
