import { SubmitEvent, useState } from "react";
import { X } from "react-bootstrap-icons";
import type { OrderFormProps } from "common/interfaces/components";
import { ModalPortal } from "components/modal-portal";

export function OrderForm({ onClose, onSubmit }: OrderFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      await onSubmit(title.trim(), description.trim());
      onClose();
    } catch {
      setError("Не удалось создать приход. Попробуйте еще раз.");
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
          <h2>Новый приход</h2>
          <label>
            Название прихода
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              autoFocus
            />
          </label>
          <label>
            Описание
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={3}
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
              {busy ? "Сохранение..." : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
