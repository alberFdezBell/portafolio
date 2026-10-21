"use client";

import React, { useState, useMemo } from "react";
import { POPULAR_ICONS, IconItem } from "@/lib/icons-catalog";
import { Search, X, Check } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconId: string) => void;
  selectedIcon?: string;
}

export function IconPickerModal({ isOpen, onClose, onSelect, selectedIcon }: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customInput, setCustomInput] = useState("");

  const filteredIcons = useMemo(() => {
    return POPULAR_ICONS.filter((icon) => {
      const matchesSearch =
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === "all" || icon.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-sm">CDN::</span>
              Buscador de Iconos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona un icono oficial de SimpleIcons CDN o Lucide Icons
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tecnología, red social o icono (ej. github, docker, react, x)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["all", "social", "dev", "cloud", "tool", "general"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors font-mono ${
                  selectedCategory === cat
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Icons */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 py-2">
          {filteredIcons.map((icon: IconItem) => {
            const isSelected = selectedIcon === icon.id || selectedIcon === icon.slug;
            return (
              <button
                key={icon.id}
                onClick={() => {
                  onSelect(icon.id);
                  onClose();
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-white"
                    : "border-white/5 bg-slate-900/50 hover:bg-slate-800/80 hover:border-white/10 text-slate-300"
                }`}
              >
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                  <DynamicIcon name={icon.id} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{icon.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{icon.slug}</p>
                </div>
                {isSelected && <Check size={16} className="text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Custom icon slug or CDN URL */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            placeholder="O escribe slug personalizado (ej: kubernetes) o URL completa..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={() => {
              if (customInput.trim()) {
                onSelect(customInput.trim());
                onClose();
              }
            }}
            disabled={!customInput.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            Usar personalizado
          </button>
        </div>
      </div>
    </div>
  );
}
