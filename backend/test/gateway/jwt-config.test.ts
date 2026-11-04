import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ConfigService } from "@nestjs/config";
import { getJwtSecrets } from "../../gateway/src/auth/jwt-config";

describe("JWT configuration", () => {
  it("rejects missing, blank, short and identical secrets", () => {
    const secret = randomBytes(32).toString("hex");
    for (const value of [undefined, "", "short", " ".repeat(40)]) {
      expect(() =>
        getJwtSecrets(
          new ConfigService({
            JWT_ACCESS_SECRET: value,
            JWT_REFRESH_SECRET: secret,
          }),
        ),
      ).toThrow("JWT_ACCESS_SECRET");
      expect(() =>
        getJwtSecrets(
          new ConfigService({
            JWT_ACCESS_SECRET: secret,
            JWT_REFRESH_SECRET: value,
          }),
        ),
      ).toThrow("JWT_REFRESH_SECRET");
    }
    expect(() =>
      getJwtSecrets(
        new ConfigService({
          JWT_ACCESS_SECRET: secret,
          JWT_REFRESH_SECRET: secret,
        }),
      ),
    ).toThrow("must be different");
  });

  it("uses only the configured secrets", () => {
    const values = {
      JWT_ACCESS_SECRET: randomBytes(32).toString("hex"),
      JWT_REFRESH_SECRET: randomBytes(32).toString("hex"),
    };
    expect(getJwtSecrets(new ConfigService(values))).toEqual({
      accessSecret: values.JWT_ACCESS_SECRET,
      refreshSecret: values.JWT_REFRESH_SECRET,
    });
  });
});
