"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export interface MediaItem {
  id?: string;
  type: "image" | "video";
  url: string;
  is_primary?: boolean;
  caption?: string;
}

export interface LinkItem {
  title: string;
  url: string;
  icon?: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  long_description?: string;
  tech_stack: string; // JSON array of strings
  image_url: string;
  demo_url: string;
  repo_url: string;
  status?: string; // 'En desarrollo' | 'Producción' | 'Finalizado'
  media?: string; // JSON array of MediaItem
  links?: string; // JSON array of LinkItem
  featured: number;
}

interface ProjectsSectionProps {
  projects: ProjectItem[];
  onSelectProject?: (proj: ProjectItem) => void;
}

const ITEMS_PER_PAGE = 6;

function renderStatusBadge(status?: string) {
  const norm = (status || "Producción").trim();
  const isDev = norm === "En desarrollo";
  const isProd = norm === "Producción";

  if (isDev) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>En desarrollo</span>
      </span>
    );
  }

  if (isProd) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Producción</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
      <span>Finalizado</span>
    </span>
  );
}

export function ProjectsSection({ projects = [], onSelectProject }: ProjectsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const pages = useMemo(() => {
    const chunks: ProjectItem[][] = [];
    for (let i = 0; i < projects.length; i += ITEMS_PER_PAGE) {
      chunks.push(projects.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  }, [projects]);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  return (
    <section id="proyectos" className="scroll-mt-20 py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
                <span>03 / Proyectos</span>
              </div>
            </div>
            <span className="font-mono text-xs text-slate-500 pb-1">
              [ {projects.length} sistemas documentados ]
            </span>
          </div>
        </ScrollReveal>

        {projects.length > 0 ? (
          <ScrollReveal yOffset={20} delay={0.1}>
            {/* Sliding Carousel Viewport */}
            <div className="relative overflow-hidden w-full">
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                {pages.map((pageProjects, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    aria-hidden={pageIndex !== currentPage}
                  >
                    {pageProjects.map((proj) => {
                      let parsedTech: string[] = [];
                      try {
                        parsedTech = JSON.parse(proj.tech_stack || "[]");
                      } catch {
                        parsedTech = proj.tech_stack
                          ? proj.tech_stack.split(",").map((s) => s.trim())
                          : [];
                      }

                      return (
                        <article
                          key={proj.id}
                          role="button"
                          tabIndex={pageIndex === currentPage ? 0 : -1}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectProject?.(proj);
                          }}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectProject?.(proj);
                            }
                          }}
                          aria-label={`Ver detalles del proyecto ${proj.title}`}
                          className="aspect-square w-full group rounded-xl border border-white/10 hover:border-emerald-500/40 bg-slate-900/30 hover:bg-slate-900/70 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm active:scale-[0.99] select-none"
                        >
                          {/* Arriba a la derecha: Estado (solamente la pill de estado) */}
                          <div className="flex items-center justify-end w-full">
                            {renderStatusBadge(proj.status)}
                          </div>

                          {/* Centro: Nombre del proyecto */}
                          <div className="my-auto py-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight line-clamp-3">
                              {proj.title}
                            </h3>
                          </div>

                          {/* Abajo a la izquierda: primeras tecnologias | Abajo a la derecha: Ver proyecto */}
                          <div className="flex items-end justify-between gap-3 pt-4 border-t border-white/5 font-mono text-xs">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 overflow-hidden line-clamp-1 max-w-[65%]">
                              {parsedTech.slice(0, 3).map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="hover:text-emerald-300 transition-colors"
                                >
                                  #{tech}
                                </span>
                              ))}
                            </div>
                            <span className="text-[11px] sm:text-xs text-slate-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1 shrink-0">
                              <span>Ver proyecto</span>
                              <ArrowRight
                                size={13}
                                className="group-hover:translate-x-0.5 transition-transform"
                              />
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination controls when > 6 projects */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xs sm:text-sm text-slate-400 select-none">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  aria-label="Página anterior de proyectos"
                  className="p-1.5 sm:p-2 rounded-lg border border-white/10 hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-slate-300 tracking-wider">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  aria-label="Página siguiente de proyectos"
                  className="p-1.5 sm:p-2 rounded-lg border border-white/10 hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </ScrollReveal>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-12 text-center text-slate-400 font-mono text-sm">
            No hay proyectos registrados actualmente.
          </div>
        )}
      </div>
    </section>
  );
}