import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSensitiveRoute, isExternalRequest } from "@/lib/access-control";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Stealth 404 for sensitive routes when accessed externally (Cloudflare Tunnel or public internet)
  if (isSensitiveRoute(pathname)) {
    if (isExternalRequest(request.headers, request.nextUrl.host)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Página no encontrada en este servidor." },
          {
            status: 404,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }

      // For page routes (/login, /admin), rewrite to /not-found with 404 status
      const notFoundUrl = new URL("/not-found", request.url);
      return NextResponse.rewrite(notFoundUrl, {
        status: 404,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }
  }

  const sessionCookie = request.cookies.get("portfolio_session")?.value;

  // 2. Protect /admin routes locally: redirect unauthenticated users to /login
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect all /api/admin/* endpoints locally (except public auth endpoints)
  if (pathname.startsWith("/api/admin")) {
    const isPublicAuthRoute =
      pathname.startsWith("/api/admin/auth/login") ||
      pathname.startsWith("/api/admin/auth/verify-2fa");

    if (!isPublicAuthRoute && !sessionCookie) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión con 2FA." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/login",
    "/login/:path*",
    "/api/admin",
    "/api/admin/:path*",
  ],
};
