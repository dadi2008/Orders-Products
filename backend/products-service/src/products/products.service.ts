import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  findAll(type?: string) { return this.prisma.product.findMany({ where: type ? { type } : undefined, include: { prices: true, order: { select: { id: true, title: true } } }, orderBy: { receivedAt: "desc" } }); }
  async findTypes(): Promise<string[]> { const products = await this.prisma.product.findMany({ distinct: ["type"], select: { type: true }, orderBy: { type: "asc" } }); return products.map((product) => product.type); }
  findByOrder(orderId: number) { return this.prisma.product.findMany({ where: { orderId }, include: { prices: true, order: { select: { id: true, title: true } } } }); }
}
