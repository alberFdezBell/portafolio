import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.nextUrl.protocol === "https:";

  const response = NextResponse.json({ success: true, message: "Sesión cerrada correctamente" });
  response.cookies.set("portfolio_session", "", {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
