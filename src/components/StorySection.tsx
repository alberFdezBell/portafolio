"use client";

import React from "react";
import { Terminal } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

interface StorySectionProps {
  aboutStory: string;
  avatarUrl: string;
  name: string;
}

export function StorySection({ aboutStory, avatarUrl, name }: StorySectionProps) {
  const paragraphs = (aboutStory || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="historia" className="py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-16">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>01 / Trayectoria & Filosofía</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              La trayectoria detrás del código
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono mt-3">
              De comprender el hardware y las redes a diseñar arquitecturas de software modernas, resilientes y contenerizadas.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Visual & Principles (Open, No Nested Cards) */}
          <div className="lg:col-span-5 space-y-10">
            <ScrollReveal delay={0.08} yOffset={24}>
              <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/3] sm:aspect-[16/11] w-full">
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534972195531-a756b1129f63?auto=format&fit=crop&w=800&q=80"}
                  alt={`Foto de ${name}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-baseline justify-between font-mono">
                  <span className="text-sm font-semibold text-white">{name}</span>
                  <span className="text-xs text-emerald-400">Software & Cloud</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Engineering Pillars: Open Editorial Stack (No Background Boxes) */}
            <div className="space-y-6 pt-2">
              <ScrollReveal delay={0.12} yOffset={16}>
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono text-emerald-400 pt-0.5 tracking-wider select-none shrink-0">
                    {"01."}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-wide">
                      Simplicidad & Rendimiento
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      Priorizo arquitecturas limpias, componentes mantenibles y tiempos de carga mínimos sin sobreingeniería.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="h-px w-full bg-white/5" aria-hidden="true" />

              <ScrollReveal delay={0.16} yOffset={16}>
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono text-cyan-400 pt-0.5 tracking-wider select-none shrink-0">
                    {"02."}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-wide">
                      Automatización & DevOps
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      Todo lo que puede ser automatizado debe serlo: pipelines CI/CD continuos, contenedores Docker y orquestación con Portainer.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="h-px w-full bg-white/5" aria-hidden="true" />

              <ScrollReveal delay={0.2} yOffset={16}>
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono text-emerald-400 pt-0.5 tracking-wider select-none shrink-0">
                    {"03."}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-wide">
                      Seguridad por Diseño
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      Protección estricta en servidor, rate limiting, cookies HttpOnly seguras y autenticación multifactor (2FA/TOTP).
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Right Column: Narrative Story (Open Editorial Reading Experience) */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.12} yOffset={24}>
              <article className="border-l-2 border-emerald-500/20 pl-6 sm:pl-10 py-1 space-y-6 text-slate-300">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pb-2">
                  <Terminal size={13} className="text-emerald-400" />
                  <span>log://narrativa-profesional</span>
                </div>

                {paragraphs.length > 0 ? (
                  paragraphs.map((p, index) => (
                    <p
                      key={index}
                      className="text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal"
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500 italic font-mono text-sm">
                    Historia pendiente de configurar desde el panel de administración.
                  </p>
                )}

                <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
                  <span>EOF // bio documentada</span>
                  <span className="text-emerald-400/80">alberto@dev:~$ ready_for_scale</span>
                </div>
              </article>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
