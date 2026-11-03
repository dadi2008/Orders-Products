import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { AppShell } from "components/app-shell";
import { StoreProvider } from "store/provider";
import { I18nProvider } from "common/i18n";
import { AuthProvider, useAuth } from "common/auth";
import { PageSkeleton } from "components/page-skeleton";

const OrdersPage = lazy(() => import("pages/orders-page"));
const GroupsPage = lazy(() => import("pages/groups-page"));
const ProductsPage = lazy(() => import("pages/products-page"));
const UsersPage = lazy(() => import("pages/users-page"));
const SettingsPage = lazy(() => import("pages/settings-page"));
const AnalyticsPage = lazy(() => import("pages/analytics-page"));
const AuthPage = lazy(() => import("pages/auth-page"));

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <Suspense fallback={<PageSkeleton variant="auth" />}>
                    <AuthPage />
                  </Suspense>
                }
              />
              <Route path="*" element={<ProtectedApplication />} />
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
  );
}

function ProtectedApplication() {
  const { ready, user } = useAuth();
  if (!ready)
    return (
      <AppShell>
        <PageSkeleton variant="orders" />
      </AppShell>
    );
  if (!user) return <Navigate replace to="/login" />;
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate replace to="/orders" />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate replace to="/orders" />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
