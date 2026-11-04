import type { User } from "common/types/inventory";

export interface UiState {
  selectedOrderId: number | null;
  activeSessions: number;
  serverTime: number | null;
  isOrderFormOpen: boolean;
  searchQuery: string;
  currentUser: User | null;
}
