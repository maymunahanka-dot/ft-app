export type SortOption = { value: string; label: string };

function toTime(value: unknown) {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(String(value));
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

type SortAccess<T> = {
  name?: (item: T) => string;
  createdAt?: (item: T) => unknown;
  number?: (item: T) => number;
  date?: (item: T) => unknown;
};

export function sortItems<T>(items: T[], sortBy: string, access: SortAccess<T> = {}) {
  const nameOf = access.name ?? (() => "");
  const createdOf = access.createdAt ?? (() => null);
  const numberOf = access.number ?? (() => 0);
  const dateOf = access.date ?? (() => null);

  return [...items].sort((a, b) => {
    if (sortBy === "name-asc" || sortBy === "name-desc") {
      const compared = nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: "base" });
      return sortBy === "name-asc" ? compared : -compared;
    }

    if (
      sortBy === "quantity" ||
      sortBy === "price" ||
      sortBy === "amount" ||
      sortBy === "rating" ||
      sortBy === "points"
    ) {
      return numberOf(b) - numberOf(a);
    }

    if (sortBy === "date" || sortBy === "last-order") {
      const aTime = toTime(dateOf(a));
      const bTime = toTime(dateOf(b));
      if (sortBy === "last-order" && aTime === 0 && bTime === 0) {
        return toTime(createdOf(b)) - toTime(createdOf(a));
      }
      return bTime - aTime;
    }

    const createdDiff = toTime(createdOf(b)) - toTime(createdOf(a));
    return sortBy === "oldest" ? -createdDiff : createdDiff;
  });
}
