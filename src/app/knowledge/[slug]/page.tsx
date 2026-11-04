import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { categorySlugToId } from "@/lib/knowledge-slug";
import { KnowledgeCategoryItem } from "@/components/KnowledgeSection";
import { getPortfolioData } from "@/lib/portfolio-data";
import { PortfolioShell } from "@/components/PortfolioShell";
import {
  getSiteUrl,
  generateKnowledgeSchema,
  generateKnowledgeBreadcrumbSchema,
  generatePersonSchema,
  generateWebSiteSchema,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function getCategory(slug: string): KnowledgeCategoryItem | null {
  const id = categorySlugToId(slug);
  if (!id) return null;
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM knowledge_categories WHERE id = ?")
      .get(id) as KnowledgeCategoryItem) || null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Categoría no encontrada" };

  const siteUrl = getSiteUrl();

  // Use first 160 chars of content as description, stripping markdown
  const plainText = (category.content || "")
    .replace(/[#*`>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const description =
    plainText.length > 0
      ? plainText
      : `Artículo de conocimientos: ${category.name}`;

  return {
    title: category.name,
    description,
    alternates: {
      canonical: `${siteUrl}/knowledge/${slug}`,
    },
    openGraph: {
      type: "article",
      locale: "es_ES",
      url: `${siteUrl}/knowledge/${slug}`,
      title: category.name,
      description,
      siteName: "Alberto Fernández Bellido",
    },
    twitter: {
      card: "summary",
      title: category.name,
      description,
    },
  };
}

export default async function KnowledgePage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const portfolioData = getPortfolioData();
  const siteUrl = getSiteUrl();
  const articleSchema = generateKnowledgeSchema(category, siteUrl, slug);
  const breadcrumbSchema = generateKnowledgeBreadcrumbSchema(category, siteUrl, slug);
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PortfolioShell
        {...portfolioData}
        initialKnowledgeCategory={category}
      />
    </>
  );
}
