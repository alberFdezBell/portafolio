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

export function generatePersonSchema(profile: ProfileData, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.short_bio,
    url: siteUrl,
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
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${profile.name} | Portafolio Profesional`,
    url: siteUrl,
    description: profile.short_bio,
    inLanguage: "es",
    author: {
      "@type": "Person",
      name: profile.name,
    },
  };
}
