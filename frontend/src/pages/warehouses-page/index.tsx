import { useEffect, useState, type SubmitEvent } from "react";
import { useTranslation } from "common/i18n";
import type { Warehouse } from "common/types/inventory";
import { inventoryApi } from "lib/api";
import { PageSkeleton } from "components/page-skeleton";

export default function WarehousesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  useEffect(() => {
    let active = true;
    void inventoryApi
      .getWarehouses()
      .then((data) => active && setItems(data))
      .catch(() => active && setLoadError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const warehouse = await inventoryApi.createWarehouse({
        name: name.trim(),
        address: address.trim(),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      });
      setItems((current) => [...current, warehouse]);
      setName("");
      setAddress("");
      setLatitude("");
      setLongitude("");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page">
      <div className="page__heading">
        <h1>
          {t("warehouses")} / {items.length}
        </h1>
      </div>
      {loading ? (
        <PageSkeleton variant="users" compact />
      ) : (
        <div className="warehouse-grid">
          <article className="analytics-card">
            <h2>{t("warehouses")}</h2>
            {loadError && <p role="alert">{t("warehouseLoadError")}</p>}
            {!items.length && !loadError && <p>{t("noWarehouses")}</p>}
            {items.map((item) => (
              <div className="warehouse-item" key={item.id}>
                <strong>{item.name}</strong>
                <p>{item.address}</p>
              </div>
            ))}
          </article>
          <form className="analytics-card warehouse-form" onSubmit={submit}>
            <h2>{t("addWarehouse")}</h2>
            <label>
              {t("name")}
              <input
                required
                minLength={1}
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              {t("warehouseAddress")}
              <input
                required
                minLength={3}
                maxLength={500}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
            <p>{t("warehouseCoordinatesHint")}</p>
            <label>
              {t("latitude")}
              <input
                type="number"
                min={-90}
                max={90}
                step="any"
                required={Boolean(longitude)}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </label>
            <label>
              {t("longitude")}
              <input
                type="number"
                min={-180}
                max={180}
                step="any"
                required={Boolean(latitude)}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </label>
            {error && (
              <p className="form-modal__error" role="alert">
                {t("warehouseSaveError")}
              </p>
            )}
            <button className="button button--primary" disabled={busy}>
              {busy ? "…" : t("addWarehouse")}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
