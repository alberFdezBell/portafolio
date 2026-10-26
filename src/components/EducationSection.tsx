"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
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
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

        {/* Education List */}
        <StaggerContainer
          staggerDelay={0.08}
          className="space-y-6 sm:space-y-8"
        >
          {education.map((item) => {
            const isExpanded = !!expandedIds[item.id];

            return (
              <StaggerItem key={item.id} yOffset={16}>
                <div className="relative p-6 sm:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                  {/* Diffused background on all 4 sides */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-white/[0.05] [box-shadow:inset_0_0_20px_6px_#090d16] pointer-events-none rounded-2xl"
                  />
                  
                  {/* Left Column: Years / Timeline & Institution */}
                  <div className="relative z-10 md:col-span-4 font-mono space-y-1">
                    <span className="text-xs text-emerald-400 font-semibold tracking-wide">
                      {item.start_year} — {item.end_year}
                    </span>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {item.institution}
                    </p>
                  </div>

                  {/* Right Column: Degree Header (Interactive with chevron) & Expandable Description */}
                  <div className="relative z-10 md:col-span-8 space-y-2">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpand(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(item.id);
                        }
                      }}
                      aria-expanded={isExpanded}
                      aria-controls={`edu-desc-${item.id}`}
                      aria-label={isExpanded ? `Ocultar descripción de ${item.degree}` : `Mostrar descripción de ${item.degree}`}
                      className="group/degree inline-flex items-center gap-2 flex-wrap cursor-pointer focus:outline-none select-none"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight transition-colors duration-300 group-hover/degree:text-slate-400">
                        {item.degree}
                      </h3>

                      <span className="p-1 text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center justify-center">
                        <ChevronRight
                          size={18}
                          className={`transition-transform duration-300 ease-in-out ${
                            isExpanded
                              ? "rotate-90 text-emerald-400"
                              : "rotate-0 text-slate-400 group-hover/degree:text-slate-300"
                          }`}
                        />
                      </span>
                    </div>

                    {item.field_of_study && (
                      <p className="text-xs font-mono text-cyan-400/90">
                        {item.field_of_study}
                      </p>
                    )}

                    {/* Expandable Description with smooth CSS Grid transition */}
                    <div
                      id={`edu-desc-${item.id}`}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out cursor-default ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100 mt-2"
                          : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-2 pb-1">
                          {item.description ? (
                            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed whitespace-pre-line font-normal border-l-2 border-emerald-500/40 pl-4 py-2 bg-black/30 rounded-r-lg">
                              {item.description}
                            </p>
                          ) : (
                            <p className="text-xs font-mono text-slate-500 italic pl-4 py-1">
                              Descripción detallada en preparación.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

      </div>
    </section>
  );
}
