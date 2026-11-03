import { SubmitEvent, useState } from "react";
import { X } from "react-bootstrap-icons";
import type { ProductFormProps } from "common/interfaces/components";
import { ModalPortal } from "components/modal-portal";
import { toMediaUpload } from "lib/media";

export function ProductForm({ order, onClose, onSubmit }: ProductFormProps) {
  const [title, setTitle] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [type, setType] = useState("Мониторы");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError("Название должно содержать не менее 3 символов");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        orderId: order.id,
        title: title.trim(),
        serialNumber: serialNumber.trim() || undefined,
        type: type.trim() || undefined,
        photo: photo ? await toMediaUpload(photo) : undefined,
      });
      onClose();
    } catch {
      setError("Не удалось добавить продукт. Попробуйте еще раз.");
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
            aria-label="Закрыть"
          >
            <X />
          </button>
          <h2>Новый продукт</h2>
          <label>
            Название продукта
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              autoFocus
            />
          </label>
          <label>
            Серийный номер
            <input
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              maxLength={80}
            />
          </label>
          <label>
            Тип продукта
            <input
              value={type}
              onChange={(event) => setType(event.target.value)}
              maxLength={80}
            />
          </label>
          <label>
            Изображение
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
              Отменить
            </button>
            <button className="button button--primary" disabled={busy}>
              {busy ? "Сохранение..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
