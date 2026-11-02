import { Module } from "@nestjs/common";
import { DatabaseModule } from "database/database.module";
import { OrderEventsController } from "products/order-events.controller";
import { ProductsController } from "products/products.controller";
import { ProductsService } from "products/products.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController, OrderEventsController],
  providers: [ProductsService],
})
export class ProductsModule {}
