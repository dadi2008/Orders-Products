import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

type UiState = { selectedOrderId: number | null; activeSessions: number; isOrderFormOpen: boolean };

const initialState: UiState = { selectedOrderId: null, activeSessions: 0, isOrderFormOpen: false };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectOrder: (state, action: PayloadAction<number | null>) => { state.selectedOrderId = action.payload; },
    setActiveSessions: (state, action: PayloadAction<number>) => { state.activeSessions = action.payload; },
    setOrderFormOpen: (state, action: PayloadAction<boolean>) => { state.isOrderFormOpen = action.payload; }
  }
});

export const { selectOrder, setActiveSessions, setOrderFormOpen } = uiSlice.actions;
export const store = configureStore({ reducer: { ui: uiSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
