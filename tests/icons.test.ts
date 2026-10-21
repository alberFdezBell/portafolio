import { describe, it, expect } from "vitest";
import { getIconRenderer, POPULAR_ICONS } from "@/lib/icons-catalog";

describe("CDN Icons Catalog & Resolver", () => {
  it("resolves popular SimpleIcons via CDN url", () => {
    const github = getIconRenderer("github");
    expect(github.isLucide).toBe(false);
    expect(github.url).toContain("cdn.simpleicons.org/github");

    const docker = getIconRenderer("docker");
    expect(docker.isLucide).toBe(false);
    expect(docker.url).toContain("cdn.simpleicons.org/docker");
  });

  it("resolves Lucide icons properly", () => {
    const mail = getIconRenderer("mail");
    expect(mail.isLucide).toBe(true);
    expect(mail.name).toBe("mail");
  });

  it("handles custom URLs gracefully", () => {
    const custom = getIconRenderer("https://example.com/icon.svg");
    expect(custom.isLucide).toBe(false);
    expect(custom.url).toBe("https://example.com/icon.svg");
  });

  it("provides fallback for undefined", () => {
    const fallback = getIconRenderer();
    expect(fallback.isLucide).toBe(true);
    expect(fallback.name).toBe("external-link");
  });
});
