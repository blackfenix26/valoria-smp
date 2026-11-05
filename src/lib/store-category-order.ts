export type StoreCategory = { id: string; name: string };

export function getStoreCategoryOrder(categories: StoreCategory[], savedOrder: string | null | undefined) {
  let orderedIds: string[] = [];

  if (savedOrder) {
    try {
      const parsed: unknown = JSON.parse(savedOrder);
      if (Array.isArray(parsed)) {
        orderedIds = parsed.filter((id): id is string => typeof id === "string");
      }
    } catch {
      orderedIds = [];
    }
  }

  const categoriesById = new Map(categories.map(category => [category.id, category]));
  const ordered = orderedIds
    .map(id => categoriesById.get(id))
    .filter((category): category is StoreCategory => Boolean(category));
  const orderedSet = new Set(ordered.map(category => category.id));
  const remaining = categories
    .filter(category => !orderedSet.has(category.id))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return [...ordered, ...remaining];
}
