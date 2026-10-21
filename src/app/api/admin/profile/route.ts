import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  return NextResponse.json(profile || {});
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data = await req.json();
  const db = getDb();

  db.prepare(`
    UPDATE profile SET
      name = ?,
      title = ?,
      short_bio = ?,
      about_story = ?,
      avatar_url = ?,
      location = ?,
      email = ?,
      status_badge = ?,
      github_url = ?,
      linkedin_url = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    data.name || "",
    data.title || "",
    data.short_bio || "",
    data.about_story || "",
    data.avatar_url || "",
    data.location || "",
    data.email || "",
    data.status_badge || "",
    data.github_url || "",
    data.linkedin_url || ""
  );

  return NextResponse.json({ success: true, message: "Perfil actualizado correctamente." });
}
