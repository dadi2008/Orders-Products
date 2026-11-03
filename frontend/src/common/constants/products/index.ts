import type { TranslationKey } from "common/i18n";
import type { ProductCondition, ProductStatus } from "common/types/inventory";

export const productStatusLabelKeys: Record<ProductStatus, TranslationKey> = {
  AVAILABLE: "productAvailable",
  IN_REPAIR: "productInRepair",
  ASSIGNED: "productAssigned",
};

export const productConditionLabelKeys: Record<ProductCondition, TranslationKey> = {
  NEW: "productNew",
  USED: "productUsed",
};
