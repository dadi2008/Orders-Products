import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { DatabaseModule } from "../database/database.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({ imports: [DatabaseModule, ClientsModule.registerAsync([{ name: "EVENTS", imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({ transport: Transport.KAFKA, options: { client: { clientId: "orders-service", brokers: (config.get<string>("KAFKA_BROKERS") ?? "localhost:9092").split(",") } } }) }])], controllers: [OrdersController], providers: [OrdersService] })
export class OrdersModule {}
