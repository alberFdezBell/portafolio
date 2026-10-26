"use client";

import React from "react";
// Lucide icons removed in favor of clean editorial typography
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
            let parsedSkills: string[] = [];
            try {
              parsedSkills = JSON.parse(exp.skills || "[]");
            } catch {
              parsedSkills = exp.skills ? exp.skills.split(",").map((s) => s.trim()) : [];
            }

            return (
              <StaggerItem key={exp.id} yOffset={20}>
                <article className="border-b border-white/5 pb-12 sm:pb-16 last:border-b-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 group">
                  
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

                  {/* Right Column: Role, Narrative & Technologies */}
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {exp.role}
                    </h3>

                    {exp.description && (
                      <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed whitespace-pre-line font-normal">
                        {exp.description}
                      </p>
                    )}

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
