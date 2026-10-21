import React from "react";
import Link from "next/link";
import { Terminal, Shield } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#090d16] py-12 text-slate-400 text-xs font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal size={14} />
          </div>
          <span className="text-slate-300">
            Portafolio Autónomo &copy; {year} Alberto Fernández Bellido
          </span>
        </div>

        {/* Portainer & Stack indicators */}
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Portainer Stack :1886
          </span>
          <span className="text-slate-600">/</span>
          <span className="hidden md:inline text-slate-500">SQLite WAL Mode</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Shield size={13} />
            <span>Acceso Administración (2FA)</span>
          </Link>
        </div>

      </div>
    </footer>
  );
}
