import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "auth/auth.service";
import type { JwtPayload } from "auth/auth.types";
import { getJwtSecrets } from "auth/jwt-config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecrets(config).accessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== "access") throw new UnauthorizedException();
    return this.auth.validateAccess(payload);
  }
}
