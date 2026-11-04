import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { DatabaseModule } from "database/database.module";
import { getKafkaBrokers } from "helpers/kafka";
import { OrdersController } from "orders/orders.controller";
import { OrdersOutboxPublisher } from "orders/outbox/orders-outbox.publisher";
import { OrdersService } from "orders/orders.service";
import { UsersController } from "users/users.controller";
import { UsersService } from "users/users.service";
import { WarehousesController } from "warehouses/warehouses.controller";

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
  controllers: [OrdersController, UsersController, WarehousesController],
  providers: [OrdersService, OrdersOutboxPublisher, UsersService],
})
export class OrdersModule {}
