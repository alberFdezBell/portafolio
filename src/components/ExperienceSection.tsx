"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";

export interface ExperienceItem {
  id: number;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: number;
  description: string;
  skills: string; // JSON string array
}

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="experiencia" className="py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-16">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>02 / Carrera y Experiencia</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Trayectoria Profesional
            </h2>
          </div>
        </ScrollReveal>

        {/* Open Editorial Timeline / Dossier (No Heavy Cards) */}
        <StaggerContainer
          staggerDelay={0.08}
          className="space-y-12 sm:space-y-16"
        >
          {experiences.map((exp) => {
            const isExpanded = !!expandedIds[exp.id];
            let parsedSkills: string[] = [];
            try {
              parsedSkills = JSON.parse(exp.skills || "[]");
            } catch {
              parsedSkills = exp.skills ? exp.skills.split(",").map((s) => s.trim()) : [];
            }

            return (
              <StaggerItem key={exp.id} yOffset={20}>
                <article className="border-b border-white/5 pb-12 sm:pb-16 last:border-b-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                  
                  {/* Left Column: Metadata (Period, Company, Location) */}
                  <div className="lg:col-span-4 space-y-2 font-mono">
                    <span className="inline-block text-xs text-emerald-400 font-semibold tracking-wide">
                      {exp.start_date} — {exp.is_current ? "Presente" : exp.end_date}
                    </span>
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      {exp.company}
                    </h4>
                    {exp.location && (
                      <p className="text-xs text-slate-500">
                        {exp.location}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Role, Expandable Narrative & Technologies */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {exp.role}
                      </h3>

                      <button
                        type="button"
                        onClick={() => toggleExpand(exp.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`exp-desc-${exp.id}`}
                        aria-label={isExpanded ? `Ocultar descripción de ${exp.role}` : `Mostrar descripción de ${exp.role}`}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                          isExpanded
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10"
                            : "bg-slate-900/60 border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80"
                        }`}
                      >
                        <ChevronRight
                          size={18}
                          className={`transition-transform duration-300 ease-in-out ${
                            isExpanded ? "rotate-90 text-emerald-400" : "rotate-0 text-slate-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expandable Description with smooth CSS Grid animation */}
                    <div
                      id={`exp-desc-${exp.id}`}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-2 pb-1">
                          {exp.description ? (
                            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed whitespace-pre-line font-normal border-l-2 border-emerald-500/30 pl-4 py-1.5 bg-emerald-500/[0.02] rounded-r-lg">
                              {exp.description}
                            </p>
                          ) : (
                            <p className="text-xs font-mono text-slate-500 italic pl-4 py-1">
                              Descripción detallada en preparación.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tech stack as clean inline tags (no nested pill containers) */}
                    {parsedSkills.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-slate-400">
                        <span className="text-slate-600 font-semibold">Tech:</span>
                        {parsedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-slate-400 hover:text-emerald-300 transition-colors"
                          >
                            <span className="text-emerald-500/50">/</span> {skill}
                          </span>
                        ))}
                      </div>
                    )}
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
