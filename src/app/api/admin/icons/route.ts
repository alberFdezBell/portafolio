import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getDb();
  const rows = db.prepare("SELECT * FROM custom_icons ORDER BY created_at DESC").all() as any[];
  const icons = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: "custom" as const,
    type: r.type || "custom",
    slug: r.slug,
    cdnUrl: r.cdn_url || undefined,
    color: r.color || undefined,
    isCustom: true,
  }));
  return NextResponse.json(icons);
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const data = await req.json();
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Nombre y slug son requeridos" }, { status: 400 });
    }

    const db = getDb();
    const id = data.id || `custom-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const name = data.name.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const category = "custom";
    const type = data.type || "custom";
    const cdnUrl = data.cdnUrl || data.cdn_url || null;
    const color = data.color || null;

    db.prepare(`
      INSERT INTO custom_icons (id, name, slug, category, type, cdn_url, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        slug = excluded.slug,
        cdn_url = excluded.cdn_url,
        color = excluded.color
    `).run(id, name, slug, category, type, cdnUrl, color);

    return NextResponse.json({
      success: true,
      icon: {
        id,
        name,
        category: "custom",
        type,
        slug,
        cdnUrl: cdnUrl || undefined,
        color: color || undefined,
        isCustom: true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al guardar icono";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const data = await req.json();
    if (!data.id || !data.name || !data.slug) {
      return NextResponse.json({ error: "ID, nombre y slug son requeridos" }, { status: 400 });
    }

    const db = getDb();
    const name = data.name.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const cdnUrl = data.cdnUrl || data.cdn_url || null;
    const color = data.color || null;

    db.prepare(`
      UPDATE custom_icons SET
        name = ?,
        slug = ?,
        cdn_url = ?,
        color = ?
      WHERE id = ?
    `).run(name, slug, cdnUrl, color, data.id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar icono";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const db = getDb();
    db.prepare("DELETE FROM custom_icons WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al eliminar icono";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

