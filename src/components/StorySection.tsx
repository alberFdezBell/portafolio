"use client";

import React from "react";
import { BookOpen, Sparkles, Terminal, ShieldCheck, Rocket, Code2 } from "lucide-react";

interface StorySectionProps {
  aboutStory: string;
  avatarUrl: string;
  name: string;
}

export function StorySection({ aboutStory, avatarUrl, name }: StorySectionProps) {
  // Format story paragraphs
  const paragraphs = (aboutStory || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="historia" className="py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-start gap-2 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <BookOpen size={14} />
            <span>01 // BIO & HISTORIA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            La trayectoria detrás del código
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono">
            De comprender el hardware y las redes a construir arquitecturas de software modernas y contenerizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Visual & Principles */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 shadow-xl">
              <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden">
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534972195531-a756b1129f63?auto=format&fit=crop&w=800&q=80"}
                  alt={`Foto de ${name}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-bold text-white font-mono">{name}</p>
                  <p className="text-xs text-emerald-400 font-mono">Software Engineer & DevOps</p>
                </div>
              </div>
            </div>

            {/* Engineering Pillars */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Code2 size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Simplicidad & Rendimiento</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Priorizo arquitecturas limpias, componentes mantenibles y tiempos de carga mínimos sin sobreingeniería.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Rocket size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Automatización & DevOps</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Todo lo que puede ser automatizado debe serlo: CI/CD continuo, despliegues contenerizados en Docker y Portainer.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Seguridad por Diseño</h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Protección estricta de rutas, rate limiting, cookies HttpOnly seguras y autenticación multifactor (2FA/TOTP).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1322]/80 p-6 sm:p-8 space-y-5 text-slate-300 leading-relaxed font-sans shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pb-3 border-b border-white/5">
                <Terminal size={14} className="text-emerald-400" />
                <span>narrative_log.md</span>
              </div>

              {paragraphs.length > 0 ? (
                paragraphs.map((p, index) => (
                  <p key={index} className="text-base sm:text-lg text-slate-200/90 leading-relaxed">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-slate-400 italic">
                  Historia pendiente de configurar desde el panel de administración.
                </p>
              )}

              {/* Terminal footer note */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>EOF // historia documentada</span>
                <span className="text-emerald-400/80">status: open_for_challenges</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
