"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { KnowledgeCategoryItem } from "./KnowledgeSection";

interface KnowledgeDetailViewProps {
  category: KnowledgeCategoryItem;
  onClose: () => void;
  backLabel?: string;
  onOpenAllCategories?: () => void;
}

export function KnowledgeDetailView({
  category,
  onClose,
  backLabel = "Volver",
  onOpenAllCategories,
}: KnowledgeDetailViewProps) {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    // Prevent accidental clicks on the back button during entry slide
    const timer = setTimeout(() => {
      setCanClose(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleSafeClose = () => {
    if (!canClose) return;
    onClose();
  };

  return (
    <div className="h-full w-full flex bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Botón vertical a la izquierda que ocupa todo el alto para volver hacia la izquierda */}
      <button
        type="button"
        onClick={handleSafeClose}
        aria-label="Volver a la selección de categorías"
        className="h-full w-12 sm:w-16 shrink-0 border-r border-white/10 bg-[#060a12] hover:bg-slate-900/80 flex items-center justify-center cursor-pointer transition-colors group z-30 select-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/40"
      >
        <div className="flex items-center justify-center p-2">
          <svg
            width="24"
            height="56"
            viewBox="0 0 24 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 group-hover:text-emerald-400 transition-all duration-300 ease-out origin-center transform scale-y-[0.45] group-hover:scale-y-[0.60] group-hover:-translate-x-0.5"
          >
            <polyline points="15 6 8 28 15 50" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </button>

      {/* Visor de contenido Markdown / Blog */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-16 space-y-10">
          {/* Cabecera del artículo */}
          <div className="space-y-4 pb-8 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-widest text-emerald-400 uppercase">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>05 / Conocimientos</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">Categoría</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {category.name}
            </h1>

            <div className="flex items-center gap-2 pt-1 font-mono text-xs text-slate-400">
              <BookOpen size={14} className="text-emerald-400" />
              <span>Notas técnicas & documentación</span>
            </div>
          </div>

          {/* Cuerpo Markdown */}
          <div className="min-h-[300px] text-slate-200">
            {category.content && category.content.trim().length > 0 ? (
              <MarkdownRenderer content={category.content} />
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-10 text-center text-slate-400 font-mono text-sm">
                No hay contenido disponible para esta categoría por el momento.
              </div>
            )}
          </div>

          {/* Navegación al pie del artículo */}
          <div className="pt-10 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSafeClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-sm font-mono text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <ArrowLeft size={16} />
              <span>{backLabel}</span>
            </button>

            {onOpenAllCategories && (
              <button
                type="button"
                onClick={onOpenAllCategories}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-sm font-mono transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <span>Ver todas las categorías</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

