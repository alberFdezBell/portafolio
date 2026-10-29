"use client";

import React, { useState, useEffect } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { KnowledgeCategoryItem } from "./KnowledgeSection";

interface KnowledgeDetailViewProps {
  category: KnowledgeCategoryItem;
  onClose: () => void;
  backLabel?: string;
}

export function KnowledgeDetailView({
  category,
  onClose,
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
        {/* Cabecera del artículo: fijada arriba a la izquierda en todo el ancho superior */}
        <div className="w-full px-6 sm:px-12 pt-8 sm:pt-10 pb-6 border-b border-white/10">
          <div className="flex flex-col items-start gap-2">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>05 / Conocimientos</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {category.name}
            </h1>
          </div>
        </div>

        {/* Contenido .md centrado en el medio */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10">
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
        </div>
      </div>
    </div>
  );
}
