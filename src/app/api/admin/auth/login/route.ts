import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  recordFailedAttempt,
  safeCompare,
  getAdminCredentials,
  getTotpSecret,
} from "@/lib/auth";
import { generateURI } from "otplib";
import QRCode from "qrcode";

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

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
    }

    const creds = getAdminCredentials();
    const userMatch = safeCompare(username.trim(), creds.username.trim());
    const passMatch = safeCompare(password.trim(), creds.password.trim());

    if (!userMatch || !passMatch) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: "Credenciales de acceso incorrectas" }, { status: 401 });
    }

    // Credentials are correct. Prompt for 2FA TOTP code!
    const totpInfo = getTotpSecret();

    let qrCode: string | null = null;
    if (!totpInfo.isConfigured) {
      const otpAuthUrl = generateURI({
        issuer: "Portafolio Alberto",
        label: creds.username,
        secret: totpInfo.secret,
      });
      qrCode = await QRCode.toDataURL(otpAuthUrl, {
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        width: 220,
      });
    }

    return NextResponse.json({
      success: true,
      requires2FA: true,
      isFirstSetup: !totpInfo.isConfigured,
      qrCode,
      secret: !totpInfo.isConfigured ? totpInfo.secret : undefined,
      message: "Credenciales válidas. Ingresa tu código 2FA.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
