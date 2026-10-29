"use client";

import React from "react";
import { ChevronRight, ArrowRight, Layers } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export interface KnowledgeCategoryItem {
  id: number;
  name: string;
  slug?: string;
  content: string;
  order_num?: number;
  featured?: number;
}

interface KnowledgeSectionProps {
  categories: KnowledgeCategoryItem[];
  onSelectCategory: (category: KnowledgeCategoryItem) => void;
  onOpenAllKnowledge: () => void;
}

export function KnowledgeSection({
  categories = [],
  onSelectCategory,
  onOpenAllKnowledge,
}: KnowledgeSectionProps) {
  // Select up to 3 featured categories defined in admin; fallback to first 3 if none marked
  const featuredList = categories.filter((c) => c.featured === 1);
  const displayCategories =
    featuredList.length > 0 ? featuredList.slice(0, 3) : categories.slice(0, 3);

  return (
    <section
      id="conocimientos"
      className="scroll-mt-20 py-28 border-t border-white/5 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-12">
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

        {/* 3 Featured Categories (exact same card buttons as in the Categories Menu) */}
        {displayCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 pt-2">
            {displayCategories.map((cat, idx) => (
              <ScrollReveal key={cat.id} delay={0.05 * (idx + 1)} yOffset={15}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  aria-label={`Ver categoría de conocimiento: ${cat.name}`}
                  className="group w-full p-6 sm:p-7 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/90 hover:border-emerald-500/40 transition-all duration-200 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-sm active:scale-[0.99]"
                >
                  <span className="text-lg sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0">
                    <span className="text-xs font-mono hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir
                    </span>
                    <ChevronRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-12 text-center text-slate-400 font-mono text-sm">
            No hay categorías de conocimientos registradas actualmente.
          </div>
        )}

        {/* Button to explore all knowledge categories */}
        <ScrollReveal delay={0.22} yOffset={15}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenAllKnowledge}
              aria-label="Ver todos los conocimientos"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border border-white/10 bg-slate-900/70 hover:bg-slate-800 text-white hover:text-emerald-300 hover:border-emerald-500/40 font-mono text-xs sm:text-sm font-semibold transition-all shadow-lg active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 group"
            >
              <Layers size={16} className="text-emerald-400" />
              <span>Ver todos los conocimientos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 group-hover:text-emerald-300">
                {categories.length}
              </span>
              <ArrowRight
                size={15}
                className="text-emerald-400 group-hover:translate-x-1 transition-transform ml-0.5"
              />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
