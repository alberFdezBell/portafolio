import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white px-4">
      <div className="text-center space-y-4 max-w-md">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
          Error 404
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Página no encontrada</h1>
        <p className="text-sm text-slate-400 font-mono">
          El recurso al que intentas acceder no existe o ha sido movido.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

