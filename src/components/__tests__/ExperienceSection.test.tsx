import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ExperienceSection, ExperienceItem } from "../ExperienceSection";

describe("ExperienceSection component", () => {
  const mockExperiences: ExperienceItem[] = [
    {
      id: 1,
      company: "Gazc Sevilla",
      role: "Técnico Informático",
      location: "Sevilla, España",
      start_date: "01/2026",
      end_date: "04/2026",
      is_current: 0,
      description: "Soporte de sistemas y automatización.",
      skills: JSON.stringify(["Soporte Técnico L1/L2", "Administración de Sistemas", "Scripting"]),
    },
  ];

  it("renders experiences timeline with role and company", () => {
    render(<ExperienceSection experiences={mockExperiences} />);

    expect(screen.getByText("Gazc Sevilla")).toBeInTheDocument();
    expect(screen.getByText("Técnico Informático")).toBeInTheDocument();
    expect(screen.getByText("01/2026 — 04/2026")).toBeInTheDocument();
  });

  it("renders tech stack aligned with first skill without leading slash", () => {
    const { container } = render(<ExperienceSection experiences={mockExperiences} />);

    expect(screen.getByText("Tech:")).toBeInTheDocument();
    expect(screen.getByText("Soporte Técnico L1/L2")).toBeInTheDocument();
    expect(screen.getByText("Administración de Sistemas")).toBeInTheDocument();
    expect(screen.getByText("Scripting")).toBeInTheDocument();

    // Check that Tech: is in a separate label container
    const techLabel = screen.getByText("Tech:");
    expect(techLabel.className).toContain("shrink-0");

    // Skills container has flex-1 and flex-wrap for consistent column alignment
    const skillsContainer = techLabel.nextElementSibling;
    expect(skillsContainer).toBeInTheDocument();
    expect(skillsContainer?.className).toContain("flex-1");
    expect(skillsContainer?.className).toContain("flex-wrap");

    // Check separator slashes
    const slashes = container.querySelectorAll("span[aria-hidden='true']");
    const slashTexts = Array.from(slashes).filter((el) => el.textContent?.trim() === "/");
    // With 3 skills, there should be exactly 2 separator slashes
    expect(slashTexts).toHaveLength(2);
  });

  it("toggles expandable description on click", () => {
    render(<ExperienceSection experiences={mockExperiences} />);

    const button = screen.getByRole("button", { name: /Mostrar descripción de Técnico Informático/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Soporte de sistemas y automatización.")).toBeInTheDocument();
  });
});
