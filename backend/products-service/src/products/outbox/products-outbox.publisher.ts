import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { ProductsPrismaService } from "database/prisma.service";
import type { OutboxEvent } from "generated/prisma/client";

const lockDuration = 30_000;
const publishInterval = 1_000;
const maximumAttempts = 5;

@Injectable()
export class ProductsOutboxPublisher
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ProductsOutboxPublisher.name);
  private timer?: ReturnType<typeof setInterval>;
  private isPublishing = false;

  constructor(
    private readonly prisma: ProductsPrismaService,
    @Inject("EVENTS") private readonly events: ClientKafka,
  ) {}

  onApplicationBootstrap(): void {
    void this.publishPending();
    this.timer = setInterval(() => void this.publishPending(), publishInterval);
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async publishPending(): Promise<void> {
    if (this.isPublishing) return;
    this.isPublishing = true;

    try {
      let event = await this.claimNext();
      while (event) {
        await this.publish(event);
        event = await this.claimNext();
      }
    } catch (error: unknown) {
      this.logger.error("Unable to publish outbox events", error);
    } finally {
      this.isPublishing = false;
    }
  }

  private async claimNext(): Promise<OutboxEvent | null> {
    const now = new Date();
    const event = await this.prisma.outboxEvent.findFirst({
      where: {
        publishedAt: null,
        deadLetteredAt: null,
        availableAt: { lte: now },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      orderBy: { createdAt: "asc" },
    });

    if (!event) return null;

    const lockedUntil = new Date(now.getTime() + lockDuration);
    const result = await this.prisma.outboxEvent.updateMany({
      where: {
        id: event.id,
        publishedAt: null,
        deadLetteredAt: null,
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      data: { lockedUntil },
    });

    return result.count ? event : null;
  }

  private async publish(event: OutboxEvent): Promise<void> {
    try {
      await lastValueFrom(
        this.events.emit(event.topic, {
          key: event.key,
          value: event.payload,
        }),
      );
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { publishedAt: new Date(), lockedUntil: null, lastError: null },
      });
    } catch (error: unknown) {
      await this.handleFailure(event, error);
    }
  }

  private async handleFailure(
    event: OutboxEvent,
    error: unknown,
  ): Promise<void> {
    const attempts = event.attempts + 1;
    const lastError = error instanceof Error ? error.message : String(error);

    if (attempts < maximumAttempts) {
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          attempts,
          lastError,
          lockedUntil: null,
          availableAt: new Date(Date.now() + 1_000 * 2 ** attempts),
        },
      });
      return;
    }

    await lastValueFrom(
      this.events.emit(`${event.topic}.dlq`, {
        key: event.key,
        value: {
          eventId: event.id,
          topic: event.topic,
          key: event.key,
          payload: event.payload,
          attempts,
          failedAt: new Date().toISOString(),
          error: lastError,
        },
      }),
    );
    await this.prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        attempts,
        lastError,
        lockedUntil: null,
        deadLetteredAt: new Date(),
      },
    });
    this.logger.error(`Outbox event ${event.id} moved to ${event.topic}.dlq`);
  }
}
