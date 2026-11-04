import { useEffect, useMemo, useState } from "react";
import { GeoAlt } from "react-bootstrap-icons";
import { useTranslation } from "common/i18n";
import type { Product, Warehouse } from "common/types/inventory";
import { calculateAnalytics } from "lib/analytics-worker";
import { formatMoney } from "lib/format";
import { inventoryApi } from "lib/api";
import { PageSkeleton } from "components/page-skeleton";

export default function AnalyticsPage() {
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null,
  );
  const [warehouseError, setWarehouseError] = useState(false);
  const selectedWarehouse =
    warehouses.find((item) => item.id === selectedWarehouseId) ?? warehouses[0];
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bars, setBars] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    let active = true;
    void inventoryApi
      .getWarehouses()
      .then((items) => active && setWarehouses(items))
      .catch(() => active && setWarehouseError(true));
    void inventoryApi
      .getProducts()
      .then(async (items) => {
        const result = await calculateAnalytics(items);
        if (active) {
          setProducts(items);
          setBars(result);
        }
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const maxValue = useMemo(
    () => Math.max(...bars.map((bar) => bar.value), 1),
    [bars],
  );

  return (
    <section className="page analytics-page">
      <div className="page__heading">
        <h1>{t("analytics")}</h1>
      </div>
      {loading ? (
        <PageSkeleton variant="analytics" compact />
      ) : error ? (
        <div className="page__state" role="alert">
          Unable to load analytics.
        </div>
      ) : (
        <div className="analytics-grid">
          <article className="analytics-card">
            <h2>{t("chartTitle")}</h2>
            <p>
              {products.length} {t("products").toLowerCase()}
            </p>
            <div
              className="analytics-chart"
              role="img"
              aria-label={t("chartTitle")}
            >
              {bars.map((bar) => (
                <div className="analytics-chart__row" key={bar.label}>
                  <span title={bar.label}>{bar.label}</span>
                  <div className="analytics-chart__track">
                    <i
                      style={{
                        width: `${Math.max((bar.value / maxValue) * 100, 3)}%`,
                      }}
                    />
                  </div>
                  <strong>{formatMoney(bar.value, "USD", locale)}</strong>
                </div>
              ))}
              {!bars.length && (
                <span className="analytics-chart__empty">—</span>
              )}
            </div>
          </article>
          <article className="analytics-card analytics-card--map">
            <h2>{t("mapTitle")}</h2>
            {warehouseError && <p role="alert">{t("warehouseLoadError")}</p>}
            {!warehouseError && !warehouses.length && (
              <p>{t("noWarehouses")}</p>
            )}
            <div className="warehouse-list">
              {warehouses.map((warehouse) => (
                <button
                  type="button"
                  key={warehouse.id}
                  className={`warehouse-item ${selectedWarehouse?.id === warehouse.id ? "warehouse-item--active" : ""}`}
                  aria-pressed={selectedWarehouse?.id === warehouse.id}
                  onClick={() => setSelectedWarehouseId(warehouse.id)}
                >
                  <strong>
                    <GeoAlt /> {warehouse.name}
                  </strong>
                  <span>{warehouse.address}</span>
                </button>
              ))}
            </div>
            {selectedWarehouse && (
              <iframe
                title={t("mapTitle")}
                loading="lazy"
                src={warehouseMapUrl(selectedWarehouse)}
              />
            )}
          </article>
        </div>
      )}
    </section>
  );
}

function warehouseMapUrl(warehouse: Warehouse) {
  const { latitude: lat, longitude: lon } = warehouse;
  const params = new URLSearchParams({
    bbox: `${lon - 0.02},${lat - 0.01},${lon + 0.02},${lat + 0.01}`,
    layer: "mapnik",
    marker: `${lat},${lon}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}
