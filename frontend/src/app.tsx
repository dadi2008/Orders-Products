import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { AppShell } from "components/app-shell";
import GroupsPage from "pages/groups-page";
import OrdersPage from "pages/orders-page";
import ProductsPage from "pages/products-page";
import SettingsPage from "pages/settings-page";
import UsersPage from "pages/users-page";
import { StoreProvider } from "store/provider";

export function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate replace to="/orders" />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate replace to="/orders" />} />
          </Routes>
        </AppShell>
      </StoreProvider>
    </BrowserRouter>
  );
}
