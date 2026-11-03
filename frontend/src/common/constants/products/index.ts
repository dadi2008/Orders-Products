import type { ProductStatus } from "common/types/inventory";

export const productStatusLabels: Record<ProductStatus, string> = {
  AVAILABLE: "Свободен",
  IN_REPAIR: "В ремонте",
  ASSIGNED: "Используется",
};
