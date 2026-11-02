import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { readOrderId } from "helpers/order-events";
import { ProductsService } from "products/products.service";

@Controller()
export class OrderEventsController {
  private readonly logger = new Logger(OrderEventsController.name);

  constructor(private readonly products: ProductsService) {}

  @EventPattern("inventory.order.deleted")
  async handleOrderDeleted(@Payload() event: unknown): Promise<void> {
    const orderId = readOrderId(event);
    const result = await this.products.removeByOrder(orderId);
    this.logger.log(
      `Removed ${String(result.count)} products for deleted order ${String(orderId)}`,
    );
  }
}
