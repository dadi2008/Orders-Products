import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupsPage from "pages/groups-page";
import OrdersPage from "pages/orders-page";
import ProductsPage from "pages/products-page";
import { inventoryApi } from "lib/api";
import { setSearchQuery, uiReducer } from "store/slices/ui.slice";
import { order, product, secondOrder, secondProduct } from "./fixtures";

vi.mock("lib/api", () => ({
  inventoryApi: {
    getOrders: vi.fn(),
    getProducts: vi.fn(),
    getTypes: vi.fn(),
    createOrder: vi.fn(),
    createProduct: vi.fn(),
    deleteOrder: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

vi.mock("lib/wasm", () => ({
  sum: vi.fn(async (values: number[]) =>
    values.reduce((total, value) => total + value, 0),
  ),
}));

function createStore() {
  return configureStore({ reducer: { ui: uiReducer } });
}

function renderPage(element: ReactElement) {
  const store = createStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{element}</MemoryRouter>
      </Provider>,
    ),
  };
}

const api = vi.mocked(inventoryApi);

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getOrders.mockResolvedValue([order, secondOrder]);
    api.deleteOrder.mockResolvedValue(undefined);
    api.deleteProduct.mockResolvedValue(undefined);
  });

  it("loads orders, filters only their titles, and deletes an order", async () => {
    const user = userEvent.setup();
    const { store } = renderPage(<OrdersPage />);

    expect(await screen.findByText("Office equipment delivery")).toBeVisible();
    expect(screen.getByText("Hardware replenishment")).toBeVisible();

    store.dispatch(setSearchQuery("inventory"));
    expect(await screen.findByText("Приходы не найдены.")).toBeVisible();

    store.dispatch(setSearchQuery("hardware"));
    await user.click(await screen.findByText("Hardware replenishment"));
    expect(
      screen.queryByRole("heading", { name: "Hardware replenishment" }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Удалить Hardware replenishment" }),
    );
    await user.click(screen.getByRole("button", { name: /^Удалить$/ }));

    await waitFor(() => {
      expect(api.deleteOrder).toHaveBeenCalledWith(secondOrder.id);
    });
    expect(
      screen.queryByText("Hardware replenishment"),
    ).not.toBeInTheDocument();
  });

  it("creates an order without opening product details", async () => {
    const user = userEvent.setup();
    const createdOrder = {
      ...order,
      id: 3,
      title: "New intake",
      products: [],
      productCount: 0,
      totals: {},
    };
    api.getOrders.mockResolvedValue([order]);
    api.createOrder.mockResolvedValue(createdOrder);
    renderPage(<OrdersPage />);

    await screen.findByText("Office equipment delivery");
    await user.click(screen.getByRole("button", { name: "Добавить приход" }));
    await user.type(
      screen.getByRole("textbox", { name: "Название прихода" }),
      "New intake",
    );
    await user.click(screen.getByRole("button", { name: "Создать" }));

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledWith("New intake", undefined);
    });
    expect(await screen.findByText("New intake")).toBeVisible();

    expect(screen.queryByText("В этом приходе еще нет продуктов.")).toBeNull();
  });
});

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getTypes.mockResolvedValue(["Monitors", "Motherboards"]);
    api.getProducts.mockResolvedValue([product, secondProduct]);
    api.deleteProduct.mockResolvedValue(undefined);
  });

  it("loads types and products, filters by title and type, then deletes a product", async () => {
    const user = userEvent.setup();
    const { store } = renderPage(<ProductsPage />);

    expect(await screen.findByText(product.title)).toBeVisible();
    expect(screen.getByText(secondProduct.title)).toBeVisible();
    await waitFor(() => {
      expect(screen.getByText(/Сумма:/)).toHaveTextContent(/5.?001,70/);
    });

    store.dispatch(setSearchQuery("gigabyte"));
    expect(await screen.findByText(secondProduct.title)).toBeVisible();
    expect(screen.queryByText(product.title)).not.toBeInTheDocument();

    store.dispatch(setSearchQuery(""));
    await user.selectOptions(screen.getByRole("combobox"), "Motherboards");
    await waitFor(() => {
      expect(api.getProducts).toHaveBeenLastCalledWith("Motherboards");
    });

    await user.click(
      screen.getByRole("button", { name: `Удалить ${secondProduct.title}` }),
    );
    await user.click(screen.getByRole("button", { name: /^Удалить$/ }));

    await waitFor(() => {
      expect(api.deleteProduct).toHaveBeenCalledWith(secondProduct.id);
    });
    expect(screen.queryByText(secondProduct.title)).not.toBeInTheDocument();
  });

  it("renders a safe empty state when product types cannot load", async () => {
    api.getTypes.mockRejectedValue(new Error("offline"));
    api.getProducts.mockResolvedValue([]);
    renderPage(<ProductsPage />);

    expect(await screen.findByText("Продукты не найдены.")).toBeVisible();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });
});

describe("GroupsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getOrders.mockResolvedValue([order, secondOrder]);
    api.deleteOrder.mockResolvedValue(undefined);
    api.deleteProduct.mockResolvedValue(undefined);
  });

  it("shows products for the selected group and truncates long names", async () => {
    const user = userEvent.setup();
    const longTitle = "Длинное предлинное длиннючее название прихода";
    api.getOrders.mockResolvedValue([
      { ...order, title: longTitle },
      secondOrder,
    ]);
    renderPage(<GroupsPage />);

    const groupTitle = await screen.findByRole("button", { name: longTitle });
    expect(groupTitle).toHaveAttribute("title", longTitle);
    expect(screen.getByRole("heading", { name: longTitle })).toBeVisible();

    await user.click(screen.getByRole("button", { name: secondOrder.title }));
    expect(
      screen.getByRole("heading", { name: secondOrder.title }),
    ).toBeVisible();
    expect(screen.getByText(secondProduct.serialNumber)).toBeVisible();
  });

  it("adds a product to the selected group", async () => {
    const user = userEvent.setup();
    const createdProduct = {
      ...product,
      id: 10,
      title: "Новый монитор",
      serialNumber: "SN-NEW-10",
    };
    api.createProduct.mockResolvedValue(createdProduct);
    renderPage(<GroupsPage />);

    await screen.findByRole("heading", { name: order.title });
    await user.click(screen.getByRole("button", { name: "Добавить продукт" }));
    await user.type(
      screen.getByRole("textbox", { name: "Название продукта" }),
      createdProduct.title,
    );
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        orderId: order.id,
        title: createdProduct.title,
        serialNumber: undefined,
        type: "Мониторы",
      });
    });
    expect(await screen.findByText(createdProduct.serialNumber)).toBeVisible();
  });
});
