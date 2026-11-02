import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { DatabaseModule } from "database/database.module";
import { getKafkaBrokers } from "helpers/kafka";
import { OrdersController } from "orders/orders.controller";
import { OrdersService } from "orders/orders.service";

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
              clientId: "orders-service",
              brokers: getKafkaBrokers(config),
            },
            producerOnlyMode: true,
          },
        }),
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
