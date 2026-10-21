"use client";

import React from "react";
import { Terminal, ArrowDown, ExternalLink, GitBranch, Server, Cpu } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

interface HeroProps {
  name: string;
  title: string;
  shortBio: string;
  avatarUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  email: string;
}

export function Hero({
  name,
  title,
  shortBio,
  avatarUrl,
  githubUrl,
  linkedinUrl,
  email,
}: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Command line prompt badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 text-xs font-mono text-emerald-400">
              <span className="text-emerald-500 font-bold">$</span>
              <span>cat engineer_profile.json</span>
              <span className="w-2 h-4 bg-emerald-400 animate-pulse ml-1" />
            </div>

            {/* Title & Name */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Hola, soy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  {name}
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-mono text-emerald-300/90 font-medium">
                {title}
              </p>
            </div>

            {/* Short Bio */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              {shortBio}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#proyectos"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <span>Explorar Proyectos</span>
                <ArrowDown size={16} />
              </a>

              <a
                href="#contacto"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-white font-medium text-sm transition-all duration-200 hover:border-white/20 active:scale-95 font-mono"
              >
                <span>Contacto</span>
                <span className="text-slate-500">→</span>
              </a>

              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 hover:border-white/20"
                  aria-label="GitHub de Alberto"
                >
                  <DynamicIcon name="github" size={20} />
                </a>
              )}

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 hover:border-white/20"
                  aria-label="LinkedIn de Alberto"
                >
                  <DynamicIcon name="linkedin" size={20} />
                </a>
              )}
            </div>

            {/* Technical Quick Metrics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 font-mono text-xs text-slate-400">
              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Despliegue</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Server size={14} className="text-emerald-400" /> Portainer :1886
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Stack</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Cpu size={14} className="text-cyan-400" /> Next.js 15 & Docker
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Seguridad</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <GitBranch size={14} className="text-emerald-400" /> 2FA TOTP Active
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Terminal / Card Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-white/10 bg-[#0d1322] shadow-2xl overflow-hidden font-mono text-xs">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#090d16] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-400 text-[11px]">stack-inspector.sh</span>
                </div>
                <div className="text-[10px] text-emerald-400/80 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20">
                  LIVE PORT 1886
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-5 space-y-3.5 text-slate-300 leading-relaxed overflow-x-auto">
                <div className="text-slate-500">
                  # Sistema de infraestructura y portafolio profesional
                </div>
                <div>
                  <span className="text-emerald-400">developer@portafolio</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-cyan-400">~/stack</span>
                  <span className="text-white">$ docker compose ps</span>
                </div>
                <div className="bg-black/50 p-3 rounded-lg border border-white/5 text-[11px] text-slate-300 space-y-1">
                  <div className="text-emerald-400 font-semibold">NAME: portfolio-app</div>
                  <div>STATUS: Up & Healthy</div>
                  <div>PORTS: 0.0.0.0:1886-&gt;1886/tcp</div>
                  <div>VOLUME: /app/data (SQLite + Uploads)</div>
                  <div>AUTH: 2FA TOTP Protection Enabled</div>
                </div>

                <div>
                  <span className="text-emerald-400">developer@portafolio</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-cyan-400">~/stack</span>
                  <span className="text-white">$ echo $PHILOSOPHY</span>
                </div>
                <div className="text-slate-400 pl-2 border-l border-emerald-500/40 italic">
                  &quot;Arquitectura limpia, pipelines automatizados y código orientado a rendimiento real.&quot;
                </div>
              </div>

              {/* Avatar bar below */}
              {avatarUrl && (
                <div className="p-4 bg-[#090d16]/90 border-t border-white/10 flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt={name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
