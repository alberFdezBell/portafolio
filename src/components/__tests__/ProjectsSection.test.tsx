import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProjectsSection, ProjectItem } from "../ProjectsSection";
import { ProjectDetailView } from "../ProjectDetailView";

const mockProjects: ProjectItem[] = [
  {
    id: 1,
    title: "Sistema E-commerce",
    description: "Plataforma completa de comercio electrónico con Stripe.",
    tech_stack: JSON.stringify(["Next.js", "TypeScript", "TailwindCSS", "PostgreSQL"]),
    image_url: "https://example.com/proj1.jpg",
    demo_url: "https://demo1.com",
    repo_url: "https://github.com/test/proj1",
    status: "Producción",
    featured: 1,
  },
  {
    id: 2,
    title: "Dashboard de Métricas",
    description: "Panel de control en tiempo real con WebSockets.",
    tech_stack: JSON.stringify(["React", "Node.js", "Socket.io"]),
    image_url: "",
    demo_url: "",
    repo_url: "",
    status: "En desarrollo",
    featured: 0,
  },
];

const mockManyProjects: ProjectItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: `Proyecto ${i + 1}`,
  description: `Descripción del proyecto ${i + 1}`,
  tech_stack: JSON.stringify([`Tech${i + 1}`, "React", "TypeScript"]),
  image_url: "",
  demo_url: "",
  repo_url: "",
  status: i % 2 === 0 ? "Producción" : "En desarrollo",
  featured: 0,
}));

describe("ProjectsSection", () => {
  it("renders project cards with title, status pill, first technologies and 'Ver proyecto'", () => {
    const handleSelect = vi.fn();

    render(
      <ProjectsSection
        projects={mockProjects}
        onSelectProject={handleSelect}
      />
    );

    // Section title
    expect(screen.getByText("03 / Proyectos")).toBeInTheDocument();

    // Project titles
    expect(screen.getByText("Sistema E-commerce")).toBeInTheDocument();
    expect(screen.getByText("Dashboard de Métricas")).toBeInTheDocument();

    // Status pills
    expect(screen.getByText("Producción")).toBeInTheDocument();
    expect(screen.getByText("En desarrollo")).toBeInTheDocument();

    // First tech tags (up to 3)
    expect(screen.getByText("#Next.js")).toBeInTheDocument();
    expect(screen.getByText("#TypeScript")).toBeInTheDocument();
    expect(screen.getByText("#TailwindCSS")).toBeInTheDocument();
    // 4th tech should be truncated from the card
    expect(screen.queryByText("#PostgreSQL")).not.toBeInTheDocument();

    // 'Ver proyecto' call-to-action
    const verProyectoButtons = screen.getAllByText("Ver proyecto");
    expect(verProyectoButtons).toHaveLength(2);

    // No description text in the cards
    expect(screen.queryByText("Plataforma completa de comercio electrónico con Stripe.")).not.toBeInTheDocument();

    // Clicking a project card calls onSelectProject
    const card = screen.getByRole("button", {
      name: /ver detalles del proyecto sistema e-commerce/i,
    });
    fireEvent.click(card);
    expect(handleSelect).toHaveBeenCalledWith(mockProjects[0]);

    // No pagination when <= 6
    expect(screen.queryByLabelText(/página anterior/i)).not.toBeInTheDocument();
  });

  it("renders pagination controls and switches page when projects > 6", () => {
    const handleSelect = vi.fn();

    render(
      <ProjectsSection
        projects={mockManyProjects}
        onSelectProject={handleSelect}
      />
    );

    // Page indicator 1 / 2
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    const prevBtn = screen.getByLabelText("Página anterior de proyectos");
    const nextBtn = screen.getByLabelText("Página siguiente de proyectos");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Click next page
    fireEvent.click(nextBtn);
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();
    expect(nextBtn).toBeDisabled();

    // Click previous page
    fireEvent.click(prevBtn);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  describe("ProjectDetailView", () => {
    it("renders project title at top-left and status/featured pills below it", () => {
      const handleClose = vi.fn();

      render(
        <ProjectDetailView
          project={mockProjects[0]}
          onClose={handleClose}
        />
      );

      // Section header indicator
      expect(screen.getByText("03 / Proyectos")).toBeInTheDocument();

      // Heading 1 with project title
      const heading = screen.getByRole("heading", { level: 1, name: "Sistema E-commerce" });
      expect(heading).toBeInTheDocument();

      // Pills
      expect(screen.getByText("Producción")).toBeInTheDocument();
      expect(screen.getByText("★ Proyecto Destacado")).toBeInTheDocument();

      // Links & technologies rendered
      expect(screen.getByText("Código fuente")).toBeInTheDocument();
      expect(screen.getByText("Ejecutar Demo")).toBeInTheDocument();
      expect(screen.getByText("Next.js")).toBeInTheDocument();
    });
  });
});
