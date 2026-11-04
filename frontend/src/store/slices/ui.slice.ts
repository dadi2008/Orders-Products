import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UiState } from "common/interfaces/store";
import type { User } from "common/types/inventory";

const initialState: UiState = {
  selectedOrderId: null,
  activeSessions: 0,
  serverTime: null,
  isOrderFormOpen: false,
  searchQuery: "",
  currentUser: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectOrder: (state, action: PayloadAction<number | null>) => {
      state.selectedOrderId = action.payload;
    },
    setActiveSessions: (state, action: PayloadAction<number>) => {
      state.activeSessions = action.payload;
    },
    setServerTime: (state, action: PayloadAction<number>) => {
      state.serverTime = action.payload;
    },
    setOrderFormOpen: (state, action: PayloadAction<boolean>) => {
      state.isOrderFormOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
});

export const {
  selectOrder,
  setActiveSessions,
  setServerTime,
  setOrderFormOpen,
  setSearchQuery,
  setCurrentUser,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
