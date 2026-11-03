import type { InventoryUser } from "inventory/types/inventory.types";

export interface JwtPayload {
  sub: number;
  email: string;
  type: "access" | "refresh";
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: InventoryUser;
}
