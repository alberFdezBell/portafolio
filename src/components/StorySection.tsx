"use client";

import React, { useState, useEffect } from "react";
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

  const fullText = paragraphs.join("\n\n");

  const [hasStarted, setHasStarted] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  // Synchronize start trigger: start when Hero has completed AND section is in view
  useEffect(() => {
    // If user prefers reduced motion, show full text immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasStarted(true);
      setCharIndex(fullText.length);
      return;
    }

    const sectionEl = document.getElementById("historia");

    const startTyping = () => {
      setHasStarted(true);
    };

    // Trigger when user scrolls / navigates to this section
    if ("IntersectionObserver" in window && sectionEl) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            if ((window as any).__heroTypingComplete) {
              startTyping();
            } else {
              window.addEventListener("hero-typing-complete", startTyping, { once: true });
            }
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(sectionEl);
      return () => observer.disconnect();
    }

    // Fallback for environments without IntersectionObserver
    if ((window as any).__heroTypingComplete) {
      startTyping();
      return;
    }

    window.addEventListener("hero-typing-complete", startTyping, { once: true });
    return () => {
      window.removeEventListener("hero-typing-complete", startTyping);
    };
  }, [fullText.length]);

  // Ultra-fast terminal typewriter typing effect
  useEffect(() => {
    if (!hasStarted) return;
    if (charIndex >= fullText.length) return;

    // Fast terminal stream chunking: advance 3 to 4 characters per step
    const charsRemaining = fullText.length - charIndex;
    const step = Math.min(charsRemaining, Math.floor(Math.random() * 2) + 3);

    const chunk = fullText.slice(charIndex, charIndex + step);
    let delay = Math.floor(Math.random() * 4) + 4; // 4ms - 8ms

    // Subtle micro-pauses at punctuation & paragraphs for organic terminal rhythm
    if (chunk.includes(".") || chunk.includes("\n")) {
      delay += 16;
    } else if (chunk.includes(",") || chunk.includes(" ")) {
      delay += 6;
    }

    const timer = setTimeout(() => {
      setCharIndex((prev) => Math.min(prev + step, fullText.length));
    }, delay);

    return () => clearTimeout(timer);
  }, [hasStarted, charIndex, fullText]);

  // Render sliced paragraphs according to current typed position
  const currentTypedText = fullText.slice(0, charIndex);
  const currentParagraphs = currentTypedText ? currentTypedText.split("\n\n") : [];
  const isTyping = hasStarted && charIndex < fullText.length;

  return (
    <section id="historia" className="py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-14">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>01 / Sobre mí & Historia</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Cómo empezó todo
            </h2>
          </div>
        </ScrollReveal>

        {/* Narrative Article with Floating Image Wrap & Live Typewriter */}
        <ScrollReveal delay={0.08} yOffset={24}>
          <article
            onClick={() => setCharIndex(fullText.length)}
            title="Haz clic para autocompletar la historia"
            className="border-l-2 border-emerald-500/20 pl-6 sm:pl-10 py-1 text-slate-300 cursor-pointer select-text"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500 pb-6 select-none">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span>log://narrativa-profesional</span>
              </div>
              {isTyping && (
                <span className="text-[11px] text-emerald-400/70 hover:text-emerald-300 transition-colors hidden sm:inline">
                  [clic para completar de inmediato]
                </span>
              )}
            </div>

            <div className="relative">
              {/* Profile Photo Floated Right on sm+ screens (compacta, sin borde, estática sin zoom) */}
              <div className="float-none sm:float-right sm:ml-8 sm:mb-4 mb-6 w-44 sm:w-48 md:w-52 max-w-full">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={avatarUrl || "/alberto01.webp"}
                    alt={`Foto de ${name}`}
                    className="w-full h-auto object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text Paragraphs wrapping around the image with Blinking Terminal Cursor */}
              <div className="space-y-5 text-slate-300 text-base sm:text-lg leading-relaxed font-normal min-h-[160px]">
                {currentParagraphs.length === 0 ? (
                  <p className="text-slate-300/90 flex items-center">
                    <span
                      className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 bg-emerald-400 terminal-cursor align-middle"
                      aria-hidden="true"
                    />
                  </p>
                ) : (
                  currentParagraphs.map((p, index) => {
                    const isLast = index === currentParagraphs.length - 1;
                    return (
                      <p key={index} className="text-slate-300/90">
                        {p}
                        {isLast && (
                          <span
                            className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 bg-emerald-400 terminal-cursor ml-1.5 align-middle shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </p>
                    );
                  })
                )}
              </div>

              {/* Bottom Metadata with Clearfix */}
              <div className="clear-both pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500 mt-8 select-none">
                <span className="flex items-center gap-2">
                  <span>EOF // bio documentada</span>
                  {isTyping && <span className="text-[10px] text-emerald-400/60 font-mono">(escribiendo...)</span>}
                </span>
                <span className="text-emerald-400/80">alberto@dev:~$ ready_for_scale</span>
              </div>
            </div>
          </article>
        </ScrollReveal>
      </div>
    </section>
  );
}
