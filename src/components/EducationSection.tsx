"use client";

import React from "react";
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
    <section id="estudios" className="py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-16">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>04 / Formación</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Educación & Especialización
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono mt-3">
              Bases académicas formales, certificaciones y profundización en ingeniería.
            </p>
          </div>
        </ScrollReveal>

        {/* Open Editorial List (Hairline Separators, No Boxes) */}
        <StaggerContainer
          staggerDelay={0.08}
          className="divide-y divide-white/10 border-t border-b border-white/10"
        >
          {education.map((item) => (
            <StaggerItem key={item.id} yOffset={16}>
              <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start group">
                
                {/* Years / Timeline */}
                <div className="md:col-span-3 font-mono">
                  <span className="text-xs text-emerald-400 font-semibold tracking-wide">
                    {item.start_year} — {item.end_year}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.institution}
                  </p>
                </div>

                {/* Degree and Discipline */}
                <div className="md:col-span-5 space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.degree}
                  </h3>
                  {item.field_of_study && (
                    <p className="text-xs font-mono text-cyan-400/90">
                      {item.field_of_study}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-4">
                  {item.description ? (
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  ) : (
                    <span className="text-xs font-mono text-slate-600">—</span>
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
