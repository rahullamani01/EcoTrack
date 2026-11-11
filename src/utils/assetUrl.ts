/**
 * Resolve a public-asset path against Vite's configured base URL.
 *
 * Locally the base is `/`, while the GitHub Pages deployment uses a
 * repository sub-path such as `/EcoTrack/`. Absolute URLs are returned as-is.
 */
export function assetUrl(path?: string, fallback: string = ''): string {
  if (!path) return fallback;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;

  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
