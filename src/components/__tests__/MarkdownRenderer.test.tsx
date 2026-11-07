import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MarkdownRenderer } from "../MarkdownRenderer";

describe("MarkdownRenderer component", () => {
  it("renders images at native resolution without borders, captions or forced scaling", () => {
    const markdownContent = "![Diagrama de arquitectura](/uploads/architecture.png)";

    const { container } = render(<MarkdownRenderer content={markdownContent} />);

    const img = screen.getByAltText("Diagrama de arquitectura");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/uploads/architecture.png");

    // Native resolution classes (no standalone w-full, no max-h-[550px], no object-contain)
    const classes = img.className.split(" ");
    expect(classes).toContain("max-w-full");
    expect(classes).toContain("h-auto");
    expect(classes).not.toContain("w-full");
    expect(img.className).not.toContain("max-h-");
    expect(classes).not.toContain("object-contain");

    // No visible caption box with alt text (only present as img alt attribute)
    expect(screen.queryByText("Diagrama de arquitectura")).not.toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Diagrama de arquitectura");

    // No borders or decorative containers
    const borderElements = container.querySelectorAll(".border, .border-white\\/10, .border-t");
    expect(borderElements).toHaveLength(0);
  });

  it("renders multiple consecutive images inline side-by-side without block wrappers", () => {
    const markdownContent = "![Logo 1](/uploads/logo1.png) ![Logo 2](/uploads/logo2.png)";

    const { container } = render(<MarkdownRenderer content={markdownContent} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);

    expect(images[0]).toHaveClass("inline-block");
    expect(images[1]).toHaveClass("inline-block");
    expect(images[0]).toHaveAttribute("src", "/uploads/logo1.png");
    expect(images[1]).toHaveAttribute("src", "/uploads/logo2.png");

    // Ensure neither image is wrapped in a block container
    const blockWrappers = container.querySelectorAll("span.block");
    expect(blockWrappers).toHaveLength(0);
  });
});
