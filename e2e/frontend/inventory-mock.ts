import type { Page } from "@playwright/test";

interface Order {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

interface Product {
  id: number;
  serialNumber: string;
  title: string;
  type: string;
  specification: string;
  condition: "NEW" | "USED";
  status: "AVAILABLE" | "IN_REPAIR" | "ASSIGNED";
  guaranteeStart: string;
  guaranteeEnd: string;
  receivedAt: string;
  orderId: number;
  prices: { value: number; currency: string; isDefault: boolean }[];
}

interface GraphqlRequest {
  query?: string;
  variables?: {
    id?: number;
    type?: string;
    input?: {
      orderId?: number;
      title?: string;
      description?: string;
      serialNumber?: string;
      type?: string;
    };
  };
}

const orderFixtures: Order[] = [
  {
    id: 1,
    title: "Office equipment delivery",
    description: "Inventory intake",
    createdAt: "2025-01-06T12:09:33.000Z",
  },
  {
    id: 2,
    title: "Hardware replenishment",
    description: "Inventory intake",
    createdAt: "2025-02-06T12:09:33.000Z",
  },
];

const productFixtures: Product[] = [
  {
    id: 8,
    serialNumber: "SN-123456788",
    title: "ASUS ROG Swift OLED PG27AQDM",
    type: "Monitors",
    specification: "Inventory equipment",
    condition: "NEW",
    status: "AVAILABLE",
    guaranteeStart: "2025-04-06T00:00:00.000Z",
    guaranteeEnd: "2028-04-06T00:00:00.000Z",
    receivedAt: "2025-01-06T12:09:33.000Z",
    orderId: 1,
    prices: [{ value: 2500.85, currency: "USD", isDefault: true }],
  },
  {
    id: 9,
    serialNumber: "SN-123456789",
    title: "Gigabyte Technology X58-USB3",
    type: "Laptops",
    specification: "Inventory equipment",
    condition: "USED",
    status: "IN_REPAIR",
    guaranteeStart: "2025-04-06T00:00:00.000Z",
    guaranteeEnd: "2028-04-06T00:00:00.000Z",
    receivedAt: "2025-02-06T12:09:33.000Z",
    orderId: 2,
    prices: [{ value: 1000, currency: "USD", isDefault: true }],
  },
];

export async function installInventoryMock(page: Page): Promise<void> {
  let nextOrderId = 100;
  let nextProductId = 100;
  let orders = structuredClone(orderFixtures);
  let products = structuredClone(productFixtures);

  const toProduct = (product: Product) => {
    const order = orders.find((item) => item.id === product.orderId);
    return {
      ...product,
      order: { id: product.orderId, title: order?.title ?? "Удаленный приход" },
    };
  };

  const toOrder = (order: Order) => {
    const orderProducts = products
      .filter((product) => product.orderId === order.id)
      .map(toProduct);
    const totals = orderProducts
      .flatMap((product) => product.prices)
      .reduce<Record<string, number>>((result, price) => {
        result[price.currency] = (result[price.currency] ?? 0) + price.value;
        return result;
      }, {});

    return {
      ...order,
      productCount: orderProducts.length,
      totals: Object.entries(totals).map(([currency, value]) => ({
        currency,
        value,
      })),
      products: orderProducts,
    };
  };

  await page.route("**/graphql", async (route) => {
    const { query = "", variables = {} } = route
      .request()
      .postDataJSON() as GraphqlRequest;

    if (query.includes("query Orders")) {
      await route.fulfill({ json: { data: { orders: orders.map(toOrder) } } });
      return;
    }

    if (query.includes("query ProductTypes")) {
      await route.fulfill({
        json: {
          data: {
            productTypes: [...new Set(products.map((product) => product.type))],
          },
        },
      });
      return;
    }

    if (query.includes("query Products")) {
      const items = variables.type
        ? products.filter((product) => product.type === variables.type)
        : products;
      await route.fulfill({
        json: { data: { products: items.map(toProduct) } },
      });
      return;
    }

    if (query.includes("mutation CreateOrder")) {
      const input = variables.input;
      const order: Order = {
        id: nextOrderId,
        title: input?.title ?? "",
        description: input?.description ?? "",
        createdAt: "2025-03-06T12:09:33.000Z",
      };
      nextOrderId += 1;
      orders = [order, ...orders];
      await route.fulfill({ json: { data: { createOrder: toOrder(order) } } });
      return;
    }

    if (query.includes("mutation CreateProduct")) {
      const input = variables.input;
      const product: Product = {
        id: nextProductId,
        serialNumber: input?.serialNumber ?? `SN-${String(nextProductId)}`,
        title: input?.title ?? "",
        type: input?.type ?? "Мониторы",
        specification: "",
        condition: "NEW",
        status: "AVAILABLE",
        guaranteeStart: "2025-04-06T00:00:00.000Z",
        guaranteeEnd: "2028-04-06T00:00:00.000Z",
        receivedAt: "2025-03-06T12:09:33.000Z",
        orderId: input?.orderId ?? 0,
        prices: [{ value: 0, currency: "USD", isDefault: true }],
      };
      nextProductId += 1;
      products = [...products, product];
      await route.fulfill({
        json: { data: { createProduct: toProduct(product) } },
      });
      return;
    }

    if (query.includes("mutation DeleteOrder")) {
      orders = orders.filter((order) => order.id !== variables.id);
      products = products.filter((product) => product.orderId !== variables.id);
      await route.fulfill({ json: { data: { deleteOrder: true } } });
      return;
    }

    if (query.includes("mutation DeleteProduct")) {
      products = products.filter((product) => product.id !== variables.id);
      await route.fulfill({ json: { data: { deleteProduct: true } } });
      return;
    }

    await route.fulfill({
      status: 400,
      json: { errors: [{ message: "Unsupported GraphQL operation" }] },
    });
  });
}
