"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
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

function getMediaList(proj: ProjectItem): MediaItem[] {
  try {
    const parsed: MediaItem[] = JSON.parse(proj.media || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((m) => !!m.url);
    }
  } catch {
    // fallback
  }
  if (proj.image_url) {
    return [{ type: "image", url: proj.image_url, is_primary: true }];
  }
  return [];
}

function getLinksList(proj: ProjectItem): LinkItem[] {
  try {
    const parsed: LinkItem[] = JSON.parse(proj.links || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((l) => !!l.url);
    }
  } catch {
    // fallback
  }

  const fallback: LinkItem[] = [];
  if (proj.repo_url) {
    fallback.push({ title: "Código fuente", url: proj.repo_url, icon: "github" });
  }
  if (proj.demo_url && proj.demo_url !== "#") {
    fallback.push({ title: "Ejecutar Demo", url: proj.demo_url, icon: "external-link" });
  }
  return fallback;
}

function renderStatusBadge(status?: string, large = false) {
  const norm = (status || "Producción").trim();
  const isDev = norm === "En desarrollo";
  const isProd = norm === "Producción";

  if (isDev) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono ${
          large ? "text-xs px-3 py-1" : "text-[11px] px-2 py-0.5"
        } rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>En desarrollo</span>
      </span>
    );
  }

  if (isProd) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono ${
          large ? "text-xs px-3 py-1" : "text-[11px] px-2 py-0.5"
        } rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Producción</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono ${
        large ? "text-xs px-3 py-1" : "text-[11px] px-2 py-0.5"
      } rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
      <span>Finalizado</span>
    </span>
  );
}

function ProjectMediaCarousel({ media, title }: { media: MediaItem[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const currentItem = media[currentIndex] || media[0];
  const hasMultiple = media.length > 1;

  const prev = () => setCurrentIndex((prevIdx) => (prevIdx === 0 ? media.length - 1 : prevIdx - 1));
  const next = () => setCurrentIndex((prevIdx) => (prevIdx === media.length - 1 ? 0 : prevIdx + 1));

  const isVideo = currentItem.type === "video";

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
      <div className="relative aspect-[16/9] w-full flex items-center justify-center bg-black/80 overflow-hidden">
        {isVideo ? (
          <video
            key={currentItem.url}
            src={currentItem.url}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={`${title} - Multimedia ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Elemento multimedia anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 backdrop-blur-sm transition-all active:scale-95 z-10"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Elemento multimedia siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 backdrop-blur-sm transition-all active:scale-95 z-10"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators bar */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-between px-4 z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {media.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-emerald-400 w-6"
                      : "bg-white/30 hover:bg-white/60 w-2"
                  }`}
                  aria-label={`Ver elemento ${idx + 1} (${item.type})`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs text-white/90 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 pointer-events-auto">
              {isVideo ? <Video size={13} className="text-cyan-400" /> : <ImageIcon size={13} className="text-emerald-400" />}
              <span>{currentIndex + 1} / {media.length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openProject = (proj: ProjectItem) => {
    setSelectedProject(proj);
    // Request animation frame to guarantee initial class has applied before sliding
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDetailOpen(true);
      });
    });
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeProject = () => {
    setIsDetailOpen(false);
    // Wait for transition duration (500ms) before clearing selected project
    setTimeout(() => {
      setSelectedProject(null);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    }, 500);
  };

  // Keyboard accessibility: ESC closes detail view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDetailOpen) {
        closeProject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailOpen]);

  return (
    <section id="proyectos" className="py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
            <div>
              <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
                <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
                <span>03 / Proyectos</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Sistemas desplegados
              </h2>
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
                  onClick={() => openProject(proj)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProject(proj);
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
                          <ArrowRight
                            size={16}
                            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0"
                          />
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

      {/* Detail Page Overlay with Smooth Horizontal Slide Transition */}
      <div
        aria-hidden={!isDetailOpen}
        className={`fixed inset-0 z-50 flex bg-[#090d16] text-slate-100 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDetailOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {selectedProject && (
          <>
            {/* Botón vertical a la izquierda que ocupa todo el alto para volver hacia la izquierda */}
            <button
              type="button"
              onClick={closeProject}
              aria-label="Volver a la pantalla principal"
              className="h-full w-14 sm:w-20 shrink-0 border-r border-white/10 bg-[#060a12] hover:bg-slate-900/90 text-slate-400 hover:text-emerald-400 flex flex-col items-center justify-between py-8 cursor-pointer transition-all group z-30 select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <div className="p-2.5 rounded-full border border-white/10 bg-white/5 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all group-hover:-translate-x-1">
                <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
              </div>

              <div className="flex-1 flex items-center justify-center my-6">
                <span className="[writing-mode:vertical-lr] rotate-180 font-mono text-[11px] sm:text-xs tracking-[0.25em] uppercase text-slate-400 group-hover:text-emerald-400 font-semibold transition-colors">
                  Volver a la pantalla principal
                </span>
              </div>

              <div className="w-2 h-2 rounded-full bg-emerald-400/60 group-hover:bg-emerald-400 group-hover:scale-125 transition-all shadow-sm shadow-emerald-400/40" />
            </button>

            {/* Project Full Detail Content */}
            <div className="flex-1 h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-16 space-y-10">
                {/* Header: Title, Status, and Links */}
                <div className="space-y-6 pb-8 border-b border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    {renderStatusBadge(selectedProject.status, true)}
                    {selectedProject.featured === 1 && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        ★ Proyecto Destacado
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
                    {selectedProject.title}
                  </h1>

                  {/* Enlaces con icono y nombre */}
                  {(() => {
                    const links = getLinksList(selectedProject);
                    if (links.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 text-xs sm:text-sm font-mono text-white transition-all active:scale-95 shadow-sm"
                          >
                            <DynamicIcon name={link.icon || "external-link"} size={16} />
                            <span>{link.title}</span>
                            <ExternalLink size={12} className="text-slate-400" />
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Multimedia Carousel */}
                {(() => {
                  const media = getMediaList(selectedProject);
                  if (media.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                        <span className="w-3 h-px bg-emerald-400" />
                        <span>Galería Multimedia</span>
                      </h3>
                      <ProjectMediaCarousel media={media} title={selectedProject.title} />
                    </div>
                  );
                })()}

                {/* Stack & Tecnologías */}
                {(() => {
                  let techList: string[] = [];
                  try {
                    techList = JSON.parse(selectedProject.tech_stack || "[]");
                  } catch {
                    techList = selectedProject.tech_stack
                      ? selectedProject.tech_stack.split(",").map((s) => s.trim())
                      : [];
                  }
                  if (techList.length === 0) return null;

                  return (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                        <span className="w-3 h-px bg-emerald-400" />
                        <span>Tecnologías & Arquitectura</span>
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {techList.map((tech, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/60 font-mono text-xs text-slate-300 hover:border-emerald-500/30 hover:text-emerald-300 transition-colors"
                          >
                            <span className="text-emerald-400">#</span>
                            <span>{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Descripción larga */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-xs font-mono tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                    <span className="w-3 h-px bg-emerald-400" />
                    <span>Descripción Detallada</span>
                  </h3>
                  <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                    {selectedProject.long_description ? (
                      <p>{selectedProject.long_description}</p>
                    ) : (
                      <p>{selectedProject.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
