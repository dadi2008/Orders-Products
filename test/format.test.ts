import { describe, expect, it } from "vitest";
import { formatMoney } from "../apps/web/lib/format";

describe("currency formatting", () => {
  it("formats the total with the selected currency", () => {
    expect(formatMoney(2500.5, "USD")).toContain("2");
    expect(formatMoney(2500.5, "USD")).toContain("USD");
  });
});
