"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ProjectItem, MediaItem, LinkItem } from "./ProjectsSection";

interface ProjectDetailViewProps {
  project: ProjectItem;
  onClose: () => void;
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

function renderStatusBadge(status?: string) {
  const norm = (status || "Producción").trim();
  const isDev = norm === "En desarrollo";
  const isProd = norm === "Producción";

  if (isDev) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>En desarrollo</span>
      </span>
    );
  }

  if (isProd) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Producción</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
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
              {isVideo ? (
                <Video size={13} className="text-cyan-400" />
              ) : (
                <ImageIcon size={13} className="text-emerald-400" />
              )}
              <span>
                {currentIndex + 1} / {media.length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ProjectDetailView({ project, onClose }: ProjectDetailViewProps) {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    // Prevent accidental clicks on the back button during entry slide (e.g. from double-clicking the project card)
    const timer = setTimeout(() => {
      setCanClose(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleSafeClose = () => {
    if (!canClose) return;
    onClose();
  };

  const mediaList = getMediaList(project);
  const linksList = getLinksList(project);

  let techList: string[] = [];
  try {
    techList = JSON.parse(project.tech_stack || "[]");
    if (!Array.isArray(techList)) techList = [];
  } catch {
    techList = project.tech_stack
      ? project.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  }

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

      {/* Contenido principal del proyecto */}
      <div className="flex-1 h-full overflow-y-auto">
        {/* Cabecera del proyecto: fijada arriba a la izquierda en todo el ancho superior como en conocimientos */}
        <div className="w-full px-6 sm:px-12 pt-8 sm:pt-10 pb-6 border-b border-white/10">
          <div className="flex flex-col items-start gap-3">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>03 / Proyectos</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {project.title}
            </h1>

            {/* Pills de estado, proyecto destacado y tecnologías a la derecha */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              {renderStatusBadge(project.status)}
              {project.featured === 1 && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  ★ Proyecto Destacado
                </span>
              )}
              {techList.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-slate-900/60 font-mono text-xs text-slate-300 hover:border-emerald-500/30 hover:text-emerald-300 transition-colors"
                >
                  <span className="text-emerald-400">#</span>
                  <span>{tech}</span>
                </div>
              ))}
            </div>

            {/* Enlaces con icono y nombre */}
            {linksList.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {linksList.map((link, idx) => (
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
            )}
          </div>
        </div>

        {/* Contenido detallado del proyecto */}
        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-16 space-y-10">
          {/* Carrusel multimedia (fotos o videos) */}
          {mediaList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                <span className="w-3 h-px bg-emerald-400" />
                <span>Galería Multimedia</span>
              </h3>
              <ProjectMediaCarousel media={mediaList} title={project.title} />
            </div>
          )}

          {/* Descripción larga con soporte Markdown */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono tracking-wider uppercase text-emerald-400 flex items-center gap-2">
              <span className="w-3 h-px bg-emerald-400" />
              <span>Descripción Detallada</span>
            </h3>
            <div className="pt-1">
              <MarkdownRenderer
                content={project.long_description || project.description || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

