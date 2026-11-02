import { Module } from "@nestjs/common";
import { InventoryApiService } from "./inventory-api.service";
import { InventoryController } from "./inventory.controller";

@Module({ controllers: [InventoryController], providers: [InventoryApiService] })
export class InventoryModule {}
