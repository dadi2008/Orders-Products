import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ConfirmModal } from "components/confirm-modal";
import { OrderCard } from "components/order-card";
import { OrderDetails } from "components/order-details";
import { OrderForm } from "components/order-form";
import { ProductRow } from "components/product-row";
import { order, product } from "./fixtures";

describe("modal components", () => {
  it("validates, submits trimmed values, and closes an order form", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<OrderForm onClose={onClose} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Создать" }));
    expect(
      screen.getByText("Название должно содержать не менее 3 символов"),
    ).toBeVisible();

    await user.type(
      screen.getByRole("textbox", { name: "Название прихода" }),
      "  Поставка  ",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Описание" }),
      "  Техника  ",
    );
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(onSubmit).toHaveBeenCalledWith("Поставка", "Техника");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a submission failure without closing the order form", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <OrderForm
        onClose={onClose}
        onSubmit={vi.fn().mockRejectedValue(new Error("failed"))}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Название прихода" }),
      "Поставка",
    );
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(
      await screen.findByText("Не удалось создать приход. Попробуйте еще раз."),
    ).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("blocks confirmation actions while a delete request is pending", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        confirmationTitle="Удалить продукт?"
        itemTitle={product.title}
        itemSubtitle={product.serialNumber}
        busy
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(product.title);
    expect(screen.getByRole("button", { name: "Отменить" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Удаление..." })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe("order and product cards", () => {
  it("selects an order but does not select it while clicking delete", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <OrderCard
        order={order}
        selected
        onSelect={onSelect}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Office equipment delivery")).toBeVisible();
    await user.click(screen.getByText("Office equipment delivery"));
    await user.click(
      screen.getByRole("button", { name: "Удалить Office equipment delivery" }),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".order-card__arrow")).toBeInTheDocument();
  });

  it("forwards all order-details actions", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onDelete = vi.fn();
    const onDeleteProduct = vi.fn();
    render(
      <OrderDetails
        order={order}
        onClose={onClose}
        onDelete={onDelete}
        onDeleteProduct={onDeleteProduct}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Закрыть детали" }));
    await user.click(screen.getByRole("button", { name: "Удалить продукт" }));
    await user.click(screen.getByRole("button", { name: "Удалить приход" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDeleteProduct).toHaveBeenCalledWith(product);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("renders product data and delegates product deletion", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <MemoryRouter>
        <ProductRow product={product} onDelete={onDelete} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Свободен")).toBeVisible();
    expect(screen.getByText("новый")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Office equipment delivery" }),
    ).toHaveAttribute("href", "/groups?orderId=1");
    await user.click(
      screen.getByRole("button", { name: `Удалить ${product.title}` }),
    );
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
