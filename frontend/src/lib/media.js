function normalizeMediaInput(src) {
  if (!src) return '';

  // Handle accidental array-like strings such as '{"https://..."}'.
  let value = String(src).trim();
  if (value.startsWith('{') && value.endsWith('}')) {
    value = value.slice(1, -1).split(',')[0] || '';
  }

  // Remove surrounding single/double quotes when present.
  value = value.replace(/^['"]+|['"]+$/g, '').trim();
  return value;
}

export function resolveMediaUrl(src) {
  const normalized = normalizeMediaInput(src);
  if (!normalized) return '';

  // Absolute URLs pass through as-is.
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  // Root-relative paths (e.g. /uploads/...) — served via Vite proxy in dev,
  // and directly from the same origin in production.
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
