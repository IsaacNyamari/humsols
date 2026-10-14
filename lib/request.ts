import { env } from "@/lib/env";

/**
 * CSRF defence for route handlers that mutate state: the browser always sends
 * Origin on cross-site POSTs, so require it to match this site's host.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Same-origin fetches from older browsers may omit Origin; fall back to Referer.
    const referer = request.headers.get("referer");
    if (!referer) return false;
    return hostOf(referer) === requestHost(request) || hostOf(referer) === hostOf(env.siteUrl);
  }
  const host = hostOf(origin);
  return host === requestHost(request) || host === hostOf(env.siteUrl);
}

function requestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? hostOf(request.url)
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}
