import { useEffect, useMemo, useState } from "react";
import { GeoAlt } from "react-bootstrap-icons";
import { useTranslation } from "common/i18n";
import type { Product } from "common/types/inventory";
import { calculateAnalytics } from "lib/analytics-worker";
import { formatMoney } from "lib/format";
import { inventoryApi } from "lib/api";
import { PageSkeleton } from "components/page-skeleton";

export default function AnalyticsPage() {
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bars, setBars] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    let active = true;
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
            <div className="analytics-chart" role="img" aria-label={t("chartTitle")}>
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
              {!bars.length && <span className="analytics-chart__empty">—</span>}
            </div>
          </article>
          <article className="analytics-card analytics-card--map">
            <h2>{t("mapTitle")}</h2>
            <p>
              <GeoAlt /> {t("mapDescription")}
            </p>
            <iframe
              title={t("mapTitle")}
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=30.47%2C50.40%2C30.61%2C50.49&layer=mapnik&marker=50.4501%2C30.5234"
            />
          </article>
        </div>
      )}
    </section>
  );
}
