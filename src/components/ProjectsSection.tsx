"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  tech_stack: string; // JSON array of strings
  image_url: string;
  demo_url: string;
  repo_url: string;
  featured: number;
}

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
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

        {/* Refined Projects Grid (Clean Borders, No Unnecessary Inner Boxes) */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj) => {
            let parsedTech: string[] = [];
            try {
              parsedTech = JSON.parse(proj.tech_stack || "[]");
            } catch {
              parsedTech = proj.tech_stack ? proj.tech_stack.split(",").map((s) => s.trim()) : [];
            }

            return (
              <StaggerItem key={proj.id} yOffset={22}>
                <article className="h-full group rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden bg-slate-900/30">
                  
                  {/* Project Image */}
                  {proj.image_url && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 border-b border-white/5">
                      <img
                        src={proj.image_url}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-60" />

                      {proj.featured === 1 && (
                        <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-300 bg-[#090d16]/90 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                          ★ Destacado
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {proj.title}
                        </h3>
                        {!proj.image_url && proj.featured === 1 && (
                          <span className="text-[11px] font-mono text-emerald-400">
                            ★ Destacado
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-300/90 leading-relaxed font-normal">
                        {proj.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Tech stack as clean inline typography */}
                      {parsedTech.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
                          {parsedTech.map((tech, idx) => (
                            <span key={idx} className="hover:text-emerald-300 transition-colors">
                              #{tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="pt-4 border-t border-white/5 flex items-center gap-4 text-xs font-mono">
                        {proj.repo_url && (
                          <a
                            href={proj.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                          >
                            <DynamicIcon name="github" size={14} />
                            <span>Código fuente</span>
                          </a>
                        )}

                        {proj.demo_url && proj.demo_url !== "#" && (
                          <a
                            href={proj.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium ml-auto"
                          >
                            <span>Ejecutar Demo</span>
                            <ExternalLink size={13} />
                          </a>
                        )}
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
