"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, GitBranch, Server, Cpu } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

interface HeroProps {
  name: string;
  title?: string;
  shortBio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
}

export function Hero({
  name,
  githubUrl,
  linkedinUrl,
}: HeroProps) {
  const targetName = name || "Alberto Fernández Bellido";
  const prefix = "Hola, soy ";
  const fullText = `${prefix}${targetName}`;

  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    // If user prefers reduced motion, show full text immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCharIndex(fullText.length);
      return;
    }

    if (charIndex >= fullText.length) return;

    // Natural random typing delay per character
    const currentChar = fullText[charIndex];
    let delay = Math.floor(Math.random() * 55) + 45; // 45ms - 100ms

    // Natural pause on punctuation or spaces
    if (currentChar === " " || currentChar === ",") {
      delay += 120;
    }

    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [charIndex, fullText]);

  // Split typed text between the prefix and the name
  const currentText = fullText.slice(0, charIndex);
  const prefixLength = prefix.length;

  const typedPrefix = currentText.slice(0, prefixLength);
  const typedName = charIndex > prefixLength ? currentText.slice(prefixLength) : "";

  return (
    <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[280px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-10 text-left">
          
          {/* Headline: Natural Single-Line Terminal Typing */}
          <div className="overflow-x-auto sm:overflow-visible py-1">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight min-h-[1.25em] whitespace-nowrap flex items-center">
              <span>{typedPrefix}</span>
              {typedName && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 ml-2 sm:ml-3">
                  {typedName}
                </span>
              )}
              {/* Terminal Blinking Cursor at typing position */}
              <span className="inline-block w-2 sm:w-3.5 h-6 sm:h-9 lg:h-12 bg-emerald-400 terminal-cursor ml-2 align-middle shrink-0" />
            </h1>
          </div>

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
          <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-400 max-w-2xl">
            <div className="space-y-1 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Despliegue</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Server size={14} className="text-emerald-400" /> Portainer :1886
              </span>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Arquitectura</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Cpu size={14} className="text-cyan-400" /> Next.js 15 & Docker
              </span>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Seguridad</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <GitBranch size={14} className="text-emerald-400" /> 2FA TOTP Active
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
