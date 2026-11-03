import type { ReactNode } from "react";
import type { CreateProductData, Order, Product } from "common/types/inventory";

export interface AppShellProps {
  children: ReactNode;
}

export interface StoreProviderProps {
  children: ReactNode;
}

export interface ModalPortalProps {
  children: ReactNode;
}

export interface ProductImageProps {
  small?: boolean;
  src?: string | null;
}

export interface ConfirmModalProps {
  confirmationTitle: string;
  itemTitle: string;
  itemSubtitle: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OrderFormProps {
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
}

export interface OrderCardProps {
  order: Order;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onDelete: () => void;
  onDeleteProduct: (product: Product) => void;
}

export interface GroupCardProps {
  order: Order;
  selected: boolean;
  onSelect: () => void;
}

export interface GroupDetailsProps {
  order: Order;
  onClose: () => void;
  onAddProduct: () => void;
  onDelete: () => void;
  onDeleteProduct: (product: Product) => void;
}

export interface ProductFormProps {
  order: Order;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => Promise<void>;
}

export interface ProductRowProps {
  product: Product;
  onDelete: () => void;
}
