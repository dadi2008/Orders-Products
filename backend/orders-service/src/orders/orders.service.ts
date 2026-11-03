import { Injectable } from "@nestjs/common";
import { OrdersPrismaService } from "database/prisma.service";
import { Prisma } from "generated/prisma/client";
import { CreateOrderDto } from "orders/dto/create-order.dto";

type OrderRecord = Prisma.OrderGetPayload<Record<string, never>>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: OrdersPrismaService) {}

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
    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findUnique({ where: { id } });
      if (!order) return null;

      const occurredAt = new Date().toISOString();
      await transaction.order.delete({ where: { id } });
      await transaction.outboxEvent.create({
        data: {
          topic: "inventory.order.deleted",
          key: String(id),
          payload: { id, occurredAt },
        },
      });
      return order;
    });
  }
}
