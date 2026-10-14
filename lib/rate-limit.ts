import { env } from "@/lib/env";

// Fixed-window-per-IP limiter kept in process memory. The site runs as a single
// Node process behind nginx, so this is enough; move to MongoDB/Redis if the app
// is ever scaled to several processes.

type Bucket = { hits: number[] };
const globalForLimiter = globalThis as unknown as { __rateBuckets?: Map<string, Bucket> };
const buckets = (globalForLimiter.__rateBuckets ??= new Map<string, Bucket>());

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number } = env.rateLimit,
  now = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= max) {
    buckets.set(key, bucket);
    const retryAfterSeconds = Math.ceil((windowMs - (now - bucket.hits[0])) / 1000);
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so the map does not grow without bound.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.hits.every((t) => now - t >= windowMs)) buckets.delete(k);
  }

  return { ok: true, remaining: max - bucket.hits.length, retryAfterSeconds: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}

/** Client IP as forwarded by nginx (X-Real-IP / X-Forwarded-For), falling back to "unknown". */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}
