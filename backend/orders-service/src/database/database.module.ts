import { Module } from "@nestjs/common";
import { OrdersPrismaService } from "./prisma.service";

@Module({ providers: [OrdersPrismaService], exports: [OrdersPrismaService] })
export class DatabaseModule {}
