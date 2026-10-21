import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getTotpSecret,
  verifyTotpToken,
  createSessionToken,
  getAdminCredentials,
  safeCompare,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Bloqueado temporalmente por seguridad. Espera ${rateCheck.waitSeconds} segundos.`,
        },
        { status: 429 }
      );
    }

    const { username, password, token } = await req.json();
    if (!username || !password || !token) {
      return NextResponse.json({ error: "Faltan datos de verificación" }, { status: 400 });
    }

    const creds = getAdminCredentials();
    if (!safeCompare(username.trim(), creds.username.trim()) || !safeCompare(password.trim(), creds.password.trim())) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: "Sesión o credenciales inválidas" }, { status: 401 });
    }

    const totpInfo = getTotpSecret();
    const isTokenValid = verifyTotpToken(token, totpInfo.secret);

    if (!isTokenValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Código 2FA incorrecto o expirado. Verifica la hora de tu dispositivo." },
        { status: 401 }
      );
    }

    // Success: reset rate limit, mark TOTP configured and set secure session cookie
    resetRateLimit(ip);
    const db = getDb();
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('totp_configured', '1')").run();

    const sessionToken = createSessionToken(username);

    const response = NextResponse.json({
      success: true,
      message: "Autenticación de doble factor completada con éxito.",
    });

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.nextUrl.protocol === "https:";

    response.cookies.set("portfolio_session", sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
