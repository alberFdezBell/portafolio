"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Share2,
  KeyRound,
  LogOut,
  Plus,
  Trash2,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { IconPickerModal } from "@/components/IconPickerModal";
import { DynamicIcon } from "@/components/DynamicIcon";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "profile" | "experience" | "education" | "projects" | "social" | "security"
  >("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Data states
  const [profile, setProfile] = useState<any>({});
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);

  // Icon modal state
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [currentSocialIndex, setCurrentSocialIndex] = useState<number | null>(null);

  // Notification helper
  const notify = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Initial Data Fetching
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resProf, resExp, resEdu, resProj, resSoc] = await Promise.all([
        fetch("/api/admin/profile"),
        fetch("/api/admin/experience"),
        fetch("/api/admin/education"),
        fetch("/api/admin/projects"),
        fetch("/api/admin/social"),
      ]);

      if (
        resProf.status === 401 ||
        resExp.status === 401 ||
        resEdu.status === 401 ||
        resProj.status === 401 ||
        resSoc.status === 401
      ) {
        router.push("/login");
        return;
      }

      setProfile(await resProf.json());
      setExperiences(await resExp.json());
      setEducation(await resEdu.json());
      setProjects(await resProj.json());
      setSocials(await resSoc.json());
    } catch {
      notify("Error cargando los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetch2FA = async () => {
    try {
      const res = await fetch("/api/admin/auth/setup-2fa");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        setTwoFactorData(await res.json());
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "security") {
      fetch2FA();
    }
  }, [activeTab]);

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Handle Photo Upload
  const handleFileUpload = async (file: File, callback: (url: string) => void) => {
    setSaving(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo en la subida");
      callback(data.url);
      notify("Imagen subida con éxito.");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error subiendo archivo", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Error al guardar perfil");
      notify("Perfil e Historia guardados correctamente.");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  // Experience Mutations
  const handleAddExperience = () => {
    setExperiences([
      {
        id: "temp-" + Date.now(),
        company: "Nueva Empresa",
        role: "Desarrollador Software",
        location: "Remoto",
        start_date: "2024",
        end_date: "Presente",
        is_current: 1,
        description: "",
        skills: "[]",
        order_num: experiences.length + 1,
        isNew: true,
      },
      ...experiences,
    ]);
  };

  const handleSaveExperience = async (item: any) => {
    setSaving(true);
    try {
      const method = item.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/experience", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Error guardando experiencia");
      notify("Experiencia guardada con éxito.");
      fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: number | string) => {
    if (typeof id === "string" && id.startsWith("temp-")) {
      setExperiences(experiences.filter((e) => e.id !== id));
      return;
    }
    if (!confirm("¿Eliminar esta experiencia laboral?")) return;
    try {
      await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
      notify("Experiencia eliminada.");
      fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  // Education Mutations
  const handleAddEducation = () => {
    setEducation([
      {
        id: "temp-" + Date.now(),
        institution: "Universidad o Academia",
        degree: "Título o Certificación",
        field_of_study: "Ingeniería de Software",
        start_year: "2022",
        end_year: "2024",
        description: "",
        order_num: education.length + 1,
        isNew: true,
      },
      ...education,
    ]);
  };

  const handleSaveEducation = async (item: any) => {
    setSaving(true);
    try {
      const method = item.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/education", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Error guardando educación");
      notify("Educación guardada con éxito.");
      fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (id: number | string) => {
    if (typeof id === "string" && id.startsWith("temp-")) {
      setEducation(education.filter((e) => e.id !== id));
      return;
    }
    if (!confirm("¿Eliminar este registro de educación?")) return;
    try {
      await fetch(`/api/admin/education?id=${id}`, { method: "DELETE" });
      notify("Registro educativo eliminado.");
      fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  // Projects Mutations
  const handleAddProject = () => {
    setProjects([
      {
        id: "temp-" + Date.now(),
        title: "Nuevo Proyecto",
        description: "Descripción de la arquitectura o app...",
        tech_stack: '["React", "Docker"]',
        image_url: "",
        demo_url: "#",
        repo_url: "",
        featured: 0,
        order_num: projects.length + 1,
        isNew: true,
      },
      ...projects,
    ]);
  };

  const handleSaveProject = async (item: any) => {
    setSaving(true);
    try {
      const method = item.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Error guardando proyecto");
      notify("Proyecto guardado con éxito.");
      fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: number | string) => {
    if (typeof id === "string" && id.startsWith("temp-")) {
      setProjects(projects.filter((p) => p.id !== id));
      return;
    }
    if (!confirm("¿Eliminar este proyecto?")) return;
    try {
      await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      notify("Proyecto eliminado.");
      fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  // Social Links Mutations
  const handleAddSocial = () => {
    setSocials([
      ...socials,
      {
        id: "temp-" + Date.now(),
        platform: "Nueva Red",
        url: "https://",
        icon_name: "globe",
        order_num: socials.length + 1,
        isNew: true,
      },
    ]);
  };

  const handleSaveSocial = async (item: any) => {
    setSaving(true);
    try {
      const method = item.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/social", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Error guardando enlace");
      notify("Enlace guardado.");
      fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSocial = async (id: number | string) => {
    if (typeof id === "string" && id.startsWith("temp-")) {
      setSocials(socials.filter((s) => s.id !== id));
      return;
    }
    if (!confirm("¿Eliminar este enlace?")) return;
    try {
      await fetch(`/api/admin/social?id=${id}`, { method: "DELETE" });
      notify("Enlace eliminado.");
      fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center font-mono text-emerald-400">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span>Cargando panel de administración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#0d1322]/90 border-b border-white/10 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              admin_console<span className="text-emerald-400">:~#</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Portainer Port 1886</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>Ver Web</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Floating Feedback Alert */}
      {feedback && (
        <div
          className={`fixed top-16 right-6 z-50 p-4 rounded-xl border shadow-2xl text-xs font-mono flex items-center gap-2 backdrop-blur-md transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/90 border-rose-500/40 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/10 text-xs font-mono">
          {[
            { id: "profile", label: "Perfil & Historia", icon: User },
            { id: "experience", label: "Experiencia Laboral", icon: Briefcase },
            { id: "projects", label: "Proyectos", icon: FolderGit2 },
            { id: "education", label: "Estudios & Certs", icon: GraduationCap },
            { id: "social", label: "Redes & CDN Iconos", icon: Share2 },
            { id: "security", label: "Seguridad & 2FA", icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shrink-0 ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold"
                    : "bg-[#0d1322] border-white/5 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PROFILE & STORY */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white">Datos Principales e Historia</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Controla el contenido de la cabecera y la sección narrativa
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Nombre Completo</label>
                  <input
                    type="text"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Título / Especialidad</label>
                  <input
                    type="text"
                    value={profile.title || ""}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    value={profile.email || ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Ubicación</label>
                  <input
                    type="text"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Badge de Estado (Navbar & Header)
                  </label>
                  <input
                    type="text"
                    value={profile.status_badge || ""}
                    onChange={(e) => setProfile({ ...profile, status_badge: e.target.value })}
                    placeholder="🟢 Disponible para nuevos proyectos"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Bio Breve (Hero)
                  </label>
                  <textarea
                    rows={2}
                    value={profile.short_bio || ""}
                    onChange={(e) => setProfile({ ...profile, short_bio: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Avatar and Upload */}
                <div className="space-y-2 md:col-span-2 p-4 rounded-xl border border-white/5 bg-slate-900/60">
                  <label className="block text-xs font-mono text-slate-300">
                    Foto de Perfil / Avatar (URL o Subir Archivo local)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {profile.avatar_url && (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-14 h-14 rounded-xl object-cover border border-emerald-500/40"
                      />
                    )}
                    <input
                      type="text"
                      value={profile.avatar_url || ""}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      placeholder="https://... o /uploads/..."
                      className="flex-1 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors">
                      <Upload size={14} />
                      <span>Subir Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (url) => setProfile({ ...profile, avatar_url: url }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Narrative Story */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Mi Historia Completa (Separa los párrafos con saltos de línea dobles)
                  </label>
                  <textarea
                    rows={6}
                    value={profile.about_story || ""}
                    onChange={(e) => setProfile({ ...profile, about_story: e.target.value })}
                    placeholder="Explica cómo empezaste en el desarrollo, tu evolución y tu enfoque actual..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Experiencia Laboral</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Añade empresas, periodos y tecnologías utilizadas
                </p>
              </div>
              <button
                onClick={handleAddExperience}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
              >
                <Plus size={15} />
                <span>Añadir Experiencia</span>
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 space-y-4 shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Empresa</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].company = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Rol / Puesto</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].role = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Ubicación</label>
                      <input
                        type="text"
                        value={exp.location || ""}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].location = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Fecha Inicio</label>
                      <input
                        type="text"
                        value={exp.start_date}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].start_date = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Fecha Fin</label>
                      <input
                        type="text"
                        value={exp.end_date || ""}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].end_date = e.target.value;
                          setExperiences(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                        <input
                          type="checkbox"
                          checked={exp.is_current === 1}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].is_current = e.target.checked ? 1 : 0;
                            setExperiences(updated);
                          }}
                          className="rounded border-white/10 bg-slate-900 text-emerald-500"
                        />
                        <span>Puesto Actual</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Descripción detallada (se despliega con el botón &quot;&gt;&quot; en la web)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Detalla las responsabilidades, proyectos clave, logros técnicos o funciones en esta experiencia..."
                      value={exp.description || ""}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].description = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Esta descripción se despliega interactivamente al pulsar el botón &quot;&gt;&quot; de cada trayectoria en el portafolio.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Tecnologías (JSON array o separadas por comas ej: [&quot;React&quot;, &quot;Docker&quot;])
                    </label>
                    <input
                      type="text"
                      value={exp.skills || ""}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].skills = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 text-xs font-mono hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                    <button
                      onClick={() => handleSaveExperience(exp)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
                    >
                      <Save size={13} />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === "projects" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Proyectos</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Muestra tus repositorios de GitHub, demos en vivo e imágenes
                </p>
              </div>
              <button
                onClick={handleAddProject}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
              >
                <Plus size={15} />
                <span>Añadir Proyecto</span>
              </button>
            </div>

            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 space-y-4 shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Título del Proyecto</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].title = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                        <input
                          type="checkbox"
                          checked={proj.featured === 1}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].featured = e.target.checked ? 1 : 0;
                            setProjects(updated);
                          }}
                          className="rounded border-white/10 bg-slate-900 text-emerald-500"
                        />
                        <Sparkles size={14} className="text-emerald-400" />
                        <span>Proyecto Destacado</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Descripción</label>
                      <textarea
                        rows={2}
                        value={proj.description || ""}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-xs text-white"
                      />
                    </div>

                    {/* Image URL & Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Imagen del Proyecto (URL o Subir Captura)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={proj.image_url || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].image_url = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="https://... o /uploads/..."
                          className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                        />
                        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300">
                          <Upload size={13} />
                          <span>Subir</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  const updated = [...projects];
                                  updated[idx].image_url = url;
                                  setProjects(updated);
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">URL Repositorio GitHub</label>
                      <input
                        type="text"
                        value={proj.repo_url || ""}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].repo_url = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="https://github.com/alberFdezBell/..."
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">URL Demo en Vivo</label>
                      <input
                        type="text"
                        value={proj.demo_url || ""}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].demo_url = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Stack Tecnológico (JSON array ej: [&quot;Next.js&quot;, &quot;Docker&quot;, &quot;SQLite&quot;])
                      </label>
                      <input
                        type="text"
                        value={proj.tech_stack || ""}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].tech_stack = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 text-xs font-mono hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                    <button
                      onClick={() => handleSaveProject(proj)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
                    >
                      <Save size={13} />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATION */}
        {activeTab === "education" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Estudios & Certificaciones</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Grados académicos, cursos y credenciales
                </p>
              </div>
              <button
                onClick={handleAddEducation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
              >
                <Plus size={15} />
                <span>Añadir Registro</span>
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 space-y-4 shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Institución</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].institution = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Título / Grado</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Campo de Estudio</label>
                      <input
                        type="text"
                        value={edu.field_of_study || ""}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].field_of_study = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Año Inicio</label>
                        <input
                          type="text"
                          value={edu.start_year || ""}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].start_year = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Año Fin</label>
                        <input
                          type="text"
                          value={edu.end_year || ""}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].end_year = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Descripción</label>
                      <textarea
                        rows={2}
                        value={edu.description || ""}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].description = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 text-xs font-mono hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                    <button
                      onClick={() => handleSaveEducation(edu)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
                    >
                      <Save size={13} />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SOCIAL LINKS & CDN ICON SEARCH */}
        {activeTab === "social" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Redes y Enlaces Digitales</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Enlaza tu GitHub, LinkedIn y redes con iconos CDN oficiales
                </p>
              </div>
              <button
                onClick={handleAddSocial}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
              >
                <Plus size={15} />
                <span>Añadir Enlace</span>
              </button>
            </div>

            <div className="space-y-4">
              {socials.map((soc, idx) => (
                <div
                  key={soc.id}
                  className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* CDN Icon Preview & Change Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSocialIndex(idx);
                        setIconModalOpen(true);
                      }}
                      className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-emerald-500/50 flex items-center justify-center group relative shrink-0 transition-colors"
                      title="Cambiar icono desde catálogo CDN"
                    >
                      <DynamicIcon name={soc.icon_name} size={24} />
                      <span className="absolute -bottom-2 text-[9px] font-mono text-emerald-400 bg-black/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Buscar
                      </span>
                    </button>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[280px]">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Plataforma</label>
                        <input
                          type="text"
                          value={soc.platform}
                          onChange={(e) => {
                            const updated = [...socials];
                            updated[idx].platform = e.target.value;
                            setSocials(updated);
                          }}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Icono CDN (Slug o Selector)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={soc.icon_name || ""}
                            onChange={(e) => {
                              const updated = [...socials];
                              updated[idx].icon_name = e.target.value;
                              setSocials(updated);
                            }}
                            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSocialIndex(idx);
                              setIconModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono hover:bg-emerald-500/20"
                          >
                            CDN
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">URL Enlace</label>
                    <input
                      type="text"
                      value={soc.url}
                      onChange={(e) => {
                        const updated = [...socials];
                        updated[idx].url = e.target.value;
                        setSocials(updated);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteSocial(soc.id)}
                      className="p-2 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => handleSaveSocial(soc)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all"
                    >
                      <Save size={13} />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & 2FA */}
        {activeTab === "security" && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound size={20} className="text-emerald-400" />
                  <span>Configuración de Seguridad & 2FA (Authenticator)</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Protección de acceso mediante código de un solo uso TOTP (Google Authenticator, Authy, etc.)
                </p>
              </div>

              {twoFactorData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono leading-relaxed">
                      Estado: <span className="font-bold">2FA ACTIVO</span>
                      <br />
                      Cada vez que inicies sesión en Portainer, tras introducir tu usuario y contraseña se solicitará el código de 6 dígitos de tu app Authenticator.
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-slate-300">
                        Clave Secreta TOTP (Base32):
                      </label>
                      <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-emerald-400 select-all break-all">
                        {twoFactorData.secret}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Puedes añadirla manualmente introduciendo esta clave o escaneando el código QR.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                        Variables de Entorno en Portainer:
                      </h4>
                      <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-xs text-slate-300 space-y-1">
                        <div><span className="text-emerald-400">ADMIN_USER</span>=admin</div>
                        <div><span className="text-emerald-400">ADMIN_PASSWORD</span>=tu_password_seguro</div>
                        <div><span className="text-emerald-400">AUTH_SECRET</span>=secreto_de_sesion_aleatorio</div>
                        <div><span className="text-emerald-400">TOTP_SECRET</span>={twoFactorData.secret}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Presentation */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-slate-900/60 text-center space-y-3">
                    <div className="p-3 rounded-2xl bg-white shadow-xl">
                      {twoFactorData.qrCode ? (
                        <img
                          src={twoFactorData.qrCode}
                          alt="2FA QR Code"
                          width={200}
                          height={200}
                          className="w-48 h-48"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                          Cargando QR...
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-300 font-semibold">
                      Escanea con Google Authenticator / Authy
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Abre tu aplicación Authenticator en el teléfono, añade una nueva cuenta y apunta con la cámara a este código.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-400">Cargando datos de 2FA...</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* CDN Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        selectedIcon={currentSocialIndex !== null ? socials[currentSocialIndex]?.icon_name : ""}
        onSelect={(iconId) => {
          if (currentSocialIndex !== null) {
            const updated = [...socials];
            updated[currentSocialIndex].icon_name = iconId;
            setSocials(updated);
          }
        }}
      />
    </div>
  );
}
