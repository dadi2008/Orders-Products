import type { ConfigService } from "@nestjs/config";

export function getJwtSecrets(config: ConfigService) {
  const accessSecret = requireSecret(config, "JWT_ACCESS_SECRET");
  const refreshSecret = requireSecret(config, "JWT_REFRESH_SECRET");
  if (accessSecret === refreshSecret) {
    throw new Error(
      "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different",
    );
  }
  return { accessSecret, refreshSecret };
}

function requireSecret(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value || value.trim().length < 32) {
    throw new Error(`${key} must be configured with at least 32 characters`);
  }
  return value;
}
