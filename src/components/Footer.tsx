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

export interface FooterProps {
  email: string;
  location?: string | null;
  socialLinks: SocialLinkItem[];
  className?: string;
}

export function Footer({
  email = "",
  location,
  socialLinks = [],
  className = "",
}: FooterProps) {
  const [copied, setCopied] = useState(false);
  const year = new Date().getFullYear();

  const handleCopy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer
      id="contacto"
      className={`scroll-mt-24 border-t border-white/10 bg-[#090d16] pt-24 pb-12 text-slate-400 relative ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 12-column editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Main Editorial Contact Block (Left: 7 cols) */}
          <ScrollReveal delay={0.06} yOffset={20} className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                ¿Tienes un proyecto en mente?
              </h3>
            </div>

            {/* Direct Email Action Row */}
            <div className="pt-2 space-y-4">
              {email && (
                <div className="p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Mail size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-white text-sm sm:text-base font-medium truncate select-all">
                      {email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
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
                      aria-label="Enviar correo electrónico"
                    >
                      <Send size={13} />
                    </a>
                  </div>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                  <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src="/afb.webp"
                      alt="Alberto Fernández Bellido"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-slate-300">
                    Portafolio &copy; {year} Alberto Fernández Bellido
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Social Presence: Open Editorial List (Right: 5 cols) */}
          <ScrollReveal delay={0.12} yOffset={20} className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
                Canales oficiales
              </span>
            </div>

            {socialLinks && socialLinks.length > 0 ? (
              <StaggerContainer staggerDelay={0.06} className="divide-y divide-white/5">
                {socialLinks.map((social) => (
                  <StaggerItem key={social.id} yOffset={12}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center py-3.5 group text-slate-300 hover:text-white transition-colors"
                      aria-label={`Visitar canal oficial de ${social.platform}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <DynamicIcon name={social.icon_name} size={16} />
                        <span className="text-sm font-medium group-hover:text-emerald-300 transition-colors">
                          {social.platform}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        />
                      </div>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : null}
          </ScrollReveal>
        </div>
      </div>
    </footer>
  );
}