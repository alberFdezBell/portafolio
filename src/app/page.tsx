import React from "react";
import { getDb } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StorySection } from "@/components/StorySection";
import { ExperienceSection, ExperienceItem } from "@/components/ExperienceSection";
import { ProjectsSection, ProjectItem } from "@/components/ProjectsSection";
import { EducationSection, EducationItem } from "@/components/EducationSection";
import { ContactSection, SocialLinkItem } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
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

      <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        <Navbar statusBadge={profile.status_badge} />

        <main id="main-content">
          <Hero
            name={profile.name}
            title={profile.title}
            shortBio={profile.short_bio}
            avatarUrl={profile.avatar_url}
            githubUrl={profile.github_url}
            linkedinUrl={profile.linkedin_url}
            email={profile.email}
          />

          <StorySection
            aboutStory={profile.about_story}
            avatarUrl={profile.avatar_url}
            name={profile.name}
          />

          <ExperienceSection experiences={experiences} />

          <ProjectsSection projects={projects} />

          <EducationSection education={education} />

          <ContactSection
            email={profile.email}
            location={profile.location}
            socialLinks={socialLinks}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}
