"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
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
    { name: "Historia", targetId: "historia" },
    { name: "Experiencia", targetId: "experiencia" },
    { name: "Proyectos", targetId: "proyectos" },
    { name: "Estudios", targetId: "estudios" },
    { name: "Conocimientos", targetId: "conocimientos" },
    { name: "Contacto", targetId: "contacto" },
  ];

  const handleNavClick = (targetId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-[background-color,border-color,padding,box-shadow] duration-300 ${
        scrolled
          ? "bg-[#090d16]/85 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20 py-3"
          : "bg-transparent py-5"
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 text-white font-mono text-sm tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/afb.webp"
              alt="Alberto Fernández Bellido"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-slate-200">
            alberto<span className="text-emerald-400">@</span>dev<span className="text-slate-500">:~$</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => handleNavClick(link.targetId)}
              className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-pointer focus:outline-none focus-visible:text-emerald-400"
            >
              {link.name}
            </button>
          ))}
        </nav>

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
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavClick(link.targetId)}
                className="text-left text-slate-300 hover:text-emerald-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer focus:outline-none focus-visible:text-emerald-400"
              >
                {link.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
