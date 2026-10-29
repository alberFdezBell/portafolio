import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { GET, POST } from "@/app/api/admin/backup/route";
import * as auth from "@/lib/auth";
import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(),
}));

describe("Backup & Migration API (/api/admin/backup)", () => {
  let initialBackupData: any;

  beforeAll(async () => {
    vi.mocked(auth.isAuthenticated).mockResolvedValue(true);
    const res = await GET();
    const text = await res.text();
    initialBackupData = JSON.parse(text);
  });

  afterAll(async () => {
    if (initialBackupData) {
      vi.mocked(auth.isAuthenticated).mockResolvedValue(true);
      const req = new NextRequest("http://localhost:1886/api/admin/backup", {
        method: "POST",
        body: JSON.stringify(initialBackupData),
      });
      await POST(req);
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/backup", () => {
    it("rejects unauthenticated requests with 401", async () => {
      vi.mocked(auth.isAuthenticated).mockResolvedValue(false);

      const response = await GET();
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("No autorizado");
    });

    it("exports complete portfolio dataset with 200 and attachment header", async () => {
      vi.mocked(auth.isAuthenticated).mockResolvedValue(true);

      const response = await GET();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/json");
      expect(response.headers.get("Content-Disposition")).toContain("attachment; filename=");

      const bodyText = await response.text();
      const payload = JSON.parse(bodyText);

      expect(payload.version).toBe("1.0");
      expect(payload.app).toBe("portafolio-dev");
      expect(payload.data).toBeDefined();
      expect(payload.data.profile).toBeDefined();
      expect(Array.isArray(payload.data.projects)).toBe(true);
      expect(Array.isArray(payload.data.experiences)).toBe(true);
      expect(Array.isArray(payload.data.education)).toBe(true);
      expect(Array.isArray(payload.data.social_links)).toBe(true);
    });
  });

  describe("POST /api/admin/backup", () => {
    it("rejects unauthenticated requests with 401", async () => {
      vi.mocked(auth.isAuthenticated).mockResolvedValue(false);

      const req = new NextRequest("http://localhost:1886/api/admin/backup", {
        method: "POST",
        body: JSON.stringify({ data: {} }),
      });

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it("imports and replaces portfolio dataset atomically", async () => {
      vi.mocked(auth.isAuthenticated).mockResolvedValue(true);

      const mockPayload = {
        version: "1.0",
        data: {
          profile: {
            name: "Alberto Test Bellido",
            title: "Staff Software Engineer",
            email: "test@example.com",
            location: "Madrid",
          },
          projects: [
            {
              title: "Test Project Migration",
              description: "Migrated test project",
              long_description: "## Detailed description",
              status: "Producción",
              tech_stack: ["TypeScript", "Next.js"],
              featured: 1,
              order_num: 1,
            },
          ],
          experiences: [
            {
              company: "Cloud Corp",
              role: "Lead Architect",
              start_date: "2023",
              end_date: "Presente",
              is_current: 1,
              skills: ["Docker"],
            },
          ],
          education: [
            {
              institution: "UPM",
              degree: "Ingeniería Informática",
              start_year: "2018",
              end_year: "2022",
            },
          ],
          social_links: [
            {
              platform: "GitHub",
              url: "https://github.com/alberFdezBell",
              icon_name: "github",
            },
          ],
        },
      };

      const req = new NextRequest("http://localhost:1886/api/admin/backup", {
        method: "POST",
        body: JSON.stringify(mockPayload),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.counts.profile).toBe(1);
      expect(json.counts.projects).toBe(1);
      expect(json.counts.experiences).toBe(1);
      expect(json.counts.education).toBe(1);
      expect(json.counts.social_links).toBe(1);

      // Verify directly from SQLite
      const db = getDb();
      const updatedProfile = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;
      expect(updatedProfile.name).toBe("Alberto Test Bellido");
      expect(updatedProfile.title).toBe("Staff Software Engineer");

      const projects = db.prepare("SELECT * FROM projects WHERE title = 'Test Project Migration'").all();
      expect(projects.length).toBe(1);
    });
  });
});
