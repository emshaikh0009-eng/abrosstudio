/**
 * Ambros Studio — High-Performance In-Memory Card Cache
 * 
 * Provides ultra-fast (<1ms) profile responses for high-traffic and NFC/QR scans.
 * Strictly isolated per sanitized slug with automatic TTL expiry and instant invalidation on admin edits.
 */

interface CachedProfile {
  html: string;
  status: number;
  timestamp: number;
  designId: string;
}

const PROFILE_CACHE = new Map<string, CachedProfile>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function getCachedProfileHtml(slug: string, designParam?: string | null): string | null {
  const key = `${slug.toLowerCase().trim()}:${(designParam || "").toLowerCase().trim()}`;
  const entry = PROFILE_CACHE.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    PROFILE_CACHE.delete(key);
    return null;
  }

  return entry.html;
}

export function setCachedProfileHtml(slug: string, designParam: string | null | undefined, html: string, designId: string): void {
  const key = `${slug.toLowerCase().trim()}:${(designParam || "").toLowerCase().trim()}`;
  // Limit cache size to prevent unbounded memory growth
  if (PROFILE_CACHE.size > 500) {
    const oldestKey = PROFILE_CACHE.keys().next().value;
    if (oldestKey) PROFILE_CACHE.delete(oldestKey);
  }
  PROFILE_CACHE.set(key, {
    html,
    status: 200,
    timestamp: Date.now(),
    designId,
  });
}

/**
 * Instantly invalidate cache when an admin saves or deletes customer profiles.
 * Clears matching slug and any related aliases.
 */
export function invalidateCustomerCache(slug?: string | null): void {
  if (!slug) {
    PROFILE_CACHE.clear();
    return;
  }

  const normalized = slug.toLowerCase().trim();
  for (const key of Array.from(PROFILE_CACHE.keys())) {
    if (
      key.startsWith(`${normalized}:`) ||
      (normalized === "ambros" && key.startsWith("ambros-studio:")) ||
      (normalized === "ambros-studio" && key.startsWith("ambros:")) ||
      ((normalized === "aamirshaikh" || normalized === "atgstudyabroad" || normalized === "atg-study-abroad") &&
        (key.startsWith("aamirshaikh:") || key.startsWith("atgstudyabroad:") || key.startsWith("atg-study-abroad:")))
    ) {
      PROFILE_CACHE.delete(key);
    }
  }
}
