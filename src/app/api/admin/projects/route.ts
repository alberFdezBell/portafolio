import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getDb();
  const projects = db.prepare("SELECT * FROM projects ORDER BY order_num ASC, id DESC").all();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const techJson = Array.isArray(data.tech_stack) ? JSON.stringify(data.tech_stack) : data.tech_stack || "[]";
  const mediaJson = Array.isArray(data.media) ? JSON.stringify(data.media) : data.media || "[]";
  const linksJson = Array.isArray(data.links) ? JSON.stringify(data.links) : data.links || "[]";

  const result = db.prepare(`
    INSERT INTO projects (title, description, long_description, tech_stack, image_url, demo_url, repo_url, status, media, links, featured, order_num)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.title,
    data.description || "",
    data.long_description || "",
    techJson,
    data.image_url || "",
    data.demo_url || "",
    data.repo_url || "",
    data.status || "Producción",
    mediaJson,
    linksJson,
    data.featured ? 1 : 0,
    data.order_num || 0
  );

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const techJson = Array.isArray(data.tech_stack) ? JSON.stringify(data.tech_stack) : data.tech_stack || "[]";
  const mediaJson = Array.isArray(data.media) ? JSON.stringify(data.media) : data.media || "[]";
  const linksJson = Array.isArray(data.links) ? JSON.stringify(data.links) : data.links || "[]";

  db.prepare(`
    UPDATE projects SET
      title = ?,
      description = ?,
      long_description = ?,
      tech_stack = ?,
      image_url = ?,
      demo_url = ?,
      repo_url = ?,
      status = ?,
      media = ?,
      links = ?,
      featured = ?,
      order_num = ?
    WHERE id = ?
  `).run(
    data.title,
    data.description || "",
    data.long_description || "",
    techJson,
    data.image_url || "",
    data.demo_url || "",
    data.repo_url || "",
    data.status || "Producción",
    mediaJson,
    linksJson,
    data.featured ? 1 : 0,
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
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
