import { Provider } from "react-redux";
import type { StoreProviderProps } from "common/interfaces/components";
import { store } from "store";

export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
