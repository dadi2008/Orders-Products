import { Module } from "@nestjs/common";
import { InventoryApiService } from "inventory/inventory-api.service";
import { InventoryController } from "inventory/inventory.controller";
import { InventoryResolver } from "inventory/graphql/inventory.resolver";
import { MediaStorageService } from "inventory/media-storage.service";
import { CacheService } from "inventory/cache.service";

@Module({
  controllers: [InventoryController],
  providers: [InventoryApiService, InventoryResolver, MediaStorageService, CacheService],
})
export class InventoryModule {}
