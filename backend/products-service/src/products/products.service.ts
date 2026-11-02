import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(type?: string) {
    const products = await this.prisma.product.findMany({ where: type ? { type } : undefined, include: { prices: true }, orderBy: { receivedAt: "desc" } });
    return products.map((product) => ({ ...product, order: { id: product.orderId, title: product.orderTitle } }));
  }
  async findTypes(): Promise<string[]> { const products = await this.prisma.product.findMany({ distinct: ["type"], select: { type: true }, orderBy: { type: "asc" } }); return products.map((product) => product.type); }
  async findByOrder(orderId: number) {
    const products = await this.prisma.product.findMany({ where: { orderId }, include: { prices: true } });
    return products.map((product) => ({ ...product, order: { id: product.orderId, title: product.orderTitle } }));
  }

  removeByOrder(orderId: number) { return this.prisma.product.deleteMany({ where: { orderId } }); }
}
