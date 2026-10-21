import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getDb();
  const socials = db.prepare("SELECT * FROM social_links ORDER BY order_num ASC, id ASC").all();
  return NextResponse.json(socials);
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO social_links (platform, url, icon_name, order_num)
    VALUES (?, ?, ?, ?)
  `).run(
    data.platform,
    data.url,
    data.icon_name || "external-link",
    data.order_num || 0
  );

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  db.prepare(`
    UPDATE social_links SET
      platform = ?,
      url = ?,
      icon_name = ?,
      order_num = ?
    WHERE id = ?
  `).run(
    data.platform,
    data.url,
    data.icon_name || "external-link",
    data.order_num || 0,
    data.id
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM social_links WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
