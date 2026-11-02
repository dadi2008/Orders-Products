import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { AppShell } from "components/app-shell";
import { StoreProvider } from "components/store-provider";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Orders and products inventory platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
