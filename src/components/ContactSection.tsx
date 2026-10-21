"use client";

import React, { useState } from "react";
import { Mail, Check, Copy, Send, ArrowUpRight, MapPin } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";

export interface SocialLinkItem {
  id: number;
  platform: string;
  url: string;
  icon_name: string;
}

interface ContactSectionProps {
  email: string;
  location: string;
  socialLinks: SocialLinkItem[];
}

export function ContactSection({ email, location, socialLinks }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contacto" className="py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Section Header */}
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-start mb-16">
            <div className="text-xs font-mono tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-emerald-400/60" aria-hidden="true" />
              <span>05 / Contacto & Redes</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Iniciemos una conversación
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono mt-3">
              Disponible para nuevos retos en ingeniería de software, arquitectura cloud y colaboraciones técnicas.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Main Editorial Contact Block (Left) */}
          <ScrollReveal delay={0.06} yOffset={20} className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ¿Tienes un proyecto en mente?
              </h3>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                Escríbeme directamente por correo electrónico o a través de mis redes. Suelo responder en menos de 24 horas.
              </p>
            </div>

            {/* Direct Email Action Row (No nested boxes) */}
            <div className="pt-2 space-y-4">
              <div className="p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Mail size={18} className="text-emerald-400 shrink-0" />
                  <span className="text-white text-sm sm:text-base font-medium truncate select-all">
                    {email}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all active:scale-95"
                    aria-label="Copiar correo electrónico al portapapeles"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-emerald-500/20"
                  >
                    <Send size={13} />
                    <span>Escribir</span>
                  </a>
                </div>
              </div>

              {location && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                  <MapPin size={13} className="text-emerald-400" />
                  <span>Ubicación base: {location}</span>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Social Presence: Open Editorial List (Right) */}
          <ScrollReveal delay={0.12} yOffset={20} className="lg:col-span-5 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
                Canales oficiales
              </span>
              <h4 className="text-lg font-bold text-white tracking-tight mt-1">
                Redes & Repositorios
              </h4>
            </div>

            <StaggerContainer staggerDelay={0.06} className="divide-y divide-white/5">
              {socialLinks.map((social) => (
                <StaggerItem key={social.id} yOffset={12}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between py-3.5 group text-slate-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon name={social.icon_name} size={16} />
                      <span className="text-sm font-medium group-hover:text-emerald-300 transition-colors">
                        {social.platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
                      <span className="hidden sm:inline">
                        {social.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
