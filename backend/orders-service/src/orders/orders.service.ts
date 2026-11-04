import { Injectable } from "@nestjs/common";
import { OrdersPrismaService } from "database/prisma.service";
import { Prisma } from "generated/prisma/client";
import { CreateOrderDto } from "orders/dto/create-order.dto";

type OrderRecord = Prisma.OrderGetPayload<Record<string, never>>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: OrdersPrismaService) {}

  findAll(search?: string): Promise<OrderRecord[]> {
    const query = normalizeSearch(search);
    return this.prisma.order.findMany({
      ...(query
        ? { where: { title: { contains: query, mode: "insensitive" } } }
        : {}),
      orderBy: { createdAt: "desc" },
    });
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

function normalizeSearch(search?: string): string | undefined {
  const value = search?.trim().slice(0, 100);
  return value?.length ? value : undefined;
}
