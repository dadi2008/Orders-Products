import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

type OrderWithProducts = Prisma.OrderGetPayload<{ include: { products: { include: { prices: true } } } }>;
type OrderSummary = OrderWithProducts & { productCount: number; totals: Record<string, number> };

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, @Inject("EVENTS") private readonly events: ClientKafka) {}

  async findAll(): Promise<OrderSummary[]> {
    const orders = await this.prisma.order.findMany({ include: { products: { include: { prices: true } } }, orderBy: { createdAt: "desc" } });
    return orders.map((order) => this.toSummary(order));
  }

  async findOne(id: number): Promise<OrderSummary | null> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { products: { include: { prices: true } } } });
    return order ? this.toSummary(order) : null;
  }

  async create(dto: CreateOrderDto): Promise<OrderSummary> {
    const order = await this.prisma.order.create({ data: dto, include: { products: { include: { prices: true } } } });
    const result = this.toSummary(order);
    this.events.emit("inventory.order.created", result);
    return result;
  }

  async remove(id: number): Promise<OrderSummary | null> {
    const order = await this.findOne(id);
    if (!order) return null;
    await this.prisma.order.delete({ where: { id } });
    this.events.emit("inventory.order.deleted", { id });
    return order;
  }

  private toSummary(order: OrderWithProducts): OrderSummary {
    const amountsByCurrency = order.products.flatMap((product) => product.prices).reduce((result, price) => {
      result.set(price.currency, (result.get(price.currency) ?? 0) + Number(price.value));
      return result;
    }, new Map<string, number>());
    return { ...order, productCount: order.products.length, totals: Object.fromEntries(amountsByCurrency) };
  }
}
