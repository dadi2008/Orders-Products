import { SubmitEvent, useState } from "react";
import { X } from "react-bootstrap-icons";
import {
  productConditionLabelKeys,
  productStatusLabelKeys,
} from "common/constants/products";
import type { ProductFormProps } from "common/interfaces/components";
import { useTranslation } from "common/i18n";
import type { ProductCondition, ProductStatus } from "common/types/inventory";
import { ModalPortal } from "components/modal-portal";
import { toMediaUpload } from "lib/media";

export function ProductForm({ order, onClose, onSubmit }: ProductFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [type, setType] = useState("Мониторы");
  const [status, setStatus] = useState<ProductStatus>("AVAILABLE");
  const [condition, setCondition] = useState<ProductCondition>("NEW");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError(t("productTitleMin"));
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        orderId: order.id,
        title: title.trim(),
        serialNumber: serialNumber.trim() || undefined,
        type: type.trim() || undefined,
        condition,
        status,
        photo: photo ? await toMediaUpload(photo) : undefined,
      });
      onClose();
    } catch {
      setError(t("failedAddProduct"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <form className="form-modal" onSubmit={submit}>
          <button
            type="button"
            className="confirm-modal__close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X />
          </button>
          <h2>{t("newProduct")}</h2>
          <label>
            {t("productTitle")}
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              autoFocus
            />
          </label>
          <label>
            {t("serialNumber")}
            <input
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              maxLength={80}
            />
          </label>
          <label>
            {t("productType")}
            <input
              value={type}
              onChange={(event) => setType(event.target.value)}
              maxLength={80}
            />
          </label>
          <label>
            {t("productStatus")}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProductStatus)}
            >
              {(Object.keys(productStatusLabelKeys) as ProductStatus[]).map((value) => (
                <option key={value} value={value}>
                  {t(productStatusLabelKeys[value])}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("productCondition")}
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value as ProductCondition)}
            >
              {(Object.keys(productConditionLabelKeys) as ProductCondition[]).map((value) => (
                <option key={value} value={value}>
                  {t(productConditionLabelKeys[value])}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("image")}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
          </label>
          {error && <p className="form-modal__error">{error}</p>}
          <div className="form-modal__actions">
            <button
              type="button"
              className="button button--plain"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button className="button button--primary" disabled={busy}>
              {busy ? t("adding") : t("addProduct")}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
