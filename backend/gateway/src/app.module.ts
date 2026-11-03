import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { InventoryModule } from "inventory/inventory.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
    }),
    InventoryModule,
  ],
})
export class AppModule {}
