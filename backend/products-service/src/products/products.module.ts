import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { DatabaseModule } from "database/database.module";
import { getKafkaBrokers } from "helpers/kafka";
import { OrderEventsController } from "products/order-events.controller";
import { ProductsOutboxPublisher } from "products/outbox/products-outbox.publisher";
import { ProductsController } from "products/products.controller";
import { ProductsService } from "products/products.service";

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.registerAsync([
      {
        name: "EVENTS",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: "products-service-producer",
              brokers: getKafkaBrokers(config),
            },
            producerOnlyMode: true,
          },
        }),
      },
    ]),
  ],
  controllers: [ProductsController, OrderEventsController],
  providers: [ProductsService, ProductsOutboxPublisher],
})
export class ProductsModule {}
