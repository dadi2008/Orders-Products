import { Trash3, X } from "react-bootstrap-icons";
import type { ConfirmModalProps } from "common/interfaces/components";
import { ModalPortal } from "components/modal-portal";
import { ProductImage } from "components/product-image";
import { useTranslation } from "common/i18n";

export function ConfirmModal({
  confirmationTitle,
  itemTitle,
  itemSubtitle,
  busy,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <ModalPortal>
      <div className="modal-overlay" role="presentation">
        <section
          className="confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-title"
        >
          <button
            className="confirm-modal__close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X />
          </button>
          <div className="confirm-modal__content">
            <h2 id="delete-order-title">{confirmationTitle}</h2>
            <div className="confirm-modal__product">
              <i />
              <ProductImage small />
              <div>
                <strong>{itemTitle}</strong>
                <span>{itemSubtitle}</span>
              </div>
            </div>
          </div>
          <footer className="confirm-modal__actions">
            <button
              className="button button--ghost"
              onClick={onClose}
              disabled={busy}
            >
              {t("cancel")}
            </button>
            <button
              className="button button--danger"
              onClick={onConfirm}
              disabled={busy}
            >
              <Trash3 size={14} />
              {busy ? t("deleting") : t("delete")}
            </button>
          </footer>
        </section>
      </div>
    </ModalPortal>
  );
}
