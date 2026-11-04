import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { Navbar } from "../Navbar";

describe("Navbar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  it("is hidden at the top of the page (scrollY <= 20)", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");

    expect(header).toBeInTheDocument();
    expect(header?.className).toContain("-translate-y-full");
    expect(header?.className).toContain("pointer-events-none");
    expect(header?.className).toContain("transition-transform");
    expect(header?.className).toContain("duration-500");
  });

  it("slides down and becomes visible when user scrolls down", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(header?.className).toContain("translate-y-0");
    expect(header?.className).toContain("pointer-events-auto");
    expect(header?.className).not.toContain("pointer-events-none");
  });

  it("remains visible when mobile menu is opened even at the top", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    const menuButton = screen.getByLabelText("Abrir menú");

    fireEvent.click(menuButton);

    expect(header?.className).toContain("translate-y-0");
    expect(header?.className).toContain("pointer-events-auto");
  });
});
