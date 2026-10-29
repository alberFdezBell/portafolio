"use client";

import React from "react";
import { BookOpen, ArrowRight, Layers } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export interface KnowledgeCategoryItem {
  id: number;
  name: string;
  slug?: string;
  content: string;
  order_num?: number;
}

interface KnowledgeSectionProps {
  categories: KnowledgeCategoryItem[];
  onOpenKnowledge: () => void;
}

export function KnowledgeSection({
  categories = [],
  onOpenKnowledge,
}: KnowledgeSectionProps) {
  return (
    <section
      id="conocimientos"
      className="scroll-mt-20 py-28 border-t border-white/5 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-16">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>05 / Conocimientos</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Conocimientos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono mt-3">
              Base de conocimientos técnicos, patrones de arquitectura, contenedores y decisiones de ingeniería.
            </p>
          </div>
        </ScrollReveal>

        {/* Hero Interactive Entry Card */}
        <ScrollReveal delay={0.08} yOffset={20}>
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenKnowledge}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenKnowledge();
              }
            }}
            aria-label="Explorar menú de categorías de conocimientos"
            className="group relative p-7 sm:p-10 rounded-2xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/60 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/50 select-none"
          >
            {/* Ambient subtle glow background */}
            <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-emerald-500/[0.06] rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
                  <BookOpen size={14} className="text-emerald-400" />
                  <span>
                    {categories.length}{" "}
                    {categories.length === 1
                      ? "categoría documentada"
                      : "categorías documentadas"}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight">
                  Explorar Repositorio de Conocimientos
                </h3>

                <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed font-normal">
                  Accede al menú interactivo de categorías técnicas. Cada categoría incluye artículos en formato Markdown con diagramas, fragmentos de código e imágenes ilustrativas.
                </p>

                {/* Preview badges of available categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {categories.slice(0, 4).map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 group-hover:border-emerald-500/20 transition-colors"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {categories.length > 4 && (
                      <span className="text-xs font-mono text-slate-500">
                        +{categories.length - 4} más
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <span className="px-6 py-3.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs sm:text-sm font-mono flex items-center gap-2.5 group-hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  <Layers size={16} />
                  <span>Ver Categorías</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

