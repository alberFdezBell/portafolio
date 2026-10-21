import { describe, it, expect } from "vitest";
import { generatePersonSchema, generateWebSiteSchema, ProfileData } from "@/lib/seo";

describe("SEO & Structured Data", () => {
  const mockProfile: ProfileData = {
    name: "Alberto Fernández Bellido",
    title: "Senior Full-Stack Developer",
    short_bio: "Desarrollador enfocado en rendimiento y cloud.",
    about_story: "Historia de Alberto...",
    avatar_url: "https://example.com/avatar.jpg",
    location: "España",
    email: "alberto@example.com",
    status_badge: "Disponible",
    github_url: "https://github.com/alberFdezBell",
    linkedin_url: "https://linkedin.com/in/alberto",
  };

  const siteUrl = "http://localhost:1886";

  it("generates valid Schema.org Person metadata", () => {
    const schema = generatePersonSchema(mockProfile, siteUrl);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Alberto Fernández Bellido");
    expect(schema.jobTitle).toBe("Senior Full-Stack Developer");
    expect(schema.sameAs).toContain("https://github.com/alberFdezBell");
    expect(schema.sameAs).toContain("https://linkedin.com/in/alberto");
  });

  it("generates valid Schema.org WebSite metadata", () => {
    const schema = generateWebSiteSchema(mockProfile, siteUrl);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toContain("Alberto Fernández Bellido");
    expect(schema.url).toBe(siteUrl);
  });
});
