import { Module } from "@nestjs/common";
import { ProductsPrismaService } from "./prisma.service";

@Module({ providers: [ProductsPrismaService], exports: [ProductsPrismaService] })
export class DatabaseModule {}
