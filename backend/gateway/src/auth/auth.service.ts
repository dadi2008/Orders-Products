import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomUUID } from "node:crypto";
import { InventoryApiService } from "inventory/inventory-api.service";
import type { InventoryUser } from "inventory/types/inventory.types";
import type { AuthSession, JwtPayload } from "auth/auth.types";

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly inventory: InventoryApiService,
    config: ConfigService,
  ) {
    this.accessSecret = config.get<string>("JWT_ACCESS_SECRET") ?? "development-access-secret-change-me";
    this.refreshSecret = config.get<string>("JWT_REFRESH_SECRET") ?? "development-refresh-secret-change-me";
  }

  async register(input: { name: string; email: string; password: string }) {
    const user = await this.inventory.registerUser(input);
    return this.createSession(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.inventory.validateUser(input);
    if (!user) throw new UnauthorizedException("Invalid email or password");
    return this.createSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }
    if (payload.type !== "refresh") throw new UnauthorizedException("Refresh token is invalid");
    const tokenHash = hashToken(refreshToken);
    const valid = await this.inventory.hasRefreshToken(payload.sub, tokenHash);
    if (!valid) throw new UnauthorizedException("Refresh token has been revoked");
    const user = await this.requireUser(payload.sub);
    return this.createSession(user);
  }

  async logout(userId: number): Promise<boolean> {
    await this.inventory.setRefreshTokenHash(userId, null);
    return true;
  }

  async validateAccess(payload: JwtPayload): Promise<InventoryUser> {
    if (payload.type !== "access") throw new UnauthorizedException();
    return this.requireUser(payload.sub);
  }

  private async createSession(user: InventoryUser): Promise<AuthSession> {
    const base: Omit<JwtPayload, "type"> = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(
      { ...base, type: "access" },
      { secret: this.accessSecret, expiresIn: "15m" },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...base, type: "refresh", jti: randomUUID() },
      { secret: this.refreshSecret, expiresIn: "7d" },
    );
    await this.inventory.setRefreshTokenHash(user.id, hashToken(refreshToken));
    return { accessToken, refreshToken, user };
  }

  private async requireUser(id: number): Promise<InventoryUser> {
    const user = await this.inventory.findUserById(id);
    if (!user) throw new UnauthorizedException("User no longer exists");
    return user;
  }
}

export function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
