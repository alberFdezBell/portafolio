import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/uploads/[filename]/route";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

describe("Dynamic Uploads Route Handler", () => {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const testFileName = "test-image.png";
  const testFilePath = path.join(uploadsDir, testFileName);

  beforeEach(() => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, Buffer.from("fake-png-bytes"));
  });

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it("serves existing uploaded file with correct Content-Type and Cache-Control headers", async () => {
    const req = new NextRequest(`http://localhost:1886/uploads/${testFileName}`);
    const res = await GET(req, {
      params: Promise.resolve({ filename: testFileName }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toContain("max-age=31536000");
    const body = await res.arrayBuffer();
    expect(Buffer.from(body).toString()).toBe("fake-png-bytes");
  });

  it("returns 404 for non-existent file", async () => {
    const req = new NextRequest("http://localhost:1886/uploads/missing.jpg");
    const res = await GET(req, {
      params: Promise.resolve({ filename: "missing.jpg" }),
    });

    expect(res.status).toBe(404);
  });

  it("blocks path traversal attempts with 400", async () => {
    const req = new NextRequest("http://localhost:1886/uploads/..%2F..%2Fsecret.txt");
    const res = await GET(req, {
      params: Promise.resolve({ filename: "../../secret.txt" }),
    });

    expect(res.status).toBe(400);
  });
});
