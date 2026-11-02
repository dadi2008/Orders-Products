import { Module } from "@nestjs/common";
import { InventoryApiService } from "inventory/inventory-api.service";
import { InventoryController } from "inventory/inventory.controller";

@Module({
  controllers: [InventoryController],
  providers: [InventoryApiService],
})
export class InventoryModule {}
