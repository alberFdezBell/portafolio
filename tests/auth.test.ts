import { describe, it, expect, beforeEach } from "vitest";
import {
  safeCompare,
  createSessionToken,
  verifySessionToken,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  verifyTotpToken,
} from "@/lib/auth";
import { generateSecret, generateSync } from "otplib";

describe("Authentication & Security Module", () => {
  const testIp = "192.168.1.100";

  beforeEach(() => {
    resetRateLimit(testIp);
  });

  describe("safeCompare", () => {
    it("returns true for identical strings", () => {
      expect(safeCompare("super_secure_pass_123", "super_secure_pass_123")).toBe(true);
    });

    it("returns false for different strings", () => {
      expect(safeCompare("passwordA", "passwordB")).toBe(false);
    });

    it("returns false for different length strings", () => {
      expect(safeCompare("short", "longer_password")).toBe(false);
    });
  });

  describe("Session Tokens", () => {
    it("generates and verifies valid session token", () => {
      const username = "admin";
      const token = createSessionToken(username);

      expect(typeof token).toBe("string");
      expect(token).toContain(".");

      const result = verifySessionToken(token);
      expect(result.valid).toBe(true);
      expect(result.username).toBe(username);
    });

    it("rejects tampered session token", () => {
      const token = createSessionToken("admin");
      const tampered = token.slice(0, -4) + "abcd";
      const result = verifySessionToken(tampered);

      expect(result.valid).toBe(false);
    });

    it("rejects invalid format token", () => {
      expect(verifySessionToken("invalid-format").valid).toBe(false);
      expect(verifySessionToken("").valid).toBe(false);
    });
  });

  describe("Rate Limiting", () => {
    it("allows attempts below threshold", () => {
      expect(checkRateLimit(testIp).allowed).toBe(true);
      recordFailedAttempt(testIp);
      expect(checkRateLimit(testIp).allowed).toBe(true);
    });

    it("blocks IP after 5 failed attempts", () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testIp);
      }
      const check = checkRateLimit(testIp);
      expect(check.allowed).toBe(false);
      expect(check.waitSeconds).toBeGreaterThan(0);
    });

    it("unblocks IP when reset", () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testIp);
      }
      expect(checkRateLimit(testIp).allowed).toBe(false);
      resetRateLimit(testIp);
      expect(checkRateLimit(testIp).allowed).toBe(true);
    });
  });

  describe("2FA TOTP Verification", () => {
    it("validates a freshly generated TOTP token against secret", () => {
      const secret = generateSecret();
      const code = generateSync({ secret });

      expect(verifyTotpToken(code, secret)).toBe(true);
    });

    it("rejects an invalid TOTP token", () => {
      const secret = generateSecret();
      expect(verifyTotpToken("000000", secret)).toBe(false);
      expect(verifyTotpToken("invalid", secret)).toBe(false);
    });
  });
});
