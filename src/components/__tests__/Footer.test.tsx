import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { Footer, SocialLinkItem } from "../Footer";

describe("Footer component", () => {
  const mockSocialLinks: SocialLinkItem[] = [
    {
      id: 1,
      platform: "GitHub",
      url: "https://github.com/alberFdezBell",
      icon_name: "github",
    },
    {
      id: 2,
      platform: "LinkedIn",
      url: "https://linkedin.com/in/alberto",
      icon_name: "linkedin",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with id='contacto' and proper section title", () => {
    const { container } = render(
      <Footer
        email="test@example.com"
        location="Madrid, España"
        socialLinks={mockSocialLinks}
      />
    );

    const footer = container.querySelector("#contacto");
    expect(footer).toBeInTheDocument();
    expect(footer?.className).toContain("scroll-mt-24");

    expect(
      screen.getByText("¿Tienes un proyecto en mente?")
    ).toBeInTheDocument();
  });

  it("renders email, location, and social links correctly", () => {
    render(
      <Footer
        email="dev@example.com"
        location="Madrid, España"
        socialLinks={mockSocialLinks}
      />
    );

    expect(screen.getByText("dev@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Ubicación: Madrid, España/i)).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();

    const githubLink = screen.getByRole("link", { name: /GitHub/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/alberFdezBell");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    const mailtoLink = screen.getByRole("link", { name: /Enviar correo electrónico/i });
    expect(mailtoLink).toHaveAttribute("href", "mailto:dev@example.com");
  });

  it("renders copyright with current year and brand identity", () => {
    const currentYear = new Date().getFullYear();
    render(
      <Footer
        email="dev@example.com"
        location="Madrid, España"
        socialLinks={mockSocialLinks}
      />
    );

    expect(
      screen.getByText(
        new RegExp(`Portafolio Autónomo © ${currentYear} Alberto Fernández Bellido`, "i")
      )
    ).toBeInTheDocument();

    const img = screen.getByAltText("Alberto Fernández Bellido");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/afb.webp");
  });

  it("handles copy email to clipboard with user feedback", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <Footer
        email="dev@example.com"
        socialLinks={mockSocialLinks}
      />
    );

    const copyBtn = screen.getByRole("button", {
      name: /Copiar correo electrónico al portapapeles/i,
    });
    expect(copyBtn).toBeInTheDocument();
    expect(screen.getByText("Copiar")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith("dev@example.com");
    expect(screen.getByText("Copiado")).toBeInTheDocument();
  });

  it("gracefully handles empty or optional props", () => {
    const { container } = render(
      <Footer email="" socialLinks={[]} />
    );

    const footer = container.querySelector("#contacto");
    expect(footer).toBeInTheDocument();
    expect(screen.queryByText(/Ubicación:/i)).not.toBeInTheDocument();
  });
});
