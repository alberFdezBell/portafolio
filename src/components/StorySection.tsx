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

        {/* Narrative Article with Floating Image Wrap */}
        <ScrollReveal delay={0.08} yOffset={24}>
          <article className="border-l-2 border-emerald-500/20 pl-6 sm:pl-10 py-1 text-slate-300">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pb-6">
              <Terminal size={14} className="text-emerald-400" />
              <span>log://narrativa-profesional</span>
            </div>

            <div className="relative">
              {/* Profile Photo Floated Right on sm+ screens */}
              <div className="float-none sm:float-right sm:ml-8 sm:mb-6 mb-6 w-full sm:w-72 md:w-80 max-w-full">
                <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/3] sm:aspect-[4/5] shadow-2xl">
                  <img
                    src={avatarUrl || "https://images.unsplash.com/photo-1534972195531-a756b1129f63?auto=format&fit=crop&w=800&q=80"}
                    alt={`Foto de ${name}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between font-mono">
                    <span className="text-sm font-semibold text-white">{name}</span>
                    <span className="text-xs text-emerald-400">Software & Cloud</span>
                  </div>
                </div>
              </div>

              {/* Text Paragraphs wrapping around the image */}
              <div className="space-y-5 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, index) => (
                    <p key={index} className="text-slate-300/90">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500 italic font-mono text-sm">
                    Historia pendiente de configurar desde el panel de administración.
                  </p>
                )}
              </div>

              {/* Bottom Metadata with Clearfix */}
              <div className="clear-both pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500 mt-8">
                <span>EOF // bio documentada</span>
                <span className="text-emerald-400/80">alberto@dev:~$ ready_for_scale</span>
              </div>
            </div>
          </article>
        </ScrollReveal>
      </div>
    </section>
  );
}
