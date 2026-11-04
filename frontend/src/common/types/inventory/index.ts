export type Money = {
  value: number | string;
  currency: string;
  isDefault: boolean;
};

export type ProductCondition = "NEW" | "USED";
export type ProductStatus = "AVAILABLE" | "IN_REPAIR" | "ASSIGNED";

export type ProductOrder = {
  id: number;
  title: string;
};

export type Product = {
  id: number;
  serialNumber: string;
  title: string;
  type: string;
  specification?: string | null;
  photoUrl?: string | null;
  condition: ProductCondition;
  status: ProductStatus;
  guaranteeStart: string;
  guaranteeEnd: string;
  receivedAt: string;
  orderId: number;
  order: ProductOrder;
  prices: Money[];
};

export type MediaUpload = { filename: string; dataUrl: string };

export type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
};

export type UsersPage = {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateProductData = {
  price: number;
  orderId: number;
  title: string;
  serialNumber?: string;
  type?: string;
  condition: ProductCondition;
  status: ProductStatus;
  photo?: MediaUpload;
};

export type Warehouse = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
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
