import { Injectable } from "@nestjs/common";
import { ProductsPrismaService } from "database/prisma.service";
import { CreateProductDto } from "products/dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: ProductsPrismaService) {}
  async findAll(type?: string) {
    const products = await this.prisma.product.findMany({
      where: type ? { type } : undefined,
      include: { prices: true },
      orderBy: { receivedAt: "desc" },
    });
    return products.map((product) => ({
      ...product,
      order: { id: product.orderId, title: product.orderTitle },
    }));
  }
  async findTypes(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      distinct: ["type"],
      select: { type: true },
      orderBy: { type: "asc" },
    });
    return products.map((product) => product.type);
  }
  async findByOrder(orderId: number) {
    const products = await this.prisma.product.findMany({
      where: { orderId },
      include: { prices: true },
    });
    return products.map((product) => ({
      ...product,
      order: { id: product.orderId, title: product.orderTitle },
    }));
  }

  async create(input: CreateProductDto) {
    const receivedAt = new Date();
    const guaranteeEnd = new Date(receivedAt);
    guaranteeEnd.setFullYear(guaranteeEnd.getFullYear() + 3);
    const serialNumber = input.serialNumber?.trim() ?? "";
    const type = input.type?.trim() ?? "";
    const product = await this.prisma.product.create({
      data: {
        serialNumber:
          serialNumber.length > 0
            ? serialNumber
            : `SN-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`,
        title: input.title.trim(),
        type: type.length > 0 ? type : "Мониторы",
        photoUrl: input.photoUrl,
        specification: "",
        guaranteeStart: receivedAt,
        guaranteeEnd,
        receivedAt,
        orderId: input.orderId,
        orderTitle: input.orderTitle,
        prices: {
          create: { value: 0, currency: "USD", isDefault: true },
        },
      },
      include: { prices: true },
    });
    return {
      ...product,
      order: { id: product.orderId, title: product.orderTitle },
    };
  }

  removeByOrder(orderId: number) {
    return this.prisma.product.deleteMany({ where: { orderId } });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({ where: { id } });
      if (!product) return null;

      const occurredAt = new Date().toISOString();
      await transaction.product.delete({ where: { id } });
      await transaction.outboxEvent.create({
        data: {
          topic: "inventory.product.deleted",
          key: String(id),
          payload: { id, orderId: product.orderId, occurredAt },
        },
      });
      return product;
    });
  }
}
