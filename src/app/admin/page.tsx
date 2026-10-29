"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ArrowUp,
  ArrowDown,
  Star,
  X,
  Video,
  Image as ImageIcon,
  Download,
  UploadCloud,
  Database,
} from "lucide-react";
import Link from "next/link";
import { IconPickerModal } from "@/components/IconPickerModal";
import { DynamicIcon } from "@/components/DynamicIcon";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

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
  const [projectLinkTarget, setProjectLinkTarget] = useState<{ projectIdx: number; linkIdx: number } | null>(null);
  const [newTechInputs, setNewTechInputs] = useState<Record<string | number, string>>({});
  const [markdownPreviews, setMarkdownPreviews] = useState<Record<string | number, boolean>>({});

  // Backup & Migration state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  // Export JSON (All portfolio data for migration)
  const handleExportJson = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al exportar los datos");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `portfolio-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify("Datos exportados en JSON con éxito.");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error exportando JSON", "error");
    } finally {
      setExporting(false);
    }
  };

  // Import JSON (Restore/migrate all portfolio data)
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      notify("Por favor selecciona un archivo .json válido", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas importar el archivo "${file.name}"?\n\n` +
      `¡ATENCIÓN! Esta acción reemplazará la información actual (perfil, proyectos, experiencias, formación y redes) con los datos del archivo JSON.\n\n` +
      `Haz clic en Aceptar para proceder con la migración.`
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("El archivo no contiene un formato JSON válido");
      }

      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Error al procesar la importación");
      }

      const counts = resData.counts;
      let summary = "Datos importados con éxito.";
      if (counts) {
        summary = `Migración completada: ${counts.projects || 0} proyectos, ${counts.experiences || 0} experiencias, ${counts.education || 0} formación.`;
      }
      notify(summary, "success");
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error al importar el archivo JSON", "error");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

  const handleMoveExperience = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= experiences.length) return;
    const updated = [...experiences];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    // Re-assign order_num sequentially (1, 2, 3...)
    const reordered = updated.map((item, i) => ({
      ...item,
      order_num: i + 1,
    }));
    setExperiences(reordered);

    // Persist new order for all already saved items
    try {
      await Promise.all(
        reordered
          .filter((item) => !item.isNew && typeof item.id === "number")
          .map((item) =>
            fetch("/api/admin/experience", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            })
          )
      );
      notify("Orden de trayectorias actualizado.");
    } catch {
      notify("Error al actualizar el orden", "error");
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

  const handleMoveEducation = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= education.length) return;
    const updated = [...education];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    // Re-assign order_num sequentially (1, 2, 3...)
    const reordered = updated.map((item, i) => ({
      ...item,
      order_num: i + 1,
    }));
    setEducation(reordered);

    // Persist new order for all already saved items
    try {
      await Promise.all(
        reordered
          .filter((item) => !item.isNew && typeof item.id === "number")
          .map((item) =>
            fetch("/api/admin/education", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            })
          )
      );
      notify("Orden de formación actualizado.");
    } catch {
      notify("Error al actualizar el orden", "error");
    }
  };

  // Projects Mutations
  const handleAddProject = () => {
    setProjects([
      {
        id: "temp-" + Date.now(),
        title: "Nuevo Proyecto",
        description: "Breve descripción técnica del proyecto",
        long_description: "",
        status: "Producción",
        tech_stack: '["Next.js", "Docker"]',
        image_url: "",
        media: "[]",
        links: JSON.stringify([
          { title: "Código fuente", url: "", icon: "github" },
          { title: "Ejecutar Demo", url: "", icon: "external-link" },
        ]),
        demo_url: "#",
        repo_url: "",
        featured: 0,
        order_num: projects.length + 1,
        isNew: true,
      },
      ...projects,
    ]);
  };

  const handleMoveProject = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((item, i) => ({
      ...item,
      order_num: i + 1,
    }));
    setProjects(updated);

    try {
      await Promise.all(
        updated
          .filter((item) => !item.isNew && typeof item.id === "number")
          .map((item) =>
            fetch("/api/admin/projects", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            })
          )
      );
      notify("Orden de proyectos actualizado.");
    } catch {
      notify("Error al actualizar el orden de proyectos", "error");
    }
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

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Input oculto para importación de JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Botón Exportar JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Descargar todos los datos en un archivo JSON"
          >
            <Download size={13} className={exporting ? "animate-bounce text-emerald-400" : "text-emerald-400"} />
            <span className="hidden sm:inline">{exporting ? "Exportando..." : "Exportar JSON"}</span>
            <span className="sm:hidden">Exportar</span>
          </button>

          {/* Botón Importar JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Cargar archivo JSON para restaurar o migrar todos los datos"
          >
            <UploadCloud size={13} className={importing ? "animate-pulse" : ""} />
            <span className="hidden sm:inline">{importing ? "Importando..." : "Importar JSON"}</span>
            <span className="sm:hidden">Importar</span>
          </button>

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
                  {/* Card Header: Position, Title & Reorder buttons */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {exp.role || "Nuevo Puesto"} — <span className="text-slate-400 font-normal">{exp.company || "Empresa"}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-500 mr-1 hidden sm:inline">Mover:</span>
                      <button
                        type="button"
                        onClick={() => handleMoveExperience(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Subir posición (aparecerá antes)"
                        aria-label="Subir posición"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveExperience(idx, idx + 1)}
                        disabled={idx === experiences.length - 1}
                        className="p-1.5 rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Bajar posición (aparecerá después)"
                        aria-label="Bajar posición"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Orden numérico
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={exp.order_num ?? idx + 1}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].order_num = parseInt(e.target.value) || 0;
                          setExperiences(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
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
                    <div className="flex items-center pt-5 sm:col-span-2">
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
                  Administra sistemas desplegados, carrusel multimedia, estado y enlaces
                </p>
              </div>
              <button
                onClick={handleAddProject}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md active:scale-95"
              >
                <Plus size={15} />
                <span>Añadir Proyecto</span>
              </button>
            </div>

            <div className="space-y-8">
              {projects.map((proj, idx) => {
                // Parse media list
                let mediaList: Array<{ id?: string; type: "image" | "video"; url: string; is_primary?: boolean; caption?: string }> = [];
                try {
                  mediaList = JSON.parse(proj.media || "[]");
                  if (!Array.isArray(mediaList)) mediaList = [];
                } catch {
                  mediaList = [];
                }
                if (mediaList.length === 0 && proj.image_url) {
                  mediaList = [{ type: "image", url: proj.image_url, is_primary: true }];
                }

                // Parse links list
                let linksList: Array<{ title: string; url: string; icon?: string }> = [];
                try {
                  linksList = JSON.parse(proj.links || "[]");
                  if (!Array.isArray(linksList)) linksList = [];
                } catch {
                  linksList = [];
                }
                if (linksList.length === 0 && (proj.repo_url || proj.demo_url)) {
                  if (proj.repo_url) linksList.push({ title: "Código fuente", url: proj.repo_url, icon: "github" });
                  if (proj.demo_url && proj.demo_url !== "#") linksList.push({ title: "Ejecutar Demo", url: proj.demo_url, icon: "external-link" });
                }

                // Parse tech stack
                let techList: string[] = [];
                try {
                  techList = JSON.parse(proj.tech_stack || "[]");
                  if (!Array.isArray(techList)) techList = [];
                } catch {
                  techList = proj.tech_stack ? proj.tech_stack.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
                }

                const techInputValue = newTechInputs[proj.id] || "";

                const handleAddTech = (techToAdd?: string) => {
                  const val = (techToAdd || techInputValue).trim();
                  if (!val || techList.includes(val)) return;
                  const updated = [...techList, val];
                  const updatedProjects = [...projects];
                  updatedProjects[idx].tech_stack = JSON.stringify(updated);
                  setProjects(updatedProjects);
                  setNewTechInputs((prev) => ({ ...prev, [proj.id]: "" }));
                };

                const handleRemoveTech = (tIdx: number) => {
                  const updated = techList.filter((_, i) => i !== tIdx);
                  const updatedProjects = [...projects];
                  updatedProjects[idx].tech_stack = JSON.stringify(updated);
                  setProjects(updatedProjects);
                };

                const handleAddMedia = (type: "image" | "video" = "image") => {
                  const newMedia = [
                    ...mediaList,
                    {
                      id: String(Date.now()),
                      type,
                      url: "",
                      is_primary: mediaList.length === 0,
                    },
                  ];
                  const updatedProjects = [...projects];
                  updatedProjects[idx].media = JSON.stringify(newMedia);
                  setProjects(updatedProjects);
                };

                const handleUpdateMedia = (mIdx: number, field: string, value: any) => {
                  const updatedMedia = [...mediaList];
                  updatedMedia[mIdx] = { ...updatedMedia[mIdx], [field]: value };
                  if (field === "is_primary" && value === true) {
                    updatedMedia.forEach((m, i) => {
                      m.is_primary = i === mIdx;
                    });
                    if (updatedMedia[mIdx].url) {
                      projects[idx].image_url = updatedMedia[mIdx].url;
                    }
                  }
                  const updatedProjects = [...projects];
                  updatedProjects[idx].media = JSON.stringify(updatedMedia);
                  setProjects(updatedProjects);
                };

                const handleRemoveMedia = (mIdx: number) => {
                  const updatedMedia = mediaList.filter((_, i) => i !== mIdx);
                  if (updatedMedia.length > 0 && !updatedMedia.some((m) => m.is_primary)) {
                    updatedMedia[0].is_primary = true;
                  }
                  const updatedProjects = [...projects];
                  updatedProjects[idx].media = JSON.stringify(updatedMedia);
                  const primary = updatedMedia.find((m) => m.is_primary);
                  updatedProjects[idx].image_url = primary?.url || updatedMedia[0]?.url || "";
                  setProjects(updatedProjects);
                };

                const handleAddLink = () => {
                  const newLinks = [
                    ...linksList,
                    { title: "Enlace", url: "https://", icon: "external-link" },
                  ];
                  const updatedProjects = [...projects];
                  updatedProjects[idx].links = JSON.stringify(newLinks);
                  setProjects(updatedProjects);
                };

                const handleUpdateLink = (lIdx: number, field: string, value: string) => {
                  const updatedLinks = [...linksList];
                  updatedLinks[lIdx] = { ...updatedLinks[lIdx], [field]: value };
                  const updatedProjects = [...projects];
                  updatedProjects[idx].links = JSON.stringify(updatedLinks);
                  // Sync repo_url & demo_url if applicable
                  if (field === "url") {
                    if (updatedLinks[lIdx].icon === "github" || updatedLinks[lIdx].title.toLowerCase().includes("código") || updatedLinks[lIdx].title.toLowerCase().includes("repo")) {
                      updatedProjects[idx].repo_url = value;
                    }
                    if (updatedLinks[lIdx].title.toLowerCase().includes("demo") || updatedLinks[lIdx].icon === "external-link") {
                      updatedProjects[idx].demo_url = value;
                    }
                  }
                  setProjects(updatedProjects);
                };

                const handleRemoveLink = (lIdx: number) => {
                  const updatedLinks = linksList.filter((_, i) => i !== lIdx);
                  const updatedProjects = [...projects];
                  updatedProjects[idx].links = JSON.stringify(updatedLinks);
                  setProjects(updatedProjects);
                };

                return (
                  <div
                    key={proj.id}
                    className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 space-y-6 shadow-xl relative"
                  >
                    {/* Header Row: Title, Ordering, Status, Featured */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-slate-300 disabled:cursor-not-allowed transition-all"
                            title="Subir de posición"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, "down")}
                            disabled={idx === projects.length - 1}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 text-slate-300 disabled:cursor-not-allowed transition-all"
                            title="Bajar de posición"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <div className="flex-1">
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            Título del Proyecto
                          </label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[idx].title = e.target.value;
                              setProjects(updated);
                            }}
                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      {/* Status & Featured Controls */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            Estado del Proyecto
                          </label>
                          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-white/10 bg-slate-900">
                            {(["En desarrollo", "Producción", "Finalizado"] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  const updated = [...projects];
                                  updated[idx].status = st;
                                  setProjects(updated);
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                                  (proj.status || "Producción") === st
                                    ? st === "En desarrollo"
                                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                                      : st === "Producción"
                                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold"
                                      : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    st === "En desarrollo"
                                      ? "bg-amber-400"
                                      : st === "Producción"
                                      ? "bg-emerald-400"
                                      : "bg-cyan-400"
                                  }`}
                                />
                                <span>{st}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all">
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
                            <span>Destacado</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Descriptions Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Descripción Corta (Aparece en la tarjeta inicial)
                        </label>
                        <textarea
                          rows={3}
                          value={proj.description || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].description = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="Resumen conciso del proyecto..."
                          className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-mono text-slate-400">
                            Descripción Detallada (Aparece al abrir el proyecto)
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-emerald-400/80 hidden sm:inline">
                              Soporta Markdown
                            </span>
                            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-white/10 text-[10px] font-mono">
                              <button
                                type="button"
                                onClick={() =>
                                  setMarkdownPreviews((prev) => ({
                                    ...prev,
                                    [proj.id || idx]: false,
                                  }))
                                }
                                className={`px-2.5 py-1 rounded transition-colors ${
                                  !markdownPreviews[proj.id || idx]
                                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setMarkdownPreviews((prev) => ({
                                    ...prev,
                                    [proj.id || idx]: true,
                                  }))
                                }
                                className={`px-2.5 py-1 rounded transition-colors ${
                                  markdownPreviews[proj.id || idx]
                                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                Vista Previa
                              </button>
                            </div>
                          </div>
                        </div>

                        {!markdownPreviews[proj.id || idx] ? (
                          <>
                            {/* Toolbar de Markdown con atajos */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5 p-1.5 rounded-lg bg-slate-950/70 border border-white/5 text-[11px] font-mono text-slate-400">
                              <span className="text-[10px] text-slate-500 px-1">Atajos:</span>
                              <button
                                type="button"
                                title="Título H2"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur}\n\n## Nuevo Encabezado\n` : `## Nuevo Encabezado\n`;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
                              >
                                ## H2
                              </button>
                              <button
                                type="button"
                                title="Negrita"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur} **texto en negrita** ` : `**texto en negrita** `;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors font-bold"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                title="Cursiva"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur} *texto en cursiva* ` : `*texto en cursiva* `;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors italic"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                title="Lista"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur}\n- Elemento 1\n- Elemento 2\n` : `- Elemento 1\n- Elemento 2\n`;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
                              >
                                • Lista
                              </button>
                              <button
                                type="button"
                                title="Código en línea"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur} \`código\` ` : `\`código\` `;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
                              >
                                `código`
                              </button>
                              <button
                                type="button"
                                title="Bloque de código"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur}\n\`\`\`typescript\n// Tu código aquí\n\`\`\`\n` : `\`\`\`typescript\n// Tu código aquí\n\`\`\`\n`;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
                              >
                                ```bloque```
                              </button>
                              <button
                                type="button"
                                title="Enlace"
                                onClick={() => {
                                  const updated = [...projects];
                                  const cur = updated[idx].long_description || "";
                                  updated[idx].long_description = cur ? `${cur} [Texto del enlace](https://...) ` : `[Texto del enlace](https://...) `;
                                  setProjects(updated);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
                              >
                                Enlace
                              </button>
                            </div>

                            <textarea
                              rows={6}
                              value={proj.long_description || ""}
                              onChange={(e) => {
                                const updated = [...projects];
                                updated[idx].long_description = e.target.value;
                                setProjects(updated);
                              }}
                              placeholder="Escribe la descripción en Markdown:
## Arquitectura & Retos
Explicación detallada del proyecto, decisiones técnicas y soluciones implementadas.

### Características Principales
- **Rendimiento**: Cargas subsegundo con SSR.
- **Seguridad**: Autenticación 2FA TOTP."
                              className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-500/50 font-mono"
                            />
                          </>
                        ) : (
                          <div className="w-full min-h-[160px] max-h-[350px] overflow-y-auto rounded-lg border border-white/10 bg-slate-950 p-4 text-xs text-white">
                            {proj.long_description ? (
                              <MarkdownRenderer content={proj.long_description} />
                            ) : (
                              <p className="text-slate-500 italic font-mono text-xs">
                                No hay contenido aún. Cambia a &quot;Editar&quot; para redactar en Markdown.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* INTUITIVE TECH STACK MANAGER */}
                    <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono font-semibold text-emerald-400">
                          Stack & Tecnologías
                        </label>
                        <span className="text-[11px] font-mono text-slate-500">
                          {techList.length} tecnologías configuradas
                        </span>
                      </div>

                      {/* Current Tech Chips */}
                      <div className="flex flex-wrap gap-2 min-h-8 p-2 rounded-lg border border-white/5 bg-slate-950/60">
                        {techList.length === 0 ? (
                          <span className="text-xs font-mono text-slate-500 italic py-0.5">
                            Sin tecnologías añadidas aún. Usa el buscador o las sugerencias inferiores.
                          </span>
                        ) : (
                          techList.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-xs font-mono text-slate-200 shadow-sm"
                            >
                              <span className="text-emerald-400 font-bold">#</span>
                              <span>{tech}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTech(tIdx)}
                                className="text-slate-400 hover:text-rose-400 ml-0.5 transition-colors"
                                title="Eliminar tecnología"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add Tech Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={techInputValue}
                          onChange={(e) =>
                            setNewTechInputs((prev) => ({ ...prev, [proj.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTech();
                            }
                          }}
                          placeholder="Escribe una tecnología (ej: Docker, Tailwind CSS, PostgreSQL) y pulsa Enter..."
                          className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTech()}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all active:scale-95"
                        >
                          <Plus size={13} />
                          <span>Añadir</span>
                        </button>
                      </div>

                      {/* Quick Suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-mono text-slate-500 mr-1">Sugerencias rápidas:</span>
                        {[
                          "Next.js",
                          "TypeScript",
                          "React",
                          "Docker",
                          "Node.js",
                          "Tailwind CSS",
                          "PostgreSQL",
                          "SQLite",
                          "Python",
                          "Go",
                          "Redis",
                          "Portainer",
                          "GraphQL",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddTech(sug)}
                            disabled={techList.includes(sug)}
                            className="px-2 py-0.5 rounded text-[11px] font-mono border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                          >
                            +{sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* MULTIMEDIA / CAROUSEL MANAGER */}
                    <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-mono font-semibold text-emerald-400">
                            Galería Multimedia & Carrusel
                          </label>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Añade imágenes o videos para el carrusel y define cuál será la imagen principal de la tarjeta
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddMedia("image")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 transition-all active:scale-95"
                          >
                            <ImageIcon size={13} className="text-emerald-400" />
                            <span>+ Añadir Foto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddMedia("video")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 transition-all active:scale-95"
                          >
                            <Video size={13} className="text-cyan-400" />
                            <span>+ Añadir Video</span>
                          </button>
                        </div>
                      </div>

                      {mediaList.length === 0 ? (
                        <div className="p-6 rounded-lg border border-dashed border-white/10 bg-slate-950/40 text-center">
                          <p className="text-xs font-mono text-slate-400">
                            No hay elementos multimedia. Pulsa en &quot;+ Añadir Foto&quot; o &quot;+ Añadir Video&quot;.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {mediaList.map((mItem, mIdx) => (
                            <div
                              key={mIdx}
                              className={`p-3 rounded-lg border transition-all flex flex-col md:flex-row md:items-center gap-3 ${
                                mItem.is_primary
                                  ? "border-emerald-500/40 bg-emerald-950/20"
                                  : "border-white/10 bg-slate-950/60"
                              }`}
                            >
                              {/* Preview thumbnail */}
                              <div className="w-24 aspect-[16/9] rounded-md overflow-hidden bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center">
                                {mItem.url ? (
                                  mItem.type === "video" ? (
                                    <video src={mItem.url} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={mItem.url} alt="Vista previa" className="w-full h-full object-cover" />
                                  )
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-500">Sin URL</span>
                                )}
                              </div>

                              {/* Type toggle */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMedia(mIdx, "type", "image")}
                                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 ${
                                    mItem.type === "image"
                                      ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                                      : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  <ImageIcon size={11} />
                                  <span>Foto</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMedia(mIdx, "type", "video")}
                                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 ${
                                    mItem.type === "video"
                                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                                      : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  <Video size={11} />
                                  <span>Video</span>
                                </button>
                              </div>

                              {/* URL & Upload */}
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={mItem.url || ""}
                                  onChange={(e) => handleUpdateMedia(mIdx, "url", e.target.value)}
                                  placeholder="URL (https://... o /uploads/...)"
                                  className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                />

                                <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-all shrink-0">
                                  <Upload size={12} />
                                  <span>Subir</span>
                                  <input
                                    type="file"
                                    accept={mItem.type === "video" ? "video/*" : "image/*"}
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(file, (url) => {
                                          handleUpdateMedia(mIdx, "url", url);
                                        });
                                      }
                                    }}
                                  />
                                </label>
                              </div>

                              {/* Primary Toggle & Delete */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMedia(mIdx, "is_primary", true)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                                    mItem.is_primary
                                      ? "bg-emerald-500 text-black font-semibold shadow-sm"
                                      : "border border-white/10 bg-white/5 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30"
                                  }`}
                                  title="Marcar como imagen principal para la tarjeta inicial"
                                >
                                  <Star size={12} fill={mItem.is_primary ? "currentColor" : "none"} />
                                  <span>{mItem.is_primary ? "Principal" : "Hacer Principal"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedia(mIdx)}
                                  className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Eliminar elemento"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* LINKS MANAGER */}
                    <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-mono font-semibold text-emerald-400">
                            Enlaces del Proyecto (con icono y nombre)
                          </label>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Repositorio GitHub, demo en vivo, documentación, etc.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 transition-all active:scale-95"
                        >
                          <Plus size={13} />
                          <span>+ Añadir Enlace</span>
                        </button>
                      </div>

                      {linksList.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-white/10 bg-slate-950/40 text-center">
                          <p className="text-xs font-mono text-slate-400">
                            No hay enlaces configurados. Pulsa en &quot;+ Añadir Enlace&quot;.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {linksList.map((link, lIdx) => (
                            <div
                              key={lIdx}
                              className="p-3 rounded-lg border border-white/10 bg-slate-950/60 flex flex-col md:flex-row md:items-center gap-3"
                            >
                              {/* Icon Selector Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentSocialIndex(null);
                                  setProjectLinkTarget({ projectIdx: idx, linkIdx: lIdx });
                                  setIconModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-white/10 text-xs font-mono text-white shrink-0 transition-all"
                                title="Cambiar icono del enlace"
                              >
                                <DynamicIcon name={link.icon || "external-link"} size={16} />
                                <span className="text-slate-400 text-[11px]">{link.icon || "icono"}</span>
                              </button>

                              {/* Link Title */}
                              <div className="w-full md:w-48">
                                <input
                                  type="text"
                                  value={link.title}
                                  onChange={(e) => handleUpdateLink(lIdx, "title", e.target.value)}
                                  placeholder="Ej: Código fuente, Demo..."
                                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>

                              {/* Link URL */}
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => handleUpdateLink(lIdx, "url", e.target.value)}
                                  placeholder="https://..."
                                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(lIdx)}
                                className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                                title="Eliminar enlace"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs font-mono text-slate-500">
                        Orden #{proj.order_num || idx + 1}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 text-xs font-mono hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={13} />
                          <span>Eliminar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveProject(proj)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md active:scale-95"
                        >
                          <Save size={13} />
                          <span>Guardar Proyecto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  {/* Card Header: Position, Title & Reorder buttons */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {edu.degree || "Nuevo Título"} — <span className="text-slate-400 font-normal">{edu.institution || "Institución"}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-500 mr-1 hidden sm:inline">Mover:</span>
                      <button
                        type="button"
                        onClick={() => handleMoveEducation(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Subir posición (aparecerá antes)"
                        aria-label="Subir posición"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveEducation(idx, idx + 1)}
                        disabled={idx === education.length - 1}
                        className="p-1.5 rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Bajar posición (aparecerá después)"
                        aria-label="Bajar posición"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Orden numérico</label>
                      <input
                        type="number"
                        min={1}
                        value={edu.order_num ?? idx + 1}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].order_num = parseInt(e.target.value) || 0;
                          setEducation(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
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
                    <div className="sm:col-span-2 md:col-span-4">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Descripción detallada (se despliega con el botón &quot;&gt;&quot; en la web)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detalla lo aprendido, proyectos realizados, competencias adquiridas o especialidad..."
                        value={edu.description || ""}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].description = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 leading-relaxed"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        Esta descripción se despliega interactivamente al pulsar el botón &quot;&gt;&quot; de cada estudio en el portafolio.
                      </p>
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

            {/* SECCIÓN MIGRACIÓN Y COPIA DE SEGURIDAD */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database size={20} className="text-emerald-400" />
                    <span>Migración & Copias de Seguridad (JSON)</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Exporta o importa el estado completo del portafolio para migrar entre servidores, Docker, Portainer o realizar backups.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-300">
                    {projects.length} proyectos
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-300">
                    {experiences.length} exp.
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-slate-300">
                    {education.length} form.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opción Exportar */}
                <div className="p-5 rounded-xl border border-white/10 bg-slate-900/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <Download size={16} className="text-emerald-400" />
                      <span>Exportar Portafolio Completo</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Genera un archivo JSON con tu perfil, historia personal, experiencias, proyectos (con multimedia, enlaces y Markdown), formación e iconos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Download size={14} className={exporting ? "animate-bounce" : ""} />
                    <span>{exporting ? "Generando JSON..." : "Descargar Backup JSON"}</span>
                  </button>
                </div>

                {/* Opción Importar */}
                <div className="p-5 rounded-xl border border-white/10 bg-slate-900/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <UploadCloud size={16} className="text-emerald-400" />
                      <span>Importar / Restaurar Portafolio</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Carga un archivo JSON previamente exportado. La base de datos SQLite se actualizará atómicamente con los nuevos datos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold transition-all shadow-sm shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <UploadCloud size={14} className={importing ? "animate-pulse" : ""} />
                    <span>{importing ? "Importando y migrando..." : "Seleccionar Archivo JSON"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CDN Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconModalOpen}
        onClose={() => {
          setIconModalOpen(false);
          setCurrentSocialIndex(null);
          setProjectLinkTarget(null);
        }}
        selectedIcon={
          currentSocialIndex !== null
            ? socials[currentSocialIndex]?.icon_name
            : projectLinkTarget !== null
            ? (() => {
                try {
                  const links = JSON.parse(projects[projectLinkTarget.projectIdx]?.links || "[]");
                  return links[projectLinkTarget.linkIdx]?.icon || "";
                } catch {
                  return "";
                }
              })()
            : ""
        }
        onSelect={(iconId) => {
          if (currentSocialIndex !== null) {
            const updated = [...socials];
            updated[currentSocialIndex].icon_name = iconId;
            setSocials(updated);
          } else if (projectLinkTarget !== null) {
            const { projectIdx, linkIdx } = projectLinkTarget;
            const updatedProjects = [...projects];
            let linksList: any[] = [];
            try {
              linksList = JSON.parse(updatedProjects[projectIdx]?.links || "[]");
            } catch {
              linksList = [];
            }
            if (linksList[linkIdx]) {
              linksList[linkIdx].icon = iconId;
              updatedProjects[projectIdx].links = JSON.stringify(linksList);
              setProjects(updatedProjects);
            }
          }
          setIconModalOpen(false);
          setCurrentSocialIndex(null);
          setProjectLinkTarget(null);
        }}
      />
    </div>
  );
}
