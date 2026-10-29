import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET /api/admin/backup - Export all data as JSON
export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const db = getDb();

    const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get() || null;
    const experiences = db.prepare("SELECT * FROM experiences ORDER BY order_num ASC, id DESC").all() || [];
    const education = db.prepare("SELECT * FROM education ORDER BY order_num ASC, id DESC").all() || [];
    const projects = db.prepare("SELECT * FROM projects ORDER BY featured DESC, order_num ASC, id DESC").all() || [];
    const social_links = db.prepare("SELECT * FROM social_links ORDER BY order_num ASC, id ASC").all() || [];
    const custom_icons = db.prepare("SELECT * FROM custom_icons ORDER BY name ASC").all() || [];

    const exportPayload = {
      version: "1.0",
      app: "portafolio-dev",
      exported_at: new Date().toISOString(),
      data: {
        profile,
        experiences,
        education,
        projects,
        social_links,
        custom_icons,
      },
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `portfolio-backup-${dateStr}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Error exporting backup:", err);
    return NextResponse.json(
      { error: "Error al exportar los datos: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

// POST /api/admin/backup - Import all data from JSON
export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Archivo JSON inválido" }, { status: 400 });
    }

    const data = body.data || body;
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Estructura de datos no encontrada en el JSON" }, { status: 400 });
    }

    const db = getDb();

    // Atomic transaction for migration
    const importTx = db.transaction(() => {
      const importedCounts = {
        profile: 0,
        experiences: 0,
        education: 0,
        projects: 0,
        social_links: 0,
        custom_icons: 0,
      };

      // 1. Profile
      if (data.profile && typeof data.profile === "object") {
        const p = data.profile;
        db.prepare(`
          INSERT INTO profile (
            id, name, title, short_bio, about_story, avatar_url, location, email, status_badge, github_url, linkedin_url
          ) VALUES (
            1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            title = excluded.title,
            short_bio = excluded.short_bio,
            about_story = excluded.about_story,
            avatar_url = excluded.avatar_url,
            location = excluded.location,
            email = excluded.email,
            status_badge = excluded.status_badge,
            github_url = excluded.github_url,
            linkedin_url = excluded.linkedin_url,
            updated_at = CURRENT_TIMESTAMP
        `).run(
          p.name || "Alberto Fernández Bellido",
          p.title || "",
          p.short_bio || "",
          p.about_story || "",
          p.avatar_url || "",
          p.location || "",
          p.email || "",
          p.status_badge || "",
          p.github_url || "",
          p.linkedin_url || ""
        );
        importedCounts.profile = 1;
      }

      // 2. Experiences
      if (Array.isArray(data.experiences)) {
        db.prepare("DELETE FROM experiences").run();
        const insertExp = db.prepare(`
          INSERT INTO experiences (company, role, location, start_date, end_date, is_current, description, skills, order_num)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const exp of data.experiences) {
          const skillsJson = Array.isArray(exp.skills) ? JSON.stringify(exp.skills) : exp.skills || "[]";
          insertExp.run(
            exp.company || "",
            exp.role || "",
            exp.location || "",
            exp.start_date || "",
            exp.end_date || "",
            exp.is_current ? 1 : 0,
            exp.description || "",
            skillsJson,
            exp.order_num || 0
          );
        }
        importedCounts.experiences = data.experiences.length;
      }

      // 3. Education
      if (Array.isArray(data.education)) {
        db.prepare("DELETE FROM education").run();
        const insertEdu = db.prepare(`
          INSERT INTO education (institution, degree, field_of_study, start_year, end_year, description, order_num)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const edu of data.education) {
          insertEdu.run(
            edu.institution || "",
            edu.degree || "",
            edu.field_of_study || "",
            edu.start_year || "",
            edu.end_year || "",
            edu.description || "",
            edu.order_num || 0
          );
        }
        importedCounts.education = data.education.length;
      }

      // 4. Projects
      if (Array.isArray(data.projects)) {
        db.prepare("DELETE FROM projects").run();
        const insertProj = db.prepare(`
          INSERT INTO projects (title, description, long_description, tech_stack, image_url, demo_url, repo_url, status, media, links, featured, order_num)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const proj of data.projects) {
          const techJson = Array.isArray(proj.tech_stack) ? JSON.stringify(proj.tech_stack) : proj.tech_stack || "[]";
          const mediaJson = Array.isArray(proj.media) ? JSON.stringify(proj.media) : proj.media || "[]";
          const linksJson = Array.isArray(proj.links) ? JSON.stringify(proj.links) : proj.links || "[]";
          insertProj.run(
            proj.title || "Proyecto",
            proj.description || "",
            proj.long_description || "",
            techJson,
            proj.image_url || "",
            proj.demo_url || "",
            proj.repo_url || "",
            proj.status || "Producción",
            mediaJson,
            linksJson,
            proj.featured ? 1 : 0,
            proj.order_num || 0
          );
        }
        importedCounts.projects = data.projects.length;
      }

      // 5. Social Links
      const socialsList = Array.isArray(data.social_links)
        ? data.social_links
        : Array.isArray(data.socials)
        ? data.socials
        : null;

      if (socialsList) {
        db.prepare("DELETE FROM social_links").run();
        const insertSoc = db.prepare(`
          INSERT INTO social_links (platform, url, icon_name, order_num)
          VALUES (?, ?, ?, ?)
        `);
        for (const soc of socialsList) {
          insertSoc.run(
            soc.platform || "",
            soc.url || "",
            soc.icon_name || "",
            soc.order_num || 0
          );
        }
        importedCounts.social_links = socialsList.length;
      }

      // 6. Custom Icons
      if (Array.isArray(data.custom_icons)) {
        db.prepare("DELETE FROM custom_icons").run();
        const insertIcon = db.prepare(`
          INSERT INTO custom_icons (id, name, slug, category, type, cdn_url, color)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const icon of data.custom_icons) {
          if (icon.id && icon.name && icon.slug) {
            insertIcon.run(
              icon.id,
              icon.name,
              icon.slug,
              icon.category || "custom",
              icon.type || "custom",
              icon.cdn_url || null,
              icon.color || null
            );
          }
        }
        importedCounts.custom_icons = data.custom_icons.length;
      }

      return importedCounts;
    });

    const counts = importTx();

    return NextResponse.json({
      success: true,
      message: "Datos importados y migrados con éxito",
      counts,
    });
  } catch (err: unknown) {
    console.error("Error importing backup:", err);
    return NextResponse.json(
      { error: "Error al importar el archivo JSON: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

