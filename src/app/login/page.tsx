"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, KeyRound, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      setStep("totp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 2FA TOTP Code
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, token: totpToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Código 2FA incorrecto");
      }

      setSuccess("Autenticación completada. Redirigiendo al panel...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al verificar 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Terminal Header Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1322] shadow-2xl overflow-hidden">
          {/* Top terminal bar */}
          <div className="px-5 py-3.5 bg-[#070a10] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">auth_gateway::2fa_guard</span>
            </div>
            <Link
              href="/"
              className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ← Volver
            </Link>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
                <Shield size={28} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-xs font-mono text-slate-400">
                {step === "credentials"
                  ? "Paso 1/2: Credenciales de entorno Portainer"
                  : "Paso 2/2: Código de verificación Authenticator (TOTP)"}
              </p>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Step 1: Credentials Form */}
            {step === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">
                    Usuario (ADMIN_USER)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">
                    Contraseña (ADMIN_PASSWORD)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <span className="font-mono text-xs">Verificando...</span>
                  ) : (
                    <>
                      <span>Continuar a 2FA</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: TOTP Code Form */}
            {step === "totp" && (
              <form onSubmit={handleTotpSubmit} className="space-y-4">
                <div className="space-y-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 leading-relaxed">
                    Abre tu aplicación <span className="text-white font-semibold">Google Authenticator</span>, <span className="text-white font-semibold">Authy</span> o <span className="text-white font-semibold">Microsoft Authenticator</span> e introduce el código de 6 dígitos.
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Código TOTP (6 dígitos)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl border border-emerald-500/40 bg-slate-900 text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || totpToken.length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <span className="font-mono text-xs">Validando código...</span>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Acceder al Panel</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setTotpToken("");
                    setError(null);
                  }}
                  className="w-full text-center text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  ← Volver a introducir usuario y contraseña
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-white/5 text-center text-[11px] font-mono text-slate-500">
              Puerto seguro de escucha 1886 | Portainer Containerized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
