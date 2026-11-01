"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { KnowledgeCategoryItem } from "@/components/KnowledgeSection";
import { KnowledgeDetailView } from "@/components/KnowledgeDetailView";

interface KnowledgePageClientProps {
  category: KnowledgeCategoryItem;
}

export function KnowledgePageClient({ category }: KnowledgePageClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    window.location.href = "/#conocimientos";
  };

  return (
    <div
      className={`min-h-screen bg-[#090d16] text-slate-100 flex flex-col transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Minimal top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#090d16]/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-3">
          <Link
            href="/#conocimientos"
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none focus-visible:text-emerald-400"
            aria-label="Volver a Conocimientos"
          >
            <ChevronLeft size={16} />
            <span>Conocimientos</span>
          </Link>
          <span className="text-slate-600 text-xs font-mono">/</span>
          <span className="font-mono text-xs text-slate-300 truncate max-w-[200px] sm:max-w-none">
            {category.name}
          </span>
        </div>
      </header>

      <div className="flex-1 pt-12">
        <KnowledgeDetailView category={category} onClose={handleClose} />
      </div>
    </div>
  );
}
