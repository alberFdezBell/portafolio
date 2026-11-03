export interface HeaderGetter {
  get(name: string): string | null;
  has?(name: string): boolean;
}

/**
 * Normalizes and checks whether a given pathname targets sensitive/internal routes.
 * Sensitive routes:
 * - /login, /login/*
 * - /admin, /admin/*
 * - /api/admin, /api/admin/*
 */
export function isSensitiveRoute(pathname: string): boolean {
  const normalized = pathname.toLowerCase();
  return (
    normalized === "/login" ||
    normalized.startsWith("/login/") ||
    normalized === "/admin" ||
    normalized.startsWith("/admin/") ||
    normalized === "/api/admin" ||
    normalized.startsWith("/api/admin/")
  );
}

/**
 * Checks whether the request arrived through Cloudflare (Cloudflare Edge / Cloudflare Tunnel).
 * Cloudflare unconditionally injects 'cf-ray' and 'cf-connecting-ip' on proxied requests.
 */
export function isCloudflareProxied(headers: HeaderGetter): boolean {
  if (headers.has) {
    if (headers.has("cf-ray") || headers.has("cf-connecting-ip") || headers.has("cf-visitor")) {
      return true;
    }
  }
  return Boolean(
    headers.get("cf-ray") ||
    headers.get("cf-connecting-ip") ||
    headers.get("cf-visitor")
  );
}

/**
 * Checks whether a given hostname belongs to a private / local network.
 * Covers: localhost, 127.0.0.1, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16,
 * Tailscale CGNAT (100.64.0.0/10), and local mDNS domains (.local, .lan, .internal, .home).
 */
export function isLocalHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return false;

  // Clean hostname (strip port and brackets if present)
  let cleanHost = hostHeader.toLowerCase().trim();
  if (cleanHost.startsWith("[") && cleanHost.includes("]")) {
    cleanHost = cleanHost.slice(1, cleanHost.indexOf("]"));
  } else if (cleanHost.includes(":") && cleanHost.indexOf(":") === cleanHost.lastIndexOf(":")) {
    // Exactly one colon: IPv4 or hostname with port (e.g. "localhost:1886", "192.168.1.50:1886")
    cleanHost = cleanHost.split(":")[0];
  }

  // Loopback / localhost
  if (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "::1" ||
    cleanHost === "0:0:0:0:0:0:0:1"
  ) {
    return true;
  }

  // Local / mDNS / internal network domains
  if (
    cleanHost.endsWith(".local") ||
    cleanHost.endsWith(".lan") ||
    cleanHost.endsWith(".internal") ||
    cleanHost.endsWith(".home")
  ) {
    return true;
  }

  // Private IPv4 ranges
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
    return true;
  }

  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x, includes Docker bridge networks)
  const match172 = cleanHost.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (match172) {
    const second = parseInt(match172[1], 10);
    if (second >= 16 && second <= 31) {
      return true;
    }
  }

  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
    return true;
  }

  // Tailscale / CGNAT 100.64.0.0/10 (100.64.x.x - 100.127.x.x)
  const match100 = cleanHost.match(/^100\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (match100) {
    const second = parseInt(match100[1], 10);
    if (second >= 64 && second <= 127) {
      return true;
    }
  }

  // Optional custom allowed local hosts from environment variable
  const allowedCustom = process.env.ALLOWED_LOCAL_HOSTS;
  if (allowedCustom) {
    const list = allowedCustom.split(",").map((h) => h.trim().toLowerCase());
    if (list.includes(cleanHost)) {
      return true;
    }
  }

  return false;
}

/**
 * Determines whether a request should be treated as external (untrusted / public internet).
 * A request is external if:
 * 1. It came through Cloudflare Tunnel / Edge (has cf-ray or cf-connecting-ip).
 * 2. OR its host header is not recognized as a local / private network host.
 * 3. OR its client IP in x-forwarded-for is a public IP.
 */
export function isExternalRequest(headers: HeaderGetter, fallbackHost?: string): boolean {
  // If restriction is explicitly disabled via env var, allow external
  if (process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL === "false") {
    return false;
  }

  // Cloudflare request is always external
  if (isCloudflareProxied(headers)) {
    return true;
  }

  // Determine host
  const host = headers.get("x-forwarded-host") || headers.get("host") || fallbackHost;
  if (!isLocalHost(host)) {
    return true;
  }

  // Verify client IP if x-forwarded-for exists
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0].trim();
    if (clientIp && !isLocalHost(clientIp)) {
      return true;
    }
  }

  return false;
}
