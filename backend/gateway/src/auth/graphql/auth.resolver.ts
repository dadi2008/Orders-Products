import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthService } from "auth/auth.service";
import { GqlJwtAuthGuard } from "auth/gql-jwt-auth.guard";
import { LoginInput } from "auth/graphql/inputs/login.input";
import { RefreshTokenInput } from "auth/graphql/inputs/refresh-token.input";
import { RegisterInput } from "auth/graphql/inputs/register.input";
import { AuthSessionModel } from "auth/graphql/models/auth-session.model";

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthSessionModel)
  register(@Args("input") input: RegisterInput) {
    return this.auth.register(input);
  }

  @Mutation(() => AuthSessionModel)
  login(@Args("input") input: LoginInput) {
    return this.auth.login(input);
  }

  @Mutation(() => AuthSessionModel)
  refreshSession(@Args("input") input: RefreshTokenInput) {
    return this.auth.refresh(input.refreshToken);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  logout(@Context() context: { req: { user: { id: number } } }) {
    return this.auth.logout(context.req.user.id);
  }
}
