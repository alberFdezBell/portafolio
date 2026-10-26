"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Shield, Menu, X } from "lucide-react";

interface NavbarProps {
  statusBadge?: string;
  className?: string;
}

export function Navbar({ statusBadge, className = "" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Historia", href: "#historia" },
    { name: "Experiencia", href: "#experiencia" },
    { name: "Proyectos", href: "#proyectos" },
    { name: "Estudios", href: "#estudios" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-[background-color,border-color,padding,box-shadow] duration-300 ${
        scrolled
          ? "bg-[#090d16]/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20 py-3"
          : "bg-transparent py-5"
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Terminal */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white font-mono text-sm tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal size={18} />
          </div>
          <span className="font-semibold text-slate-200">
            alberto<span className="text-emerald-400">@</span>dev<span className="text-slate-500">:~$</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-wider"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Actions & Status */}
        <div className="hidden sm:flex items-center gap-4">
          {statusBadge && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] truncate max-w-[200px]">{statusBadge}</span>
            </div>
          )}

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm"
            title="Panel de Administración (2FA)"
          >
            <Shield size={14} className="text-emerald-400" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090d16]/95 border-b border-white/10 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 font-mono text-sm">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-300 hover:text-emerald-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono text-slate-300"
            >
              <Shield size={14} className="text-emerald-400" />
              <span>Panel Admin (2FA)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
