import React from "react";
import { getDb } from "@/lib/db";
import { ExperienceItem } from "@/components/ExperienceSection";
import { ProjectItem } from "@/components/ProjectsSection";
import { EducationItem } from "@/components/EducationSection";
import { SocialLinkItem } from "@/components/ContactSection";
import { PortfolioShell } from "@/components/PortfolioShell";
import { generatePersonSchema, generateWebSiteSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();

  const profile = (db.prepare("SELECT * FROM profile WHERE id = 1").get() as any) || {
    name: "Alberto Fernández Bellido",
    title: "Senior Full-Stack Developer & Cloud Architect",
    short_bio: "Construyendo software resiliente y moderno.",
    about_story: "",
    avatar_url: "",
    location: "España (Remoto)",
    email: "alberto.fernandez.bellido.8@gmail.com",
    status_badge: "🟢 Disponible para proyectos",
    github_url: "https://github.com/alberFdezBell",
    linkedin_url: "",
  };

  const experiences = (db
    .prepare("SELECT * FROM experiences ORDER BY order_num ASC, id DESC")
    .all() as ExperienceItem[]) || [];

  const projects = (db
    .prepare("SELECT * FROM projects ORDER BY featured DESC, order_num ASC, id DESC")
    .all() as ProjectItem[]) || [];

  const education = (db
    .prepare("SELECT * FROM education ORDER BY order_num ASC, id DESC")
    .all() as EducationItem[]) || [];

  const socialLinks = (db
    .prepare("SELECT * FROM social_links ORDER BY order_num ASC, id ASC")
    .all() as SocialLinkItem[]) || [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:1886";
  const personJsonLd = generatePersonSchema(profile, siteUrl);
  const websiteJsonLd = generateWebSiteSchema(profile, siteUrl);

  return (
    <>
      {/* Structured SEO Data (Schema.org JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <PortfolioShell
        profile={profile}
        experiences={experiences}
        projects={projects}
        education={education}
        socialLinks={socialLinks}
      />
    </>
  );
}
