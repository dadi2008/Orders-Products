import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import type { Product } from "common/types/inventory";
import { ConfirmModal } from "components/confirm-modal";
import { ProductRow } from "components/product-row";
import { inventoryApi } from "lib/api";
import { formatMoney } from "lib/format";
import { matchesSearch } from "lib/search";
import { sum } from "lib/wasm";
import { useAppSelector } from "hooks/use-app-store";
import { useTranslation } from "common/i18n";

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [type, setType] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  useEffect(() => {
    inventoryApi
      .getTypes()
      .then(setTypes)
      .catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      try {
        const items = await inventoryApi.getProducts(type || undefined);
        if (isActive) {
          setProducts(items);
          setLoadError(false);
        }
      } catch {
        if (isActive) setLoadError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      isActive = false;
    };
  }, [type]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => matchesSearch(searchQuery, [product.title])),
    [products, searchQuery],
  );

  useEffect(() => {
    let isActive = true;

    void sum(
      filteredProducts.flatMap((product) =>
        product.prices
          .filter((price) => price.currency === "USD")
          .map((price) => Number(price.value)),
      ),
    ).then((value) => {
      if (isActive) setTotal(value);
    });

    return () => {
      isActive = false;
    };
  }, [filteredProducts]);

  const productCount = filteredProducts.length;

  const removeProduct = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await inventoryApi.deleteProduct(deleting.id);
      setProducts((items) =>
        items.filter((product) => product.id !== deleting.id),
      );
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page products-page">
      <div className="page__heading">
        <h1>
          {t("products")} <span>/ {productCount}</span>
        </h1>
        <label className="filter">
          {t("type")}:
          <span>
            <select
              value={type}
              onChange={(event) => {
                setLoading(true);
                setType(event.target.value);
              }}
            >
              <option value="">{t("allTypes")}</option>
              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown />
          </span>
        </label>
        <div className="products-page__total">
          {t("total")}: {formatMoney(total, "USD")}
        </div>
      </div>
      {loading ? (
        <div className="page__state">{t("loadingProducts")}</div>
      ) : loadError ? (
        <div className="page__state" role="alert">
          {t("failedLoad")}
        </div>
      ) : (
        <div className="products-table">
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onDelete={() => setDeleting(product)}
            />
          ))}
          {!filteredProducts.length && (
            <div className="page__state">{t("noProducts")}</div>
          )}
        </div>
      )}
      {deleting && (
        <ConfirmModal
          confirmationTitle={t("deleteProduct")}
          itemTitle={deleting.title}
          itemSubtitle={deleting.serialNumber}
          busy={busy}
          onClose={() => setDeleting(null)}
          onConfirm={removeProduct}
        />
      )}
    </section>
  );
}
