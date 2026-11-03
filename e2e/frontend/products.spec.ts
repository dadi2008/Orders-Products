import { expect, test } from "@playwright/test";
import { installInventoryMock } from "./inventory-mock";

test.beforeEach(async ({ page }) => {
  await installInventoryMock(page);
});

test("filters products by type and global title search", async ({ page }) => {
  await page.goto("/products");

  await page.getByRole("combobox").selectOption("Laptops");
  await expect(
    page.getByRole("heading", { name: "Продукты / 1" }),
  ).toBeVisible();
  await expect(
    page.getByText("Gigabyte Technology X58-USB3", { exact: true }),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Поиск" }).fill("ASUS");
  await expect(page.getByText("Продукты не найдены.")).toBeVisible();
});

test("deletes a product after confirmation", async ({ page }) => {
  await page.goto("/products");

  await page.getByRole("button", { name: /Удалить ASUS/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Вы уверены, что хотите удалить этот продукт?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();

  await expect(
    page.locator(".product-row", {
      hasText: "ASUS ROG Swift OLED PG27AQDM",
    }),
  ).toHaveCount(0);
});
