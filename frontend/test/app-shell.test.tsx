import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "app";
import { AppShell } from "components/app-shell";
import { AuthProvider } from "common/auth";
import { uiReducer } from "store/slices/ui.slice";

const socket = vi.hoisted(() => ({
  close: vi.fn(),
  on: vi.fn(
    (_event: string, listener: (payload: { activeSessions: number }) => void) =>
      listener({ activeSessions: 3 }),
  ),
}));

vi.mock("socket.io-client", () => ({ io: vi.fn(() => socket) }));

vi.mock("lib/api", () => ({
  inventoryApi: {
    restoreSession: vi.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: 1,
        name: "Alex",
        email: "alex@example.com",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    }),
    getAccessToken: vi.fn(() => "access-token"),
    getAccessTokenExpiry: vi.fn(() => null),
    subscribeToSessionChanges: vi.fn(() => () => undefined),
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 1,
      name: "Alex",
      email: "alex@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
    getOrders: vi.fn().mockResolvedValue([]),
    getProducts: vi.fn().mockResolvedValue([]),
    getTypes: vi.fn().mockResolvedValue([]),
    createOrder: vi.fn(),
    deleteOrder: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

function renderShell(children: ReactNode) {
  const store = configureStore({ reducer: { ui: uiReducer } });
  render(
    <AuthProvider>
      <Provider store={store}>
        <MemoryRouter initialEntries={["/orders"]}>
          <AppShell>{children}</AppShell>
        </MemoryRouter>
      </Provider>
    </AuthProvider>,
  );
  return store;
}

describe("application shell and routing", () => {
  it("updates global search state and manages the presence socket lifecycle", async () => {
    const user = userEvent.setup();
    const store = renderShell(<div>Content</div>);

    await user.type(screen.getByRole("textbox", { name: "Поиск" }), "monitor");
    expect(store.getState().ui.searchQuery).toBe("monitor");
    await waitFor(() => {
      expect(store.getState().ui.activeSessions).toBe(3);
    });
    expect(screen.getByText("Content")).toBeVisible();
  });

  it("redirects the root route to orders", async () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Приходы / 0" }),
    ).toBeVisible();
  });
});
