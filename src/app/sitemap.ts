import { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { projectToSlug } from "@/lib/project-slug";
import { categoryToSlug } from "@/lib/knowledge-slug";
import { ProjectItem } from "@/components/ProjectsSection";
import { KnowledgeCategoryItem } from "@/components/KnowledgeSection";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    const db = getDb();

    // Project canonical URLs
    const projects = db
      .prepare("SELECT id, title, created_at FROM projects ORDER BY order_num ASC, id DESC")
      .all() as Array<Pick<ProjectItem, "id" | "title"> & { created_at?: string }>;

    for (const proj of projects) {
      entries.push({
        url: `${siteUrl}/project/${projectToSlug(proj.id, proj.title)}`,
        lastModified: proj.created_at ? new Date(proj.created_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // Knowledge category canonical URLs
    const categories = db
      .prepare("SELECT id, name, updated_at FROM knowledge_categories ORDER BY order_num ASC, id ASC")
      .all() as Array<Pick<KnowledgeCategoryItem, "id" | "name"> & { updated_at?: string }>;

    for (const cat of categories) {
      entries.push({
        url: `${siteUrl}/knowledge/${categoryToSlug(cat.id, cat.name)}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB not available at build time — skip dynamic entries gracefully
  }

  return entries;
}
