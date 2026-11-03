import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthResolver } from "auth/graphql/auth.resolver";
import { AuthService } from "auth/auth.service";
import { JwtStrategy } from "auth/jwt.strategy";
import { GqlJwtAuthGuard } from "auth/gql-jwt-auth.guard";
import { InventoryModule } from "inventory/inventory.module";

@Global()
@Module({
  imports: [PassportModule, JwtModule.register({}), InventoryModule],
  providers: [AuthResolver, AuthService, JwtStrategy, GqlJwtAuthGuard],
  exports: [AuthService, GqlJwtAuthGuard],
})
export class AuthModule {}
