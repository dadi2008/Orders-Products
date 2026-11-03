export type ProductForAnalytics = {
  type: string;
  prices: { currency: string; value: number | string; isDefault: boolean }[];
};

export type AnalyticsBar = { label: string; value: number };

const workerSource = `
self.onmessage = ({ data }) => {
  const totals = data.products.reduce((result, product) => {
    const price = product.prices.find((item) => item.currency === "USD") || product.prices[0];
    result[product.type] = (result[product.type] || 0) + Number(price?.value || 0);
    return result;
  }, {});
  self.postMessage(Object.entries(totals).map(([label, value]) => ({ label, value })));
};`;

export function calculateAnalytics(
  products: ProductForAnalytics[],
): Promise<AnalyticsBar[]> {
  if (typeof Worker === "undefined") return Promise.resolve(sumInMainThread(products));
  const blob = new Blob([workerSource], { type: "text/javascript" });
  const worker = new Worker(URL.createObjectURL(blob));
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<AnalyticsBar[]>) => {
      worker.terminate();
      resolve(data);
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error("Analytics worker failed"));
    };
    worker.postMessage({ products });
  });
}

function sumInMainThread(products: ProductForAnalytics[]): AnalyticsBar[] {
  const totals = products.reduce<Record<string, number>>((result, product) => {
    const price = product.prices.find((item) => item.currency === "USD") ?? product.prices[0];
    result[product.type] = (result[product.type] ?? 0) + Number(price?.value ?? 0);
    return result;
  }, {});
  return Object.entries(totals).map(([label, value]) => ({ label, value }));
}
