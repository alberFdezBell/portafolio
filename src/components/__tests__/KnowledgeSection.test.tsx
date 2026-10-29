import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { KnowledgeSection, KnowledgeCategoryItem } from "../KnowledgeSection";
import { KnowledgeCategoryMenuView } from "../KnowledgeCategoryMenuView";
import { KnowledgeDetailView } from "../KnowledgeDetailView";

const mockCategories: KnowledgeCategoryItem[] = [
  {
    id: 1,
    name: "Arquitectura Cloud & Docker",
    slug: "arquitectura-cloud-docker",
    content: "# Guía Docker\n\nNotas sobre microservicios y despliegues con Docker Compose.",
    order_num: 1,
  },
  {
    id: 2,
    name: "Frontend & Rendimiento",
    slug: "frontend-rendimiento",
    content: "# Rendimiento Web\n\nOptimización de Core Web Vitals.",
    order_num: 2,
  },
];

describe("Knowledge Components", () => {
  describe("KnowledgeSection", () => {
    it("renders section 05 and category count badge", () => {
      const handleOpen = vi.fn();
      render(
        <KnowledgeSection
          categories={mockCategories}
          onOpenKnowledge={handleOpen}
        />
      );

      expect(screen.getByText("05 / Conocimientos")).toBeInTheDocument();
      expect(screen.getByText(/categorías documentadas/i)).toBeInTheDocument();

      const button = screen.getByRole("button", { name: /explorar menú de categorías de conocimientos/i });
      fireEvent.click(button);
      expect(handleOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe("KnowledgeCategoryMenuView", () => {
    it("renders categories as interactive buttons and selects one", () => {
      const handleSelect = vi.fn();
      const handleClose = vi.fn();

      render(
        <KnowledgeCategoryMenuView
          categories={mockCategories}
          onSelectCategory={handleSelect}
          onClose={handleClose}
        />
      );

      expect(screen.getByText("Arquitectura Cloud & Docker")).toBeInTheDocument();
      expect(screen.getByText("Frontend & Rendimiento")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Arquitectura Cloud & Docker"));
      expect(handleSelect).toHaveBeenCalledWith(mockCategories[0]);
    });
  });

  describe("KnowledgeDetailView", () => {
    it("renders category title and markdown content", () => {
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
    });
  });
});
