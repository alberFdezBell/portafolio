"use client";

import React from "react";
import { Briefcase, Calendar, MapPin, CheckCircle2 } from "lucide-react";

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
    <section id="experiencia" className="py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-start gap-2 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <Briefcase size={14} />
            <span>02 // TRAYECTORIA LABORAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Experiencia Profesional
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono">
            Empresas, roles clave y proyectos donde he aportado valor y liderado soluciones técnicas.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-white/10 ml-4 sm:ml-6 space-y-12">
          {experiences.map((exp) => {
            let parsedSkills: string[] = [];
            try {
              parsedSkills = JSON.parse(exp.skills || "[]");
            } catch {
              parsedSkills = exp.skills ? exp.skills.split(",").map((s) => s.trim()) : [];
            }

            return (
              <div key={exp.id} className="relative pl-8 sm:pl-10 group">
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#090d16] border-2 border-emerald-400 group-hover:scale-125 transition-transform" />

                <div className="rounded-2xl border border-white/10 bg-[#0d1322]/90 p-6 sm:p-7 shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                        {exp.company}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          {exp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 border border-white/5 text-slate-300">
                        <Calendar size={12} className="text-emerald-400" />
                        {exp.start_date} — {exp.is_current ? "Presente" : exp.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {exp.description && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-4 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}

                  {/* Tech stack pills */}
                  {parsedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/5">
                      {parsedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:text-emerald-300 hover:border-emerald-500/30 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
