import { configureStore } from "@reduxjs/toolkit";
import { uiReducer } from "store/slices/ui.slice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});
