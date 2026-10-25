"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
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
      if (typeof window !== "undefined") {
        (window as any).__heroTypingComplete = true;
        window.dispatchEvent(new CustomEvent("hero-typing-complete"));
      }
      return;
    }

    if (charIndex >= fullText.length) {
      if (typeof window !== "undefined") {
        (window as any).__heroTypingComplete = true;
        window.dispatchEvent(new CustomEvent("hero-typing-complete"));
      }
      return;
    }

    // Ultra-fast & snappy typing delay per character
    const currentChar = fullText[charIndex];
    let delay = Math.floor(Math.random() * 12) + 12; // 12ms - 24ms

    // Subtle micro-pause on punctuation or spaces
    if (currentChar === " " || currentChar === ",") {
      delay += 25;
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
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#proyectos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-500/15 active:scale-95"
            >
              <span>Explorar Proyectos</span>
              <ArrowDown size={15} />
            </a>

            <a
              href="#contacto"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all duration-200 active:scale-95 font-mono"
            >
              <span>Contacto</span>
              <ArrowDown size={15} />
            </a>

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-200"
                aria-label="GitHub de Alberto"
              >
                <DynamicIcon name="github" size={18} />
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-200"
                aria-label="LinkedIn de Alberto"
              >
                <DynamicIcon name="linkedin" size={18} />
              </a>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
