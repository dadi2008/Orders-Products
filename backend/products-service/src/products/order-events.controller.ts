import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientKafka, EventPattern, Payload } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { readOrderId } from "helpers/order-events";
import { retry } from "helpers/retry";
import { ProductsService } from "products/products.service";

@Controller()
export class OrderEventsController {
  private readonly logger = new Logger(OrderEventsController.name);

  constructor(
    private readonly products: ProductsService,
    @Inject("EVENTS") private readonly events: ClientKafka,
  ) {}

  @EventPattern("inventory.order.deleted")
  async handleOrderDeleted(@Payload() event: unknown): Promise<void> {
    let orderId: number;

    try {
      orderId = readOrderId(event);
    } catch (error: unknown) {
      await this.moveToDeadLetter(event, error);
      return;
    }

    try {
      const result = await retry(() => this.products.removeByOrder(orderId), 3);
      this.logger.log(
        `Removed ${String(result.count)} products for deleted order ${String(orderId)}`,
      );
    } catch (error: unknown) {
      await this.moveToDeadLetter(event, error);
    }
  }

  private async moveToDeadLetter(
    event: unknown,
    error: unknown,
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await lastValueFrom(
      this.events.emit("inventory.order.deleted.dlq", {
        key: getEventKey(event),
        value: {
          event,
          error: errorMessage,
          failedAt: new Date().toISOString(),
        },
      }),
    );
    this.logger.error(`Order deletion event moved to DLQ: ${errorMessage}`);
  }
}

function getEventKey(event: unknown): string {
  if (typeof event === "object" && event !== null && "id" in event) {
    const { id } = event;
    if (typeof id === "number" && Number.isSafeInteger(id)) return String(id);
  }

  return "invalid";
}
