import { expect, test } from "@playwright/test";
import { installInventoryMock } from "./inventory-mock";

test.beforeEach(async ({ page }) => {
  await installInventoryMock(page);
});

test("creates and deletes an order", async ({ page }) => {
  await page.goto("/orders");

  await page.getByRole("button", { name: "Добавить приход" }).click();
  await page.getByLabel("Название прихода").fill("Network equipment delivery");
  await page.getByLabel("Описание").fill("For the infrastructure team");
  await page.getByRole("button", { name: "Создать" }).click();

  await expect(
    page.getByRole("button", {
      name: "Network equipment delivery",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Приходы / 3" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Удалить Network equipment delivery" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Вы уверены, что хотите удалить этот приход?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();

  await expect(
    page.getByRole("button", {
      name: "Network equipment delivery",
      exact: true,
    }),
  ).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Приходы / 2" }),
  ).toBeVisible();
});

test("filters orders by title and keeps the header outside the modal overlay", async ({
  page,
}) => {
  await page.goto("/orders");

  const search = page.getByRole("textbox", { name: "Поиск" });
  await search.fill("office equipment");
  await expect(
    page.getByRole("button", {
      name: "Office equipment delivery",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Приходы / 1" }),
  ).toBeVisible();

  await search.fill("inventory");
  await expect(page.getByText("Приходы не найдены.")).toBeVisible();

  await page.getByRole("button", { name: "Добавить приход" }).click();
  await expect(page.locator(".form-modal")).toBeVisible();

  const overlay = await page.locator(".modal-overlay").boundingBox();
  const header = await page.locator(".top-menu").boundingBox();
  const navigation = await page.locator(".navigation").boundingBox();

  expect(overlay).not.toBeNull();
  expect(header).not.toBeNull();
  expect(navigation).not.toBeNull();
  expect(overlay?.x).toBeGreaterThanOrEqual(
    (navigation?.x ?? 0) + (navigation?.width ?? 0),
  );
  expect(overlay?.y).toBeGreaterThanOrEqual(
    (header?.y ?? 0) + (header?.height ?? 0),
  );
});

test("opens the selected group from arrivals and adds a product there", async ({
  page,
}) => {
  await page.goto("/orders");

  await page
    .getByRole("button", { name: "Office equipment delivery", exact: true })
    .click();
  await expect(page).toHaveURL(/\/groups\?orderId=1/);
  await expect(
    page.getByRole("heading", { name: "Office equipment delivery" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Добавить продукт" }).click();
  await page.getByLabel("Название продукта").fill("New group product");
  await page.getByRole("button", { name: "Добавить", exact: true }).click();

  await expect(
    page
      .locator(".group-details")
      .getByText("New group product", { exact: true }),
  ).toBeVisible();
});
