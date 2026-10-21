"use client";

import React, { useState } from "react";
import { Mail, Check, Copy, Send, MapPin, Globe } from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

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
    <section id="contacto" className="py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-start gap-2 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <Mail size={14} />
            <span>05 // CANALES DE CONTACTO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Iniciemos una conversación
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono">
            Disponible para nuevas oportunidades técnicas, colaboraciones y retos en ingeniería de software.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Email & Copy Card */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0d1322]/90 p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                Contacto Directo
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¿Tienes un proyecto o desafío en mente?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Escríbeme directamente por correo electrónico o a través de mis redes. Suelo responder en menos de 24 horas.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Mail size={18} />
                </div>
                <span className="text-white font-medium truncate">{email}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  <Send size={14} />
                  <span>Enviar</span>
                </a>
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-2">
                <MapPin size={14} className="text-emerald-400" />
                <span>Ubicación: {location}</span>
              </div>
            )}
          </div>

          {/* Social Links & CDN Icons Grid */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0d1322]/90 p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Presencia Digital
              </span>
              <h3 className="text-xl font-bold text-white">
                Redes & Repositorios
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Iconos cargados dinámicamente vía CDN oficial
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-800/90 hover:border-emerald-500/30 text-slate-300 hover:text-white transition-all group shadow-sm"
                >
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                    <DynamicIcon name={social.icon_name} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {social.platform}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {social.url.replace(/^https?:\/\//, "")}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center pt-2">
              <span className="text-[11px] font-mono text-slate-500">
                Conectividad y APIs abiertas
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
