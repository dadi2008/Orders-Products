import { Module } from "@nestjs/common";
import { ProductsPrismaService } from "database/prisma.service";

@Module({
  providers: [ProductsPrismaService],
  exports: [ProductsPrismaService],
})
export class DatabaseModule {}
