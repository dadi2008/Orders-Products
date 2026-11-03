import type { User } from "common/types/inventory";

export interface UiState {
  selectedOrderId: number | null;
  activeSessions: number;
  isOrderFormOpen: boolean;
  searchQuery: string;
  currentUser: User | null;
}
