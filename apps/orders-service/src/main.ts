import "reflect-metadata";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Injectable, Module, Param, Post, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientKafka, ClientsModule, Transport } from "@nestjs/microservices";
import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

@Injectable()
class PrismaService extends PrismaClient {}

@Injectable()
class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly events: ClientKafka) {}

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: { products: { include: { prices: true } } },
      orderBy: { createdAt: "desc" }
    });
    return orders.map((order) => this.toOrderSummary(order));
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { products: { include: { prices: true } } }
    });
    return order ? this.toOrderSummary(order) : null;
  }

  async create(dto: CreateOrderDto) {
    const order = await this.prisma.order.create({ data: dto, include: { products: { include: { prices: true } } } });
    const result = this.toOrderSummary(order);
    this.events.emit("inventory.order.created", result);
    return result;
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    if (!order) return null;
    await this.prisma.order.delete({ where: { id } });
    this.events.emit("inventory.order.deleted", { id });
    return order;
  }

  private toOrderSummary(order: any) {
    const totals = order.products.flatMap((product: any) => product.prices).reduce((result: Record<string, number>, price: any) => {
      result[price.currency] = (result[price.currency] ?? 0) + Number(price.value);
      return result;
    }, {});
    return { ...order, productCount: order.products.length, totals };
  }
}

@Controller("orders")
class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll() { return this.orders.findAll(); }

  @Get(":id")
  async findOne(@Param("id") id: string) { return this.orders.findOne(Number(id)); }

  @Post()
  create(@Body() dto: CreateOrderDto) { return this.orders.create(dto); }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id") id: string) { return this.orders.remove(Number(id)); }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([{ name: "EVENTS", imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({
      transport: Transport.KAFKA,
      options: { client: { clientId: "orders-service", brokers: (config.get<string>("KAFKA_BROKERS") ?? "localhost:9092").split(",") } }
    }) }])
  ],
  controllers: [OrdersController],
  providers: [PrismaService, OrdersService]
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
