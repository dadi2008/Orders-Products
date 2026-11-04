import { useEffect, useState } from "react";
import { PlusLg } from "react-bootstrap-icons";
import type { Order } from "common/types/inventory";
import { ConfirmModal } from "components/confirm-modal";
import { OrderCard } from "components/order-card";
import { OrderForm } from "components/order-form";
import { OrderDetails } from "components/order-details";
import { ProductForm } from "components/product-form";
import { useAppDispatch, useAppSelector } from "hooks/use-app-store";
import { inventoryApi } from "lib/api";
import { useDebouncedValue } from "hooks/use-debounced-value";
import { setOrderFormOpen } from "store/slices/ui.slice";
import { useTranslation } from "common/i18n";
import { PageSkeleton } from "components/page-skeleton";

export default function OrdersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isOrderFormOpen = useAppSelector((state) => state.ui.isOrderFormOpen);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<
    Order["products"][number] | null
  >(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isProductFormOpen, setProductFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      try {
        const items = await inventoryApi.getOrders(debouncedSearchQuery);
        if (isActive) {
          setOrders(items);
          setLoadError(false);
        }
      } catch {
        if (isActive) setLoadError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, [debouncedSearchQuery]);

  const removeOrder = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await inventoryApi.deleteOrder(deleting.id);
      setOrders((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const createOrder = async (title: string, description: string) => {
    const created = await inventoryApi.createOrder(
      title,
      description || undefined,
    );
    setOrders((items) => [created, ...items]);
  };

  const addProduct = async (
    data: Parameters<typeof inventoryApi.createProduct>[0],
  ) => {
    const product = await inventoryApi.createProduct(data);
    setOrders((items) =>
      items.map((order) =>
        order.id === product.orderId ? withProduct(order, product) : order,
      ),
    );
  };

  const removeProduct = async () => {
    if (!deletingProduct) return;
    setBusy(true);
    try {
      await inventoryApi.deleteProduct(deletingProduct.id);
      setOrders((items) =>
        items.map((order) =>
          order.id === deletingProduct.orderId
            ? withoutProduct(order, deletingProduct.id)
            : order,
        ),
      );
      setDeletingProduct(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page orders-page">
      <div className="page__heading">
        <button
          className="round-button"
          onClick={() => dispatch(setOrderFormOpen(true))}
          aria-label={t("addArrival")}
        >
          <PlusLg />
        </button>
        <h1>
          {t("arrivals")} <span>/ {orders.length}</span>
        </h1>
      </div>
      {loading ? (
        <PageSkeleton variant="orders" compact />
      ) : loadError ? (
        <div className="page__state" role="alert">
          {t("failedLoad")}
        </div>
      ) : (
        <div
          className={`orders-layout ${selectedOrder ? "orders-layout--details" : ""}`}
        >
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={order.id === selectedOrderId}
                onSelect={() => setSelectedOrderId(order.id)}
                onDelete={() => setDeleting(order)}
              />
            ))}
            {!orders.length && (
              <div className="page__state">{t("ordersNotFound")}</div>
            )}
          </div>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={() => setSelectedOrderId(null)}
              onAddProduct={() => setProductFormOpen(true)}
              onDelete={() => setDeleting(selectedOrder)}
              onDeleteProduct={setDeletingProduct}
            />
          )}
        </div>
      )}
      {deleting && (
        <ConfirmModal
          confirmationTitle={t("confirmDeleteArrival")}
          itemTitle={deleting.products[0]?.title ?? deleting.title}
          itemSubtitle={deleting.products[0]?.serialNumber ?? t("emptyArrival")}
          busy={busy}
          onClose={() => setDeleting(null)}
          onConfirm={removeOrder}
        />
      )}
      {isOrderFormOpen && (
        <OrderForm
          onClose={() => dispatch(setOrderFormOpen(false))}
          onSubmit={createOrder}
        />
      )}
      {deletingProduct && (
        <ConfirmModal
          confirmationTitle={t("deleteProduct")}
          itemTitle={deletingProduct.title}
          itemSubtitle={deletingProduct.serialNumber}
          busy={busy}
          onClose={() => setDeletingProduct(null)}
          onConfirm={removeProduct}
        />
      )}
      {isProductFormOpen && selectedOrder && (
        <ProductForm
          order={selectedOrder}
          onClose={() => setProductFormOpen(false)}
          onSubmit={addProduct}
        />
      )}
    </section>
  );
}

function withProduct(order: Order, product: Order["products"][number]): Order {
  const products = [...order.products, product];
  return { ...order, products, productCount: products.length, totals: totals(products) };
}

function withoutProduct(order: Order, productId: number): Order {
  const products = order.products.filter((product) => product.id !== productId);
  return { ...order, products, productCount: products.length, totals: totals(products) };
}

function totals(products: Order["products"]): Record<string, number> {
  return products.flatMap((product) => product.prices).reduce<Record<string, number>>(
    (result, price) => ({ ...result, [price.currency]: (result[price.currency] ?? 0) + Number(price.value) }),
    {},
  );
}
