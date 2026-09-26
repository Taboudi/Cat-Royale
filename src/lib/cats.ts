export const CAT_COUNT = 16;

export type Cat = {
  id: string;
  url: string;
};

export function isCat(value: unknown): value is Cat {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    "url" in value &&
    typeof value.url === "string" &&
    value.url.startsWith("https://cdn2.thecatapi.com/images/")
  );
}