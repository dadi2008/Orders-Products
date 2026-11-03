import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Navigation } from "components/navigation";
import { ProductImage } from "components/product-image";
import { useDesktopScale } from "hooks/use-desktop-scale";
import {
  uiReducer,
  selectOrder,
  setActiveSessions,
  setOrderFormOpen,
  setSearchQuery,
} from "store/slices/ui.slice";

function ScaleProbe() {
  useDesktopScale();
  return null;
}

describe("UI state", () => {
  it("updates all UI state transitions", () => {
    const store = configureStore({ reducer: { ui: uiReducer } });

    store.dispatch(selectOrder(4));
    store.dispatch(setActiveSessions(7));
    store.dispatch(setOrderFormOpen(true));
    store.dispatch(setSearchQuery("monitor"));

    expect(store.getState().ui).toEqual({
      selectedOrderId: 4,
      activeSessions: 7,
      isOrderFormOpen: true,
      searchQuery: "monitor",
    });
  });
});

describe("layout and shared components", () => {
  it("applies and clears the desktop interface scale", () => {
    const { unmount } = render(<ScaleProbe />);

    expect(document.documentElement.style.zoom).toBe("0.75");
    unmount();
    expect(document.documentElement.style.zoom).toBe("");
  });

  it("renders navigation links and the product image variants", () => {
    const { container, getByRole, rerender } = render(
      <MemoryRouter initialEntries={["/products"]}>
        <Navigation />
        <ProductImage />
      </MemoryRouter>,
    );

    expect(getByRole("link", { name: "Продукты" })).toHaveClass(
      "navigation__link--active",
    );
    expect(container.querySelector(".product-image")).toBeInTheDocument();

    rerender(<ProductImage small />);
    expect(container.querySelector(".product-image")).toHaveClass(
      "product-image--small",
    );
  });
});
