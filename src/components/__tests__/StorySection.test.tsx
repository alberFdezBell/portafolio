import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StorySection } from "../StorySection";

describe("StorySection component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with enlarged category header '01 / Sobre mí'", () => {
    render(
      <StorySection
        aboutStory="Esta es mi historia técnica."
        avatarUrl="/alberto01.webp"
        name="Alberto"
      />
    );

    const header = screen.getByText("01 / Sobre mí");
    expect(header).toBeInTheDocument();
  });

  it("reserves image aspect ratio to prevent CLS / layout shift", () => {
    const { container } = render(
      <StorySection
        aboutStory="Historia de prueba"
        avatarUrl="/alberto01.webp"
        name="Alberto"
      />
    );

    const imageWrapper = container.querySelector(".aspect-\\[817\\/1448\\]");
    expect(imageWrapper).toBeInTheDocument();

    const img = screen.getByAltText("Foto de Alberto");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("width", "817");
    expect(img).toHaveAttribute("height", "1448");
  });
});
