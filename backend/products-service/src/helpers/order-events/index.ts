export function readOrderId(event: unknown): number {
  if (typeof event !== "object" || event === null || !("id" in event)) {
    throw new Error("Invalid inventory.order.deleted event");
  }

  const { id } = event;

  if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) {
    throw new Error("Invalid inventory.order.deleted event");
  }

  return id;
}
