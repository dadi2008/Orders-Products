export async function retry<T>(
  operation: () => Promise<T>,
  attempts: number,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      if (attempt < attempts) await delay(100 * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
