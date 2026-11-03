import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

interface Product {
  id: number;
  orderId: number;
  title: string;
}

interface Order {
  id: number;
  title: string;
  productCount: number;
}

const ordersQuery = `
  query Orders {
    orders {
      id
      title
      productCount
    }
  }
`;

const productsQuery = `
  query Products {
    products {
      id
      title
      orderId
    }
  }
`;

async function graphql<T>(
  request: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await request.post("/graphql", {
    data: { query, variables },
  });
  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as GraphqlResponse<T>;
  expect(payload.errors).toBeUndefined();
  expect(payload.data).toBeDefined();
  return payload.data as T;
}

test.describe.configure({ mode: "serial" });

test("executes GraphQL reads and order mutations through the deployed stack", async ({
  request,
}) => {
  const initial = await graphql<{ orders: Order[] }>(request, ordersQuery);
  expect(initial.orders).toHaveLength(4);

  const title = `E2E order ${Date.now()}`;
  const created = await graphql<{ createOrder: Order }>(
    request,
    `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          title
          productCount
        }
      }
    `,
    { input: { title, description: "Created by the system E2E suite" } },
  );
  expect(created.createOrder).toMatchObject({ title, productCount: 0 });

  const deleted = await graphql<{ deleteOrder: boolean }>(
    request,
    `
      mutation DeleteOrder($id: Int!) {
        deleteOrder(id: $id)
      }
    `,
    { id: created.createOrder.id },
  );
  expect(deleted.deleteOrder).toBe(true);
});

test("persists product deletion through GraphQL", async ({ request }) => {
  const before = await graphql<{ products: Product[] }>(request, productsQuery);
  const product = before.products[0];
  expect(product).toBeDefined();

  const deleted = await graphql<{ deleteProduct: boolean }>(
    request,
    `
      mutation DeleteProduct($id: Int!) {
        deleteProduct(id: $id)
      }
    `,
    { id: product?.id },
  );
  expect(deleted.deleteProduct).toBe(true);

  await expect
    .poll(async () => {
      const current = await graphql<{ products: Product[] }>(
        request,
        productsQuery,
      );
      return current.products.some((item) => item.id === product?.id);
    })
    .toBe(false);
});

test("removes products after an order deletion event is consumed from Kafka", async ({
  request,
}) => {
  const before = await graphql<{ orders: Order[] }>(request, ordersQuery);
  const order = before.orders.find((item) => item.productCount > 0);
  expect(order).toBeDefined();

  const deleted = await graphql<{ deleteOrder: boolean }>(
    request,
    `
      mutation DeleteOrder($id: Int!) {
        deleteOrder(id: $id)
      }
    `,
    { id: order?.id },
  );
  expect(deleted.deleteOrder).toBe(true);

  await expect
    .poll(
      async () => {
        const current = await graphql<{ products: Product[] }>(
          request,
          productsQuery,
        );
        return current.products.some(
          (product) => product.orderId === order?.id,
        );
      },
      { timeout: 30_000 },
    )
    .toBe(false);
});
