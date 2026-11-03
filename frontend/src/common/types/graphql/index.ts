import type { Order } from "common/types/inventory";

export type GraphqlOrder = Omit<Order, "totals"> & {
  totals: Array<{
    currency: string;
    value: number;
  }>;
};
