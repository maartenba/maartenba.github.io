/**
 * Normalise a URL slug for fuzzy matching of old post URLs: decode, drop
 * extensions such as .html/.aspx, lowercase and keep letters and digits only.
 * Must stay in sync with the copy inlined in src/pages/404.astro.
 */
export function redirectKey(slug: string) {
  let s = slug;
  try {
    s = decodeURIComponent(s);
  } catch {
    // keep as-is
  }
  return s
    .toLowerCase()
    .replace(/\.(aspx|html?).*$/, "")
    .replace(/[^a-z0-9]/g, "");
}
