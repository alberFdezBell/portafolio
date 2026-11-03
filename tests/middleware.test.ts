import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("Next.js Middleware Integration", () => {
  const originalEnv = process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL;

  beforeEach(() => {
    delete process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL;
  });

  afterEach(() => {
    process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL = originalEnv;
  });

  it("stealth blocks /login with 404 rewrite when accessed via Cloudflare Tunnel", () => {
    const req = new NextRequest("https://portfolio.alberto.dev/login", {
      headers: {
        host: "portfolio.alberto.dev",
        "cf-ray": "8d39f4019a-MAD",
        "cf-connecting-ip": "198.51.100.25",
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(404);
    // Rewrite header check (NextResponse.rewrite sets x-middleware-rewrite)
    expect(res.headers.get("x-middleware-rewrite")).toContain("/not-found");
    expect(res.headers.get("cache-control")).toBe("no-store, no-cache, must-revalidate");
  });

  it("stealth blocks /admin with 404 rewrite when accessed externally", () => {
    const req = new NextRequest("https://portfolio.alberto.dev/admin", {
      headers: {
        host: "portfolio.alberto.dev",
        "cf-ray": "8d39f4019a-MAD",
        "cf-connecting-ip": "198.51.100.25",
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(404);
    expect(res.headers.get("x-middleware-rewrite")).toContain("/not-found");
  });

  it("returns JSON 404 for /api/admin endpoints when accessed externally", async () => {
    const req = new NextRequest("https://portfolio.alberto.dev/api/admin/auth/login", {
      method: "POST",
      headers: {
        host: "portfolio.alberto.dev",
        "cf-ray": "8d39f4019a-MAD",
        "cf-connecting-ip": "198.51.100.25",
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Página no encontrada en este servidor.");
  });

  it("allows local access to /login on localhost", () => {
    const req = new NextRequest("http://localhost:1886/login", {
      headers: {
        host: "localhost:1886",
      },
    });

    const res = middleware(req);
    // Should proceed to next()
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("allows local access to /login on private LAN IP", () => {
    const req = new NextRequest("http://192.168.1.100:1886/login", {
      headers: {
        host: "192.168.1.100:1886",
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects unauthenticated local /admin requests to /login", () => {
    const req = new NextRequest("http://localhost:1886/admin", {
      headers: {
        host: "localhost:1886",
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(307); // NextResponse.redirect
    expect(res.headers.get("location")).toContain("/login?from=%2Fadmin");
  });
});
