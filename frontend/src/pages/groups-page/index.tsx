import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Order } from "common/types/inventory";
import { ConfirmModal } from "components/confirm-modal";
import { GroupCard } from "components/group-card";
import { GroupDetails } from "components/group-details";
import { ProductForm } from "components/product-form";
import { useAppSelector } from "hooks/use-app-store";
import { inventoryApi } from "lib/api";
import { useDebouncedValue } from "hooks/use-debounced-value";
import { useTranslation } from "common/i18n";
import { PageSkeleton } from "components/page-skeleton";

export default function GroupsPage() {
  const { t } = useTranslation();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState<Order[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isProductFormOpen, setProductFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<
    Order["products"][number] | null
  >(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadGroups() {
      try {
        const items = await inventoryApi.getOrders(debouncedSearchQuery);
        if (isActive) {
          setGroups(items);
          const requestedId = Number(searchParams.get("orderId"));
          setSelectedGroupId((currentId) =>
            items.some((item) => item.id === currentId)
              ? currentId
              : items.some((item) => item.id === requestedId)
                ? requestedId
                : (items[0]?.id ?? null),
          );
          setLoadError(false);
        }
      } catch {
        if (isActive) setLoadError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadGroups();

    return () => {
      isActive = false;
    };
  }, [debouncedSearchQuery, searchParams]);
  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? null;

  const selectGroup = (id: number) => {
    setSelectedGroupId(id);
    setSearchParams({ orderId: String(id) });
  };

  const addProduct = async (
    data: Parameters<typeof inventoryApi.createProduct>[0],
  ) => {
    const product = await inventoryApi.createProduct(data);
    setGroups((items) =>
      items.map((group) =>
        group.id === product.orderId ? withProduct(group, product) : group,
      ),
    );
  };

  const removeProduct = async () => {
    if (!deletingProduct) return;
    setBusy(true);
    try {
      await inventoryApi.deleteProduct(deletingProduct.id);
      setGroups((items) =>
        items.map((group) =>
          group.id === deletingProduct.orderId
            ? withoutProduct(group, deletingProduct.id)
            : group,
        ),
      );
      setDeletingProduct(null);
    } finally {
      setBusy(false);
    }
  };

  const removeGroup = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await inventoryApi.deleteOrder(deleting.id);
      setGroups((items) => items.filter((group) => group.id !== deleting.id));
      setDeleting(null);
      setSelectedGroupId(null);
      setSearchParams({});
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page groups-page">
      <div className="page__heading">
        <h1>
          {t("groups")} <span>/ {groups.length}</span>
        </h1>
      </div>
      {loading ? (
        <PageSkeleton variant="groups" compact />
      ) : loadError ? (
        <div className="page__state" role="alert">
          {t("failedLoad")}
        </div>
      ) : (
        <div
          className={`groups-layout ${selectedGroup ? "groups-layout--details" : ""}`}
        >
          <div className="groups-list">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                order={group}
                selected={group.id === selectedGroupId}
                onSelect={() => selectGroup(group.id)}
              />
            ))}
            {!groups.length && (
              <div className="page__state">{t("groupsNotFound")}</div>
            )}
          </div>
          {selectedGroup && (
            <GroupDetails
              order={selectedGroup}
              onClose={() => {
                setSelectedGroupId(null);
                setSearchParams({});
              }}
              onAddProduct={() => setProductFormOpen(true)}
              onDelete={() => setDeleting(selectedGroup)}
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
          onConfirm={removeGroup}
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
      {isProductFormOpen && selectedGroup && (
        <ProductForm
          order={selectedGroup}
          onClose={() => setProductFormOpen(false)}
          onSubmit={addProduct}
        />
      )}
    </section>
  );
}

function withProduct(order: Order, product: Order["products"][number]): Order {
  const products = [...order.products, product];
  return {
    ...order,
    products,
    productCount: products.length,
    totals: totals(products),
  };
}

function withoutProduct(order: Order, productId: number): Order {
  const products = order.products.filter((product) => product.id !== productId);
  return {
    ...order,
    products,
    productCount: products.length,
    totals: totals(products),
  };
}

function totals(products: Order["products"]): Record<string, number> {
  return products
    .flatMap((product) => product.prices)
    .reduce<Record<string, number>>((result, price) => {
      result[price.currency] =
        (result[price.currency] ?? 0) + Number(price.value);
      return result;
    }, {});
}
