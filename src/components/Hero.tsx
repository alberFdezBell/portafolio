"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";

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
  const isCompleted = charIndex >= fullText.length;

  return (
    <section className="relative min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Background glow effects centered in viewport */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[280px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Main Single-Line Headline (Centered Fullscreen) */}
      <div className="max-w-5xl mx-auto px-4 text-center z-10">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight flex flex-wrap items-center justify-center">
          <span>{typedPrefix}</span>
          {typedName && (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 ml-2 sm:ml-3">
              {typedName}
            </span>
          )}
          {/* Terminal Blinking Cursor at typing position */}
          <span className="inline-block w-2 sm:w-3.5 h-7 sm:h-11 lg:h-14 bg-emerald-400 terminal-cursor ml-2 sm:ml-3 align-middle shrink-0" />
        </h1>
      </div>

      {/* Bottom Interactive Arrow Button (Appears when typing completes) */}
      <a
        href="#historia"
        aria-label="Desplazarse a la primera sección (Historia)"
        className={`absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 group cursor-pointer transition-all duration-700 z-20 ${
          isCompleted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400 transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce">
          <ArrowDown size={20} className="stroke-[2.5]" />
        </div>
        <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 group-hover:text-emerald-400 transition-colors select-none">
          Continuar
        </span>
      </a>
    </section>
  );
}
