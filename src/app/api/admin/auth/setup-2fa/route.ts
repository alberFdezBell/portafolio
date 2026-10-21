import { NextResponse } from "next/server";
import { isAuthenticated, getTotpSecret, verifyTotpToken } from "@/lib/auth";
import { generateURI } from "otplib";
import QRCode from "qrcode";
import { getDb } from "@/lib/db";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const totpInfo = getTotpSecret();
  const otpAuthUrl = generateURI({
    issuer: "Portafolio Alberto",
    label: "admin",
    secret: totpInfo.secret,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    width: 256,
  });

  return NextResponse.json({
    secret: totpInfo.secret,
    qrCode: qrCodeDataUrl,
    otpAuthUrl,
    isConfigured: totpInfo.isConfigured,
  });
}

// Confirm/re-generate secret
export async function POST(req: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { newSecret, verificationCode } = await req.json();
  if (!newSecret || !verificationCode) {
    return NextResponse.json({ error: "Se requiere la nueva clave y el código de verificación" }, { status: 400 });
  }

  const isValid = verifyTotpToken(verificationCode, newSecret);
  if (!isValid) {
    return NextResponse.json({ error: "El código no coincide con la nueva clave" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('totp_secret', ?)").run(newSecret);

  return NextResponse.json({ success: true, message: "Nueva clave 2FA activada con éxito." });
}
