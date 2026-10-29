import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { KnowledgeSection, KnowledgeCategoryItem } from "../KnowledgeSection";
import { KnowledgeDetailView } from "../KnowledgeDetailView";

const mockCategories: KnowledgeCategoryItem[] = [
  {
    id: 1,
    name: "Arquitectura Cloud & Docker",
    slug: "arquitectura-cloud-docker",
    content: "# Guía Docker\n\nNotas sobre microservicios y despliegues con Docker Compose.",
    order_num: 1,
    featured: 1,
  },
  {
    id: 2,
    name: "Frontend & Rendimiento",
    slug: "frontend-rendimiento",
    content: "# Rendimiento Web\n\nOptimización de Core Web Vitals.",
    order_num: 2,
    featured: 1,
  },
  {
    id: 3,
    name: "Seguridad & 2FA",
    slug: "seguridad-2fa",
    content: "# Seguridad Web\n\nAutenticación TOTP y rate limiting.",
    order_num: 3,
    featured: 1,
  },
  {
    id: 4,
    name: "Bases de Datos & SQLite",
    slug: "bases-de-datos",
    content: "# SQLite\n\nModo WAL y rendimiento.",
    order_num: 4,
    featured: 0,
  },
];

describe("Knowledge Components", () => {
  describe("KnowledgeSection", () => {
    it("renders section 05 and all categories without the 'Ver todos los conocimientos' button", () => {
      const handleSelect = vi.fn();

      render(
        <KnowledgeSection
          categories={mockCategories}
          onSelectCategory={handleSelect}
        />
      );

      // Section title
      expect(screen.getByText("05 / Conocimientos")).toBeInTheDocument();

      // All categories are rendered as buttons on main page
      expect(screen.getByText("Arquitectura Cloud & Docker")).toBeInTheDocument();
      expect(screen.getByText("Frontend & Rendimiento")).toBeInTheDocument();
      expect(screen.getByText("Seguridad & 2FA")).toBeInTheDocument();
      expect(screen.getByText("Bases de Datos & SQLite")).toBeInTheDocument();

      // "Ver todos los conocimientos" button is no longer present
      expect(screen.queryByText(/ver todos los conocimientos/i)).not.toBeInTheDocument();

      // Clicking a category calls onSelectCategory
      const card = screen.getByRole("button", {
        name: /ver categoría de conocimiento: arquitectura cloud & docker/i,
      });
      fireEvent.click(card);
      expect(handleSelect).toHaveBeenCalledWith(mockCategories[0]);
    });
  });

  describe("KnowledgeDetailView", () => {
    it("renders category title and markdown content without 'Ver todos los conocimientos' button", () => {
      const handleClose = vi.fn();

      render(
        <KnowledgeDetailView
          category={mockCategories[0]}
          onClose={handleClose}
        />
      );

      expect(screen.getByRole("heading", { level: 1, name: "Arquitectura Cloud & Docker" })).toBeInTheDocument();
      expect(screen.getByText("Guía Docker")).toBeInTheDocument();
      expect(screen.getByText(/Notas sobre microservicios/i)).toBeInTheDocument();

      // Bottom 'Ver todos los conocimientos' button is not present
      expect(screen.queryByText(/ver todos los conocimientos/i)).not.toBeInTheDocument();
    });
  });
});
