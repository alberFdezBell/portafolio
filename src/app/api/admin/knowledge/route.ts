import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getDb();
  const categories = db
    .prepare("SELECT * FROM knowledge_categories ORDER BY order_num ASC, id ASC")
    .all();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const slug =
    data.slug ||
    (data.name || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const result = db
    .prepare(`
      INSERT INTO knowledge_categories (name, slug, content, order_num, featured)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      data.name || "Nueva Categoría",
      slug,
      data.content || "",
      data.order_num || 0,
      data.featured ? 1 : 0
    );

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  // If bulk array is provided (for reordering or batch save)
  if (Array.isArray(data)) {
    const updateStmt = db.prepare(`
      UPDATE knowledge_categories
      SET name = ?, content = ?, order_num = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        updateStmt.run(
          item.name,
          item.content || "",
          item.order_num || 0,
          item.featured ? 1 : 0,
          item.id
        );
      }
    });

    transaction(data);
    return NextResponse.json({ success: true });
  }

  // Single category update
  if (!data.id) {
    return NextResponse.json({ error: "ID de categoría requerido" }, { status: 400 });
  }

  db.prepare(`
    UPDATE knowledge_categories
    SET name = ?, slug = ?, content = ?, order_num = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    data.name,
    data.slug || null,
    data.content || "",
    data.order_num || 0,
    data.featured ? 1 : 0,
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
  db.prepare("DELETE FROM knowledge_categories WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}

