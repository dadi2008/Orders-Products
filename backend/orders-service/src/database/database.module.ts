import { Module } from "@nestjs/common";
import { OrdersPrismaService } from "database/prisma.service";

@Module({ providers: [OrdersPrismaService], exports: [OrdersPrismaService] })
export class DatabaseModule {}
