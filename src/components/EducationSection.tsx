"use client";

import React from "react";
import { GraduationCap, Award, Calendar } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";

export interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  description: string;
}

interface EducationSectionProps {
  education: EducationItem[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section id="estudios" className="py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start gap-2 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <GraduationCap size={14} />
              <span>04 // FORMACIÓN Y CERTIFICACIONES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Educación & Certificaciones
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono">
              Bases académicas, especializaciones en ingeniería de software y credenciales oficiales.
            </p>
          </div>
        </ScrollReveal>

        {/* Education Grid with Staggered Scroll Reveal */}
        <StaggerContainer staggerDelay={0.09} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {education.map((item) => (
            <StaggerItem key={item.id} yOffset={22}>
              <div className="h-full rounded-2xl border border-white/10 bg-[#0d1322]/80 p-6 sm:p-7 shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Award size={20} />
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-white/5 text-xs font-mono text-slate-300">
                      <Calendar size={12} className="text-emerald-400" />
                      {item.start_year} — {item.end_year}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.degree}
                    </h3>
                    <p className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                      {item.institution} {item.field_of_study ? `// ${item.field_of_study}` : ""}
                    </p>
                  </div>

                  {item.description && (
                    <p className="text-sm text-slate-300 leading-relaxed pt-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
