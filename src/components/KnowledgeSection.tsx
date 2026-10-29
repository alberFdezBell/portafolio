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

        {/* 3 Featured Categories Grid */}
        {displayCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {displayCategories.map((cat, idx) => (
              <ScrollReveal key={cat.id} delay={0.06 * (idx + 1)} yOffset={20} className="h-full">
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  aria-label={`Ver categoría de conocimiento: ${cat.name}`}
                  className="group w-full h-full p-6 sm:p-7 rounded-2xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/70 hover:border-emerald-500/40 transition-all duration-300 text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm relative overflow-hidden"
                >
                  {/* Subtle hover accent light */}
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/[0.04] rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                        <BookOpen size={16} />
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-emerald-400 transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight line-clamp-2">
                      {cat.name}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm font-mono line-clamp-3">
                      Notas técnicas, patrones y documentación sobre {cat.name}.
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-emerald-300 transition-colors relative z-10">
                    <span>Leer artículo</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform text-emerald-400"
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
        <ScrollReveal delay={0.24} yOffset={15}>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
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
