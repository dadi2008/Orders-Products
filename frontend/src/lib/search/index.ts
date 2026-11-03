export function matchesSearch(
  query: string,
  values: Array<string | null | undefined>,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  if (!normalizedQuery) return true;

  return values.some((value) =>
    value?.toLocaleLowerCase("ru-RU").includes(normalizedQuery),
  );
}
