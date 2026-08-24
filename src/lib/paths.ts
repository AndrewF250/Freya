/** Префикс для статики на GitHub Pages (/Freya). В dev — пустая строка. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Добавляет basePath к локальным путям (/products/..., /logo.png). */
export function withBasePath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  if (!basePath) return path;
  return path.startsWith("/") ? `${basePath}${path}` : `${basePath}/${path}`;
}
