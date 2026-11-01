export interface ProfileData {
  name: string;
  title: string;
  short_bio: string;
  about_story: string;
  avatar_url: string;
  location: string;
  email: string;
  status_badge: string;
  github_url: string;
  linkedin_url: string;
}

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:1886";
  return envUrl.trim().replace(/\/+$/, "");
}

export function generatePersonSchema(profile: ProfileData, siteUrl: string) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.short_bio,
    url: cleanUrl,
    image: profile.avatar_url,
    sameAs: [profile.github_url, profile.linkedin_url].filter(Boolean),
    knowsAbout: [
      "Software Engineering",
      "Full Stack Development",
      "Cloud Architecture",
      "Docker",
      "Next.js",
      "TypeScript",
      "DevOps",
      "Security & 2FA",
    ],
  };
}

export function generateWebSiteSchema(profile: ProfileData, siteUrl: string) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${profile.name} | Portafolio Profesional`,
    url: cleanUrl,
    description: profile.short_bio,
    inLanguage: "es",
    author: {
      "@type": "Person",
      name: profile.name,
    },
  };
}

export function generateProjectSchema(project: any, siteUrl: string, slug: string) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  const projectUrl = `${cleanUrl}/project/${slug}`;

  let techList: string[] = [];
  try {
    techList = JSON.parse(project.tech_stack || "[]");
    if (!Array.isArray(techList)) techList = [];
  } catch {
    techList = project.tech_stack
      ? project.tech_stack.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
  }

  let imageUrl: string | undefined;
  try {
    const media = JSON.parse(project.media || "[]");
    const primary =
      media.find((m: any) => m.is_primary && m.type === "image") ||
      media.find((m: any) => m.type === "image");
    imageUrl = primary?.url || project.image_url || undefined;
  } catch {
    imageUrl = project.image_url || undefined;
  }

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description || `Proyecto de desarrollo técnico ${project.title}`,
    url: projectUrl,
    codeRepository: project.repo_url || undefined,
    programmingLanguage: techList,
    ...(imageUrl && { image: imageUrl }),
    author: {
      "@type": "Person",
      name: "Alberto Fernández Bellido",
      url: cleanUrl,
    },
  };
}

export function generateProjectBreadcrumbSchema(project: any, siteUrl: string, slug: string) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: cleanUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Proyectos",
        item: `${cleanUrl}/#proyectos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${cleanUrl}/project/${slug}`,
      },
    ],
  };
}

export function generateKnowledgeSchema(category: any, siteUrl: string, slug: string) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  const categoryUrl = `${cleanUrl}/knowledge/${slug}`;

  const plainText = (category.content || "")
    .replace(/[#*`>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: category.name,
    description: plainText || `Artículo técnico sobre ${category.name}`,
    url: categoryUrl,
    inLanguage: "es",
    author: {
      "@type": "Person",
      name: "Alberto Fernández Bellido",
      url: cleanUrl,
    },
    ...(category.updated_at && { dateModified: new Date(category.updated_at).toISOString() }),
    ...(category.created_at && { datePublished: new Date(category.created_at).toISOString() }),
  };
}

export function generateKnowledgeBreadcrumbSchema(category: any, siteUrl: string, slug: string) {
  const cleanUrl = siteUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: cleanUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Conocimientos",
        item: `${cleanUrl}/#conocimientos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${cleanUrl}/knowledge/${slug}`,
      },
    ],
  };
}
