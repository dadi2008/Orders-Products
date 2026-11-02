import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { OrdersPrismaService } from "database/prisma.service";
import { Prisma } from "generated/prisma/client";
import { CreateOrderDto } from "orders/dto/create-order.dto";

type OrderRecord = Prisma.OrderGetPayload<Record<string, never>>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: OrdersPrismaService,
    @Inject("EVENTS") private readonly events: ClientKafka,
  ) {}

  findAll(): Promise<OrderRecord[]> {
    return this.prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  }

  findOne(id: number): Promise<OrderRecord | null> {
    return this.prisma.order.findUnique({ where: { id } });
  }

  async create(dto: CreateOrderDto): Promise<OrderRecord> {
    return this.prisma.order.create({ data: dto });
  }

  async remove(id: number): Promise<OrderRecord | null> {
    const order = await this.findOne(id);
    if (!order) return null;
    await this.prisma.order.delete({ where: { id } });
    this.events.emit("inventory.order.deleted", {
      id,
      occurredAt: new Date().toISOString(),
    });
    return order;
  }
}
