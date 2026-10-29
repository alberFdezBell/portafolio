"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { KnowledgeCategoryItem } from "./KnowledgeSection";

interface KnowledgeCategoryMenuViewProps {
  categories: KnowledgeCategoryItem[];
  onSelectCategory: (category: KnowledgeCategoryItem) => void;
  onClose: () => void;
}

export function KnowledgeCategoryMenuView({
  categories = [],
  onSelectCategory,
  onClose,
}: KnowledgeCategoryMenuViewProps) {
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
        aria-label="Volver a la pantalla principal"
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

      {/* Contenedor del menú de categorías */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-16 space-y-10">
          {/* Cabecera */}
          <div className="space-y-4 pb-8 border-b border-white/10">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>05 / Conocimientos</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Categorías
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-mono">
              Selecciona una categoría para explorar sus notas técnicas y documentación.
            </p>
          </div>

          {/* Menú de botones de categorías */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
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
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-slate-400 font-mono text-sm">
              No hay categorías definidas todavía. Añade categorías desde el Panel de Administración.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

