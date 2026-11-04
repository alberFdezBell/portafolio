import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { slugToId } from "@/lib/project-slug";
import { ProjectItem } from "@/components/ProjectsSection";
import { getPortfolioData } from "@/lib/portfolio-data";
import { PortfolioShell } from "@/components/PortfolioShell";
import {
  getSiteUrl,
  generateProjectSchema,
  generateProjectBreadcrumbSchema,
  generatePersonSchema,
  generateWebSiteSchema,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function getProject(slug: string): ProjectItem | null {
  const id = slugToId(slug);
  if (!id) return null;
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(id) as ProjectItem) || null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Proyecto no encontrado" };

  const siteUrl = getSiteUrl();

  let techList: string[] = [];
  try {
    techList = JSON.parse(project.tech_stack || "[]");
    if (!Array.isArray(techList)) techList = [];
  } catch {
    techList = project.tech_stack
      ? project.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  }

  let primaryImageUrl: string | undefined;
  try {
    const media = JSON.parse(project.media || "[]");
    const primary =
      media.find((m: any) => m.is_primary && m.type === "image") ||
      media.find((m: any) => m.type === "image");
    primaryImageUrl = primary?.url || project.image_url || undefined;
  } catch {
    primaryImageUrl = project.image_url || undefined;
  }

  const description =
    project.description ||
    `Proyecto desarrollado con ${techList.slice(0, 3).join(", ")}.`;

  return {
    title: project.title,
    description,
    keywords: ["Alberto Fernández Bellido", "Proyecto", ...techList],
    alternates: {
      canonical: `${siteUrl}/project/${slug}`,
    },
    openGraph: {
      type: "article",
      locale: "es_ES",
      url: `${siteUrl}/project/${slug}`,
      title: project.title,
      description,
      siteName: "Alberto Fernández Bellido",
      ...(primaryImageUrl && {
        images: [{ url: primaryImageUrl, alt: project.title }],
      }),
    },
    twitter: {
      card: primaryImageUrl ? "summary_large_image" : "summary",
      title: project.title,
      description,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const portfolioData = getPortfolioData();
  const siteUrl = getSiteUrl();
  const projectSchema = generateProjectSchema(project, siteUrl, slug);
  const breadcrumbSchema = generateProjectBreadcrumbSchema(project, siteUrl, slug);
  const personJsonLd = generatePersonSchema(portfolioData.profile, siteUrl);
  const websiteJsonLd = generateWebSiteSchema(portfolioData.profile, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PortfolioShell
        {...portfolioData}
        initialProject={project}
      />
    </>
  );
}
