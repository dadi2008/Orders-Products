import "reflect-metadata";
import { Controller, Get, Injectable, Module, Param, Query } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
class PrismaService extends PrismaClient {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "postgresql://inventory:inventory@localhost:5432/inventory?schema=public" }) });
  }
}

@Injectable()
class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(type?: string) {
    return this.prisma.product.findMany({
      where: type ? { type } : undefined,
      include: { prices: true, order: { select: { id: true, title: true } } },
      orderBy: { receivedAt: "desc" }
    });
  }

  findTypes() {
    return this.prisma.product.findMany({ distinct: ["type"], select: { type: true }, orderBy: { type: "asc" } }).then((items) => items.map((item) => item.type));
  }

  findByOrder(orderId: number) {
    return this.prisma.product.findMany({ where: { orderId }, include: { prices: true, order: { select: { id: true, title: true } } } });
  }
}

@Controller("products")
class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@Query("type") type?: string) { return this.products.findAll(type); }

  @Get("types")
  types() { return this.products.findTypes(); }

  @Get("order/:orderId")
  byOrder(@Param("orderId") orderId: string) { return this.products.findByOrder(Number(orderId)); }
}

@Module({ controllers: [ProductsController], providers: [PrismaService, ProductsService] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3002);
}

bootstrap();
