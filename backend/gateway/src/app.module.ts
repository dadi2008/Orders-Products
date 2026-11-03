import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { InventoryModule } from "inventory/inventory.module";
import { AuthModule } from "auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      context: ({ req }: { req: unknown }) => ({ req }),
      formatError: (error) => ({
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: {
          code: error.extensions?.code ?? "INTERNAL_SERVER_ERROR",
        },
      }),
    }),
    InventoryModule,
    AuthModule,
  ],
})
export class AppModule {}
