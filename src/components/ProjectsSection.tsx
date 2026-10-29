"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";

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

function getPrimaryImage(proj: ProjectItem): string {
  try {
    const parsedMedia: MediaItem[] = JSON.parse(proj.media || "[]");
    if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
      const primary = parsedMedia.find((m) => m.is_primary && m.type === "image");
      if (primary && primary.url) return primary.url;
      const firstImage = parsedMedia.find((m) => m.type === "image");
      if (firstImage && firstImage.url) return firstImage.url;
      if (parsedMedia[0]?.url) return parsedMedia[0].url;
    }
  } catch {
    // fallback
  }
  return proj.image_url || "";
}

function renderStatusBadge(status?: string) {
  const norm = (status || "Producción").trim();
  const isDev = norm === "En desarrollo";
  const isProd = norm === "Producción";

  if (isDev) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>En desarrollo</span>
      </span>
    );
  }

  if (isProd) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Producción</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
      <span>Finalizado</span>
    </span>
  );
}

export function ProjectsSection({ projects, onSelectProject }: ProjectsSectionProps) {
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

        {/* Refined Projects Grid */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj) => {
            let parsedTech: string[] = [];
            try {
              parsedTech = JSON.parse(proj.tech_stack || "[]");
            } catch {
              parsedTech = proj.tech_stack ? proj.tech_stack.split(",").map((s) => s.trim()) : [];
            }

            const primaryImg = getPrimaryImage(proj);

            return (
              <StaggerItem key={proj.id} yOffset={22}>
                <article
                  role="button"
                  tabIndex={0}
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
                  className="h-full group rounded-xl border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/40 transition-all duration-300 flex flex-col justify-between overflow-hidden bg-slate-900/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {/* Primary Image defined from carousel */}
                  {primaryImg ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 border-b border-white/5">
                      <img
                        src={primaryImg}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-60" />

                      {proj.featured === 1 && (
                        <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-300 bg-[#090d16]/90 border border-emerald-500/30 px-2.5 py-0.5 rounded shadow-sm">
                          ★ Destacado
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                          <span>{proj.title}</span>
                        </h3>
                        {!primaryImg && proj.featured === 1 && (
                          <span className="text-[11px] font-mono text-emerald-400">
                            ★ Destacado
                          </span>
                        )}
                      </div>

                      {/* Short Description */}
                      <p className="text-sm text-slate-300/90 leading-relaxed font-normal">
                        {proj.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2 mt-auto">
                      {/* Tech stack */}
                      {parsedTech.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
                          {parsedTech.map((tech, idx) => (
                            <span key={idx} className="hover:text-emerald-300 transition-colors">
                              #{tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Estado en la parte de abajo de la tarjeta */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Estado:</span>
                          {renderStatusBadge(proj.status)}
                        </div>

                        <span className="text-[11px] text-slate-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                          <span>Ver proyecto</span>
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
