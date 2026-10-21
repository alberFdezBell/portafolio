import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const experiences = db.prepare("SELECT * FROM experiences ORDER BY order_num ASC, id DESC").all();
  return NextResponse.json(experiences);
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const skillsJson = Array.isArray(data.skills) ? JSON.stringify(data.skills) : data.skills || "[]";

  const result = db.prepare(`
    INSERT INTO experiences (company, role, location, start_date, end_date, is_current, description, skills, order_num)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.company,
    data.role,
    data.location || "",
    data.start_date,
    data.end_date || "",
    data.is_current ? 1 : 0,
    data.description || "",
    skillsJson,
    data.order_num || 0
  );

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const skillsJson = Array.isArray(data.skills) ? JSON.stringify(data.skills) : data.skills || "[]";

  db.prepare(`
    UPDATE experiences SET
      company = ?,
      role = ?,
      location = ?,
      start_date = ?,
      end_date = ?,
      is_current = ?,
      description = ?,
      skills = ?,
      order_num = ?
    WHERE id = ?
  `).run(
    data.company,
    data.role,
    data.location || "",
    data.start_date,
    data.end_date || "",
    data.is_current ? 1 : 0,
    data.description || "",
    skillsJson,
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
  db.prepare("DELETE FROM experiences WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
