export type Money = { value: number | string; currency: string; isDefault: boolean };

export type Product = {
  id: number;
  serialNumber: string;
  title: string;
  type: string;
  specification?: string | null;
  condition: "NEW" | "USED";
  status: "AVAILABLE" | "IN_REPAIR" | "ASSIGNED";
  guaranteeStart: string;
  guaranteeEnd: string;
  receivedAt: string;
  orderId: number;
  order: { id: number; title: string };
  prices: Money[];
};

export type Order = {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
  productCount: number;
  totals: Record<string, number>;
  products: Product[];
};
