"use client";

import React from "react";
import { FolderGit2, ExternalLink, GitBranch, Sparkles } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

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
    <section id="proyectos" className="py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-start gap-2 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <FolderGit2 size={14} />
            <span>03 // PORTAFOLIO DE PROYECTOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Proyectos y Arquitecturas
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono">
            Sistemas desplegados, aplicaciones web completas y herramientas open source.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj) => {
            let parsedTech: string[] = [];
            try {
              parsedTech = JSON.parse(proj.tech_stack || "[]");
            } catch {
              parsedTech = proj.tech_stack ? proj.tech_stack.split(",").map((s) => s.trim()) : [];
            }

            return (
              <div
                key={proj.id}
                className="group rounded-2xl border border-white/10 bg-[#0d1322]/80 overflow-hidden shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col"
              >
                {/* Project Image */}
                {proj.image_url && (
                  <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-950 border-b border-white/5">
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-transparent to-transparent opacity-70" />

                    {proj.featured === 1 && (
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-black text-xs font-bold font-mono shadow-md backdrop-blur-md">
                        <Sparkles size={12} />
                        <span>Destacado</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Tech stack */}
                  {parsedTech.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {parsedTech.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-400 group-hover:text-slate-200 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                      >
                        <DynamicIcon name="github" size={14} />
                        <span>Repositorio</span>
                      </a>
                    )}

                    {proj.demo_url && proj.demo_url !== "#" && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <ExternalLink size={14} />
                        <span>Ver Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
