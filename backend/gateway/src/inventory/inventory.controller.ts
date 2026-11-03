import { Controller, Get } from "@nestjs/common";

@Controller("api")
export class InventoryController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}
