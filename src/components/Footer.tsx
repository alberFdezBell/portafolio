import React from "react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#090d16] py-12 text-slate-400 text-xs font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md overflow-hidden border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 shrink-0">
            <img
              src="/afb.webp"
              alt="Alberto Fernández Bellido"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-slate-300">
            Portafolio Autónomo &copy; {year} Alberto Fernández Bellido
          </span>
        </div>

        
      </div>
    </footer>
  );
}
