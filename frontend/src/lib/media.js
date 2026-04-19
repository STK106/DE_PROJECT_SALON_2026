export function resolveMediaUrl(src) {
  if (!src) return '';
  // Absolute URLs pass through as-is
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Root-relative paths (e.g. /uploads/...) — served via Vite proxy in dev,
  // and directly from the same origin in production
  return src.startsWith('/') ? src : `/${src}`;
}
