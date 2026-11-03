export interface InventoryPrice {
  value: number | string;
  currency: string;
  isDefault: boolean;
}

export interface InventoryOrderReference {
  id: number;
  title: string;
}

export interface InventoryProduct {
  id: number;
  serialNumber: string;
  title: string;
  type: string;
  specification?: string | null;
  photoUrl?: string | null;
  condition: "NEW" | "USED";
  status: "AVAILABLE" | "IN_REPAIR" | "ASSIGNED";
  guaranteeStart: string;
  guaranteeEnd: string;
  receivedAt: string;
  orderId: number;
  order: InventoryOrderReference;
  prices: InventoryPrice[];
}

export interface InventoryUser {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface InventoryUsersPage {
  items: InventoryUser[];
  total: number;
  page: number;
  pageSize: number;
}

interface InventoryOrderRecord {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
}

export interface InventoryOrder extends InventoryOrderRecord {
  productCount: number;
  totals: Record<string, number>;
  products: InventoryProduct[];
}
