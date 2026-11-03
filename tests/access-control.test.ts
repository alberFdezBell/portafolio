import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isSensitiveRoute,
  isCloudflareProxied,
  isLocalHost,
  isExternalRequest,
} from "@/lib/access-control";

describe("Access Control & Network Security", () => {
  const originalEnv = process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL;
  const originalAllowed = process.env.ALLOWED_LOCAL_HOSTS;

  beforeEach(() => {
    delete process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL;
    delete process.env.ALLOWED_LOCAL_HOSTS;
  });

  afterEach(() => {
    process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL = originalEnv;
    process.env.ALLOWED_LOCAL_HOSTS = originalAllowed;
  });

  describe("isSensitiveRoute", () => {
    it("flags sensitive administration routes", () => {
      expect(isSensitiveRoute("/login")).toBe(true);
      expect(isSensitiveRoute("/login/")).toBe(true);
      expect(isSensitiveRoute("/LOGIN")).toBe(true);
      expect(isSensitiveRoute("/admin")).toBe(true);
      expect(isSensitiveRoute("/admin/")).toBe(true);
      expect(isSensitiveRoute("/admin/projects")).toBe(true);
      expect(isSensitiveRoute("/api/admin")).toBe(true);
      expect(isSensitiveRoute("/api/admin/auth/login")).toBe(true);
      expect(isSensitiveRoute("/api/admin/projects")).toBe(true);
    });

    it("allows public routes", () => {
      expect(isSensitiveRoute("/")).toBe(false);
      expect(isSensitiveRoute("/project/my-app")).toBe(false);
      expect(isSensitiveRoute("/knowledge/react")).toBe(false);
      expect(isSensitiveRoute("/uploads/avatar.webp")).toBe(false);
      expect(isSensitiveRoute("/robots.txt")).toBe(false);
      expect(isSensitiveRoute("/sitemap.xml")).toBe(false);
    });
  });

  describe("isCloudflareProxied", () => {
    it("detects Cloudflare headers correctly", () => {
      const cfHeaders = new Headers({
        "cf-ray": "8d39f4019a-MAD",
        "cf-connecting-ip": "198.51.100.4",
      });
      expect(isCloudflareProxied(cfHeaders)).toBe(true);

      const localHeaders = new Headers({
        host: "localhost:1886",
      });
      expect(isCloudflareProxied(localHeaders)).toBe(false);
    });
  });

  describe("isLocalHost", () => {
    it("recognizes localhost and loopback", () => {
      expect(isLocalHost("localhost")).toBe(true);
      expect(isLocalHost("localhost:1886")).toBe(true);
      expect(isLocalHost("127.0.0.1")).toBe(true);
      expect(isLocalHost("127.0.0.1:1886")).toBe(true);
      expect(isLocalHost("::1")).toBe(true);
      expect(isLocalHost("[::1]:1886")).toBe(true);
    });

    it("recognizes private LAN subnets", () => {
      expect(isLocalHost("192.168.1.100")).toBe(true);
      expect(isLocalHost("192.168.1.100:1886")).toBe(true);
      expect(isLocalHost("10.0.0.15")).toBe(true);
      expect(isLocalHost("172.20.0.5")).toBe(true); // Docker network
    });

    it("recognizes Tailscale CGNAT subnets", () => {
      expect(isLocalHost("100.85.12.34")).toBe(true);
    });

    it("recognizes local domains", () => {
      expect(isLocalHost("my-server.local")).toBe(true);
      expect(isLocalHost("portainer.lan")).toBe(true);
      expect(isLocalHost("nas.home")).toBe(true);
      expect(isLocalHost("internal-service.internal")).toBe(true);
    });

    it("rejects public domain names and public IPs", () => {
      expect(isLocalHost("albertofernandez.dev")).toBe(false);
      expect(isLocalHost("portfolio.mycloudflaredomain.com")).toBe(false);
      expect(isLocalHost("203.0.113.195")).toBe(false);
      expect(isLocalHost("8.8.8.8")).toBe(false);
      expect(isLocalHost(null)).toBe(false);
      expect(isLocalHost("")).toBe(false);
    });

    it("respects ALLOWED_LOCAL_HOSTS custom config", () => {
      process.env.ALLOWED_LOCAL_HOSTS = "casa.alber.me, test-lab.org";
      expect(isLocalHost("casa.alber.me")).toBe(true);
      expect(isLocalHost("test-lab.org:8080")).toBe(true);
      expect(isLocalHost("other.org")).toBe(false);
    });
  });

  describe("isExternalRequest", () => {
    it("flags Cloudflare tunnel requests as external", () => {
      const headers = new Headers({
        host: "portfolio.alberto.dev",
        "cf-ray": "8d39f4019a-MAD",
        "cf-connecting-ip": "203.0.113.50",
      });
      expect(isExternalRequest(headers)).toBe(true);
    });

    it("flags requests with public host as external even without cf headers", () => {
      const headers = new Headers({
        host: "portfolio.alberto.dev",
      });
      expect(isExternalRequest(headers)).toBe(true);
    });

    it("allows direct local requests (localhost:1886)", () => {
      const headers = new Headers({
        host: "localhost:1886",
      });
      expect(isExternalRequest(headers)).toBe(false);
    });

    it("allows direct local LAN requests (192.168.1.50:1886)", () => {
      const headers = new Headers({
        host: "192.168.1.50:1886",
      });
      expect(isExternalRequest(headers)).toBe(false);
    });

    it("allows external requests if RESTRICT_SENSITIVE_ROUTES_TO_LOCAL is set to 'false'", () => {
      process.env.RESTRICT_SENSITIVE_ROUTES_TO_LOCAL = "false";
      const headers = new Headers({
        host: "portfolio.alberto.dev",
        "cf-ray": "8d39f4019a-MAD",
      });
      expect(isExternalRequest(headers)).toBe(false);
    });
  });
});
