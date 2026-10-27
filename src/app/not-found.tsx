import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white flex flex-col items-center justify-center px-4 font-mono">
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 mb-6">
        <img
          src="/afb.webp"
          alt="Alberto Fernández Bellido"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-4xl sm:text-6xl font-bold text-emerald-400 mb-2">404</h1>
      <p className="text-slate-400 text-sm sm:text-base mb-6 text-center">
        Página no encontrada en este servidor.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-300 text-xs sm:text-sm transition-all"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}

