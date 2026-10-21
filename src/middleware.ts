import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("portfolio_session")?.value;

  // Protect /admin routes: redirect unauthenticated users to /login
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all /api/admin/* endpoints (except public auth endpoints)
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
