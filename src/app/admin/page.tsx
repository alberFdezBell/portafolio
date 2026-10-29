"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ArrowUp,
  ArrowDown,
  X,
  Video,
  BookOpen,
  Download,
  UploadCloud,
  Database,
  Pencil,
  Eye,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { IconPickerModal } from "@/components/IconPickerModal";
import { DynamicIcon } from "@/components/DynamicIcon";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

// --- TYPES ---
interface ProfileData {
  name?: string;
  title?: string;
  email?: string;
  location?: string;
  status_badge?: string;
  short_bio?: string;
  avatar_url?: string;
  about_story?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface ExperienceData {
  id: number | string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date: string;
  is_current: number;
  description: string;
  skills: string; // JSON array of string
  order_num?: number;
  isNew?: boolean;
}

interface EducationData {
  id: number | string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year: string;
  end_year: string;
  description?: string;
  order_num?: number;
  isNew?: boolean;
}

interface MediaItem {
  id?: string;
  type: "image" | "video";
  url: string;
  is_primary?: boolean;
  caption?: string;
}

interface LinkItem {
  title: string;
  url: string;
  icon?: string;
}

interface ProjectData {
  id: number | string;
  title: string;
  description: string;
  long_description?: string;
  tech_stack: string; // JSON array
  image_url: string;
  demo_url: string;
  repo_url: string;
  status?: string;
  media?: string; // JSON array
  links?: string; // JSON array
  featured: number;
  order_num?: number;
  isNew?: boolean;
}

interface KnowledgeCategoryData {
  id: number | string;
  name: string;
  slug?: string;
  content: string;
  order_num?: number;
  featured?: number;
  isNew?: boolean;
}

interface SocialData {
  id: number | string;
  platform: string;
  url: string;
  icon_name: string;
  order_num?: number;
  isNew?: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "projects" | "experience" | "education" | "knowledge" | "social" | "security"
  >("profile");

  // Global states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data
  const [profile, setProfile] = useState<ProfileData>({});
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [education, setEducation] = useState<EducationData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategoryData[]>([]);
  const [socials, setSocials] = useState<SocialData[]>([]);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);

  // --- MODAL STATES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceData | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationData | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeCategoryData | null>(null);
  const [editingSocial, setEditingSocial] = useState<SocialData | null>(null);

  // Initial snapshots to detect modifications (Dirty Checking)
  const [profileSnapshot, setProfileSnapshot] = useState("");
  const [experienceSnapshot, setExperienceSnapshot] = useState("");
  const [educationSnapshot, setEducationSnapshot] = useState("");
  const [projectSnapshot, setProjectSnapshot] = useState("");
  const [knowledgeSnapshot, setKnowledgeSnapshot] = useState("");
  const [socialSnapshot, setSocialSnapshot] = useState("");

  // Sub-modal for icon selection
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [iconTarget, setIconTarget] = useState<"social" | { linkIdx: number } | null>(null);

  // Markdown previews toggles for modals
  const [previewStory, setPreviewStory] = useState(false);
  const [previewProjectDesc, setPreviewProjectDesc] = useState(false);
  const [previewKnowledgeDesc, setPreviewKnowledgeDesc] = useState(false);

  // Tag inputs
  const [newProjectTech, setNewProjectTech] = useState("");
  const [newExpSkill, setNewExpSkill] = useState("");

  // Backup files
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
      const [resProf, resExp, resEdu, resProj, resSoc, resKnow] = await Promise.all([
        fetch("/api/admin/profile"),
        fetch("/api/admin/experience"),
        fetch("/api/admin/education"),
        fetch("/api/admin/projects"),
        fetch("/api/admin/social"),
        fetch("/api/admin/knowledge"),
      ]);

      if (
        resProf.status === 401 ||
        resExp.status === 401 ||
        resEdu.status === 401 ||
        resProj.status === 401 ||
        resSoc.status === 401 ||
        resKnow.status === 401
      ) {
        router.push("/login");
        return;
      }

      setProfile(await resProf.json());
      setExperiences(await resExp.json());
      setEducation(await resEdu.json());
      setProjects(await resProj.json());
      setSocials(await resSoc.json());
      setKnowledgeCategories(await resKnow.json());
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

  // Export JSON
  const handleExportJson = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("Error al exportar");
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

  // Import JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      notify("Por favor selecciona un archivo .json válido", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas importar "${file.name}"?\nEsta acción reemplazará la información actual.`
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Error al procesar la importación");

      notify("Datos importados con éxito.");
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error al importar el archivo JSON", "error");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // File Upload
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
      notify("Archivo subido con éxito.");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error subiendo archivo", "error");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PROFILE MODAL HANDLERS
  // ==========================================
  const [profileForm, setProfileForm] = useState<ProfileData>({});
  const isProfileDirty = useMemo(() => {
    return isProfileModalOpen && JSON.stringify(profileForm) !== profileSnapshot;
  }, [isProfileModalOpen, profileForm, profileSnapshot]);

  const handleOpenProfileModal = () => {
    const clone = JSON.parse(JSON.stringify(profile));
    setProfileForm(clone);
    setProfileSnapshot(JSON.stringify(clone));
    setPreviewStory(false);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Error al guardar perfil");
      setProfile(profileForm);
      notify("Perfil e Historia guardados correctamente.");
      setIsProfileModalOpen(false);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EXPERIENCE MODAL HANDLERS
  // ==========================================
  const isExperienceDirty = useMemo(() => {
    return editingExperience !== null && JSON.stringify(editingExperience) !== experienceSnapshot;
  }, [editingExperience, experienceSnapshot]);

  const handleOpenNewExperience = () => {
    const newExp: ExperienceData = {
      id: "temp-" + Date.now(),
      company: "Nueva Empresa",
      role: "Desarrollador Software",
      location: "Remoto",
      start_date: new Date().getFullYear().toString(),
      end_date: "Presente",
      is_current: 1,
      description: "",
      skills: "[]",
      order_num: experiences.length + 1,
      isNew: true,
    };
    setEditingExperience(newExp);
    setExperienceSnapshot(JSON.stringify(newExp));
    setNewExpSkill("");
  };

  const handleOpenEditExperience = (item: ExperienceData) => {
    const clone = JSON.parse(JSON.stringify(item));
    setEditingExperience(clone);
    setExperienceSnapshot(JSON.stringify(clone));
    setNewExpSkill("");
  };

  const handleSaveExperienceModal = async () => {
    if (!editingExperience) return;
    setSaving(true);
    try {
      const method = editingExperience.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/experience", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingExperience),
      });
      if (!res.ok) throw new Error("Error guardando experiencia");
      notify("Experiencia guardada con éxito.");
      setEditingExperience(null);
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: number | string) => {
    if (!confirm("¿Eliminar esta experiencia laboral?")) return;
    try {
      await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
      notify("Experiencia eliminada.");
      await fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  const handleMoveExperience = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= experiences.length) return;
    const updated = [...experiences];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    const reordered = updated.map((item, i) => ({ ...item, order_num: i + 1 }));
    setExperiences(reordered);

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

  // ==========================================
  // EDUCATION MODAL HANDLERS
  // ==========================================
  const isEducationDirty = useMemo(() => {
    return editingEducation !== null && JSON.stringify(editingEducation) !== educationSnapshot;
  }, [editingEducation, educationSnapshot]);

  const handleOpenNewEducation = () => {
    const newEdu: EducationData = {
      id: "temp-" + Date.now(),
      institution: "Universidad o Academia",
      degree: "Título o Certificación",
      field_of_study: "Ingeniería de Software",
      start_year: (new Date().getFullYear() - 2).toString(),
      end_year: new Date().getFullYear().toString(),
      description: "",
      order_num: education.length + 1,
      isNew: true,
    };
    setEditingEducation(newEdu);
    setEducationSnapshot(JSON.stringify(newEdu));
  };

  const handleOpenEditEducation = (item: EducationData) => {
    const clone = JSON.parse(JSON.stringify(item));
    setEditingEducation(clone);
    setEducationSnapshot(JSON.stringify(clone));
  };

  const handleSaveEducationModal = async () => {
    if (!editingEducation) return;
    setSaving(true);
    try {
      const method = editingEducation.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/education", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEducation),
      });
      if (!res.ok) throw new Error("Error guardando formación");
      notify("Formación guardada con éxito.");
      setEditingEducation(null);
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (id: number | string) => {
    if (!confirm("¿Eliminar este registro de educación?")) return;
    try {
      await fetch(`/api/admin/education?id=${id}`, { method: "DELETE" });
      notify("Registro educativo eliminado.");
      await fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  const handleMoveEducation = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= education.length) return;
    const updated = [...education];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    const reordered = updated.map((item, i) => ({ ...item, order_num: i + 1 }));
    setEducation(reordered);

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

  // ==========================================
  // PROJECT MODAL HANDLERS
  // ==========================================
  const isProjectDirty = useMemo(() => {
    return editingProject !== null && JSON.stringify(editingProject) !== projectSnapshot;
  }, [editingProject, projectSnapshot]);

  const handleOpenNewProject = () => {
    const newProj: ProjectData = {
      id: "temp-" + Date.now(),
      title: "Nuevo Proyecto",
      description: "Breve descripción técnica del proyecto",
      long_description: "",
      status: "Producción",
      tech_stack: JSON.stringify(["Next.js", "TypeScript"]),
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
    };
    setEditingProject(newProj);
    setProjectSnapshot(JSON.stringify(newProj));
    setPreviewProjectDesc(false);
    setNewProjectTech("");
  };

  const handleOpenEditProject = (item: ProjectData) => {
    const clone = JSON.parse(JSON.stringify(item));
    setEditingProject(clone);
    setProjectSnapshot(JSON.stringify(clone));
    setPreviewProjectDesc(false);
    setNewProjectTech("");
  };

  const handleSaveProjectModal = async () => {
    if (!editingProject) return;
    setSaving(true);
    try {
      const method = editingProject.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      if (!res.ok) throw new Error("Error guardando proyecto");
      notify("Proyecto guardado con éxito.");
      setEditingProject(null);
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: number | string) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    try {
      await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      notify("Proyecto eliminado.");
      await fetchAllData();
    } catch {
      notify("Error al eliminar", "error");
    }
  };

  const handleMoveProject = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((item, i) => ({ ...item, order_num: i + 1 }));
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

  // ==========================================
  // KNOWLEDGE CATEGORY MODAL HANDLERS
  // ==========================================
  const isKnowledgeDirty = useMemo(() => {
    return editingKnowledge !== null && JSON.stringify(editingKnowledge) !== knowledgeSnapshot;
  }, [editingKnowledge, knowledgeSnapshot]);

  const handleOpenNewKnowledge = () => {
    const newCat: KnowledgeCategoryData = {
      id: "temp-" + Date.now(),
      name: "Nueva Categoría",
      slug: "nueva-categoria-" + Date.now(),
      content: "# Nueva Categoría\n\nEscribe aquí tus notas técnicas en formato Markdown...\n",
      order_num: knowledgeCategories.length + 1,
      featured: 0,
      isNew: true,
    };
    setEditingKnowledge(newCat);
    setKnowledgeSnapshot(JSON.stringify(newCat));
    setPreviewKnowledgeDesc(false);
  };

  const handleOpenEditKnowledge = (item: KnowledgeCategoryData) => {
    const clone = JSON.parse(JSON.stringify(item));
    setEditingKnowledge(clone);
    setKnowledgeSnapshot(JSON.stringify(clone));
    setPreviewKnowledgeDesc(false);
  };

  const handleSaveKnowledgeModal = async () => {
    if (!editingKnowledge) return;
    setSaving(true);
    try {
      const method = editingKnowledge.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/knowledge", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingKnowledge),
      });
      if (!res.ok) throw new Error("Error guardando categoría");
      notify("Categoría de conocimiento guardada con éxito.");
      setEditingKnowledge(null);
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKnowledge = async (id: number | string) => {
    if (!confirm("¿Eliminar esta categoría de conocimientos?")) return;
    try {
      await fetch(`/api/admin/knowledge?id=${id}`, { method: "DELETE" });
      notify("Categoría eliminada.");
      await fetchAllData();
    } catch {
      notify("Error al eliminar categoría", "error");
    }
  };

  const handleMoveKnowledge = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= knowledgeCategories.length) return;

    const reordered = [...knowledgeCategories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((item, i) => ({ ...item, order_num: i + 1 }));
    setKnowledgeCategories(updated);

    try {
      await fetch("/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.filter((item) => !item.isNew && typeof item.id === "number")),
      });
      notify("Orden de categorías actualizado.");
    } catch {
      notify("Error al actualizar el orden de categorías", "error");
    }
  };

  // ==========================================
  // SOCIAL MODAL HANDLERS
  // ==========================================
  const isSocialDirty = useMemo(() => {
    return editingSocial !== null && JSON.stringify(editingSocial) !== socialSnapshot;
  }, [editingSocial, socialSnapshot]);

  const handleOpenNewSocial = () => {
    const newSoc: SocialData = {
      id: "temp-" + Date.now(),
      platform: "Nueva Red",
      url: "https://",
      icon_name: "globe",
      order_num: socials.length + 1,
      isNew: true,
    };
    setEditingSocial(newSoc);
    setSocialSnapshot(JSON.stringify(newSoc));
  };

  const handleOpenEditSocial = (item: SocialData) => {
    const clone = JSON.parse(JSON.stringify(item));
    setEditingSocial(clone);
    setSocialSnapshot(JSON.stringify(clone));
  };

  const handleSaveSocialModal = async () => {
    if (!editingSocial) return;
    setSaving(true);
    try {
      const method = editingSocial.isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/social", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSocial),
      });
      if (!res.ok) throw new Error("Error guardando enlace");
      notify("Enlace guardado.");
      setEditingSocial(null);
      await fetchAllData();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSocial = async (id: number | string) => {
    if (!confirm("¿Eliminar este enlace?")) return;
    try {
      await fetch(`/api/admin/social?id=${id}`, { method: "DELETE" });
      notify("Enlace eliminado.");
      await fetchAllData();
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
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
            { id: "projects", label: "Proyectos", icon: FolderGit2, count: projects.length },
            { id: "experience", label: "Experiencia", icon: Briefcase, count: experiences.length },
            { id: "education", label: "Formación", icon: GraduationCap, count: education.length },
            { id: "knowledge", label: "Conocimientos", icon: BookOpen, count: knowledgeCategories.length },
            { id: "social", label: "Redes", icon: Share2, count: socials.length },
            { id: "security", label: "Seguridad & 2FA", icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold"
                    : "bg-[#0d1322] border-white/5 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive ? "bg-emerald-500/25 text-emerald-300" : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: PROFILE & STORY DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "profile" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Perfil & Historia</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Datos principales del portafolio, foto de perfil e historia narrativa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenProfileModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Pencil size={15} />
                <span>Editar Perfil & Historia</span>
              </button>
            </div>

            {/* Visual Overview Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-white/5">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || "Avatar"}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                    <User size={32} />
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <h3 className="text-2xl font-bold text-white tracking-tight truncate">
                    {profile.name || "Sin nombre configurado"}
                  </h3>
                  <p className="text-sm font-mono text-emerald-400">
                    {profile.title || "Sin título definido"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-400">
                    {profile.email && <span>✉ {profile.email}</span>}
                    {profile.location && <span>📍 {profile.location}</span>}
                  </div>
                </div>
              </div>

              {profile.status_badge && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Badge de Estado
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 font-mono text-xs text-emerald-300">
                    {profile.status_badge}
                  </div>
                </div>
              )}

              {profile.short_bio && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Biografía Corta (Hero)
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5">
                    {profile.short_bio}
                  </p>
                </div>
              )}

              {profile.about_story && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Historia Narrativa (01 / Sobre mí)
                  </span>
                  <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5 text-sm text-slate-300 max-h-56 overflow-y-auto leading-relaxed">
                    <MarkdownRenderer content={profile.about_story} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROJECTS DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "projects" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Proyectos</span>
                  <span className="text-xs font-mono text-slate-500 font-normal">
                    [{projects.length} registrados]
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Administra las tarjetas de proyectos, estados, multimedia y tecnologías.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewProject}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Nuevo Proyecto</span>
              </button>
            </div>

            {/* Projects Grid / List */}
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj, idx) => {
                  let parsedTech: string[] = [];
                  try {
                    parsedTech = JSON.parse(proj.tech_stack || "[]");
                  } catch {
                    parsedTech = [];
                  }

                  return (
                    <div
                      key={proj.id}
                      className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all shadow-md group"
                    >
                      {/* Top Row: Index, Status & Reorder */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                              proj.status === "En desarrollo"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : proj.status === "Finalizado"
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            }`}
                          >
                            {proj.status || "Producción"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                            title="Subir posición"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, "down")}
                            disabled={idx === projects.length - 1}
                            className="p-1 rounded border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                            title="Bajar posición"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Title & Description */}
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 font-normal">
                          {proj.description || "Sin descripción breve"}
                        </p>
                      </div>

                      {/* Tech stack pills */}
                      {parsedTech.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400 line-clamp-1">
                          {parsedTech.slice(0, 4).map((t, ti) => (
                            <span key={ti} className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bottom Actions: Edit in Modal & Delete */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProject(proj)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar proyecto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center text-slate-400 font-mono text-xs">
                No hay proyectos registrados. Pulsa &quot;Nuevo Proyecto&quot; para crear uno.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WORK EXPERIENCE DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "experience" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Experiencia Laboral</span>
                  <span className="text-xs font-mono text-slate-500 font-normal">
                    [{experiences.length} registradas]
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Trayectorias profesionales, roles, periodos y habilidades demostradas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewExperience}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Nueva Experiencia</span>
              </button>
            </div>

            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((exp, idx) => {
                  let parsedSkills: string[] = [];
                  try {
                    parsedSkills = JSON.parse(exp.skills || "[]");
                  } catch {
                    parsedSkills = [];
                  }

                  return (
                    <div
                      key={exp.id}
                      className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all shadow-md group"
                    >
                      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-base font-bold text-white truncate">
                            {exp.role} —{" "}
                            <span className="text-emerald-300 font-medium">{exp.company}</span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                            <span>
                              🗓 {exp.start_date} – {exp.is_current ? "Presente" : exp.end_date}
                            </span>
                            {exp.location && <span>📍 {exp.location}</span>}
                          </div>
                          {parsedSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
                              {parsedSkills.slice(0, 5).map((s, si) => (
                                <span
                                  key={si}
                                  className="px-2 py-0.5 rounded bg-slate-900 border border-white/5"
                                >
                                  #{s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <div className="flex items-center gap-1 mr-2">
                          <button
                            type="button"
                            onClick={() => handleMoveExperience(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                            title="Subir"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExperience(idx, idx + 1)}
                            disabled={idx === experiences.length - 1}
                            className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                            title="Bajar"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditExperience(exp)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center text-slate-400 font-mono text-xs">
                No hay experiencias registradas. Pulsa &quot;Nueva Experiencia&quot; para crear una.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: EDUCATION DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "education" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Estudios & Certificaciones</span>
                  <span className="text-xs font-mono text-slate-500 font-normal">
                    [{education.length} registradas]
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Títulos académicos, certificaciones técnicas e instituciones.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewEducation}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Nueva Formación</span>
              </button>
            </div>

            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all shadow-md group"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-base font-bold text-white truncate">
                          {edu.degree} —{" "}
                          <span className="text-emerald-300 font-medium">{edu.institution}</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                          <span>
                            🗓 {edu.start_year} – {edu.end_year}
                          </span>
                          {edu.field_of_study && <span>🎓 {edu.field_of_study}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          type="button"
                          onClick={() => handleMoveEducation(idx, idx - 1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                          title="Subir"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEducation(idx, idx + 1)}
                          disabled={idx === education.length - 1}
                          className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                          title="Bajar"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditEducation(edu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center text-slate-400 font-mono text-xs">
                No hay registros de formación. Pulsa &quot;Nueva Formación&quot; para crear uno.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: KNOWLEDGE CATEGORIES DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "knowledge" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Conocimientos</span>
                  <span className="text-xs font-mono text-slate-500 font-normal">
                    [{knowledgeCategories.length} artículos]
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Categorías y artículos con editor Markdown para la sección 05 / Conocimientos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewKnowledge}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Nueva Categoría</span>
              </button>
            </div>

            {knowledgeCategories.length > 0 ? (
              <div className="space-y-4">
                {knowledgeCategories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all shadow-md group"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white truncate">{cat.name}</h4>
                        </div>
                        <p className="text-xs font-mono text-slate-400 truncate">
                          slug: {cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          type="button"
                          onClick={() => handleMoveKnowledge(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                          title="Subir"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveKnowledge(idx, "down")}
                          disabled={idx === knowledgeCategories.length - 1}
                          className="p-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-20 text-slate-400 hover:text-white cursor-pointer"
                          title="Bajar"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditKnowledge(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKnowledge(cat.id)}
                        className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center text-slate-400 font-mono text-xs">
                No hay categorías de conocimientos. Pulsa &quot;Nueva Categoría&quot; para crear una.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SOCIAL LINKS DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "social" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Redes Sociales & Enlaces</span>
                  <span className="text-xs font-mono text-slate-500 font-normal">
                    [{socials.length} enlaces]
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Enlaces del pie de página con selector de iconos SVG oficiales.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewSocial}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Nuevo Enlace</span>
              </button>
            </div>

            {socials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socials.map((soc) => (
                  <div
                    key={soc.id}
                    className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <DynamicIcon name={soc.icon_name || "globe"} size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{soc.platform}</h4>
                        <p className="text-[11px] font-mono text-slate-400 truncate">{soc.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSocial(soc)}
                        className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors cursor-pointer"
                        title="Editar enlace"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSocial(soc.id)}
                        className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center text-slate-400 font-mono text-xs">
                No hay redes configuradas. Pulsa &quot;Nuevo Enlace&quot; para añadir una.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SECURITY & 2FA */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound size={20} className="text-emerald-400" />
                  <span>Seguridad & Autenticación de Dos Factores (2FA)</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Protección de acceso mediante código TOTP (Google Authenticator, Authy, 1Password).
                </p>
              </div>

              {twoFactorData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono leading-relaxed">
                      Estado: <span className="font-bold">2FA ACTIVO</span>
                      <br />
                      Cada inicio de sesión solicita el código temporal de 6 dígitos de tu app Authenticator.
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-slate-300">
                        Clave Secreta TOTP (Base32):
                      </label>
                      <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-emerald-400 select-all break-all">
                        {twoFactorData.secret}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                        Variables de Entorno en Docker / Portainer:
                      </h4>
                      <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-xs text-slate-300 space-y-1">
                        <div>
                          <span className="text-emerald-400">ADMIN_USER</span>=admin
                        </div>
                        <div>
                          <span className="text-emerald-400">ADMIN_PASSWORD</span>=tu_password
                        </div>
                        <div>
                          <span className="text-emerald-400">AUTH_SECRET</span>=secreto_aleatorio
                        </div>
                        <div>
                          <span className="text-emerald-400">TOTP_SECRET</span>={twoFactorData.secret}
                        </div>
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
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-400">Cargando datos de 2FA...</div>
              )}
            </div>

            {/* Quick Backup Section */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                <span>Copias de Seguridad Rápidas</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Puedes exportar un archivo JSON con todos los datos o importar una copia para restaurar el contenido.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-mono text-white transition-all cursor-pointer"
                >
                  <Download size={14} className="text-emerald-400" />
                  <span>Descargar Backup JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-all cursor-pointer"
                >
                  <UploadCloud size={14} />
                  <span>Restaurar Backup JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OVERLAID MODAL 1: PERFIL & HISTORIA */}
      {/* ========================================================================= */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c1220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0c1220] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">Editar Perfil & Historia</h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    Modifica tus datos y biografía narrativa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
                {isProfileDirty && (
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                  >
                    <Save size={14} />
                    <span>{saving ? "Guardando..." : "Guardar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Nombre Completo</label>
                  <input
                    type="text"
                    value={profileForm.name || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Título Profesional</label>
                  <input
                    type="text"
                    value={profileForm.title || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    value={profileForm.email || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Ubicación</label>
                  <input
                    type="text"
                    value={profileForm.location || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">Badge de Estado</label>
                  <input
                    type="text"
                    value={profileForm.status_badge || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, status_badge: e.target.value })}
                    placeholder="🟢 Disponible para nuevos proyectos"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">Bio Breve (Hero)</label>
                  <textarea
                    rows={2}
                    value={profileForm.short_bio || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, short_bio: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Avatar */}
                <div className="space-y-2 md:col-span-2 p-4 rounded-xl border border-white/5 bg-slate-900/60">
                  <label className="block text-xs font-mono text-slate-300">
                    Foto de Perfil / Avatar (URL o Subir Archivo local)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {profileForm.avatar_url && (
                      <img
                        src={profileForm.avatar_url}
                        alt="Avatar"
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={profileForm.avatar_url || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                      placeholder="https://... o /uploads/..."
                      className="flex-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors shrink-0">
                      <Upload size={13} />
                      <span>Subir Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) =>
                              setProfileForm((prev) => ({ ...prev, avatar_url: url }))
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Story */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-300">
                      Mi Historia Completa (Markdown soportado)
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreviewStory(!previewStory)}
                      className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>{previewStory ? "Editar texto" : "Vista previa"}</span>
                    </button>
                  </div>

                  {previewStory ? (
                    <div className="w-full min-h-[160px] max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200">
                      <MarkdownRenderer content={profileForm.about_story || ""} />
                    </div>
                  ) : (
                    <textarea
                      rows={7}
                      value={profileForm.about_story || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, about_story: e.target.value })}
                      placeholder="Escribe tu historia profesional..."
                      className="w-full rounded-xl border border-white/10 bg-slate-900 p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 bg-[#090d16] border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {isProfileDirty ? "Descartar Cambios" : "Cerrar"}
              </button>

              {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
              {isProfileDirty ? (
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Sin cambios pendientes
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OVERLAID MODAL 2: PROYECTO */}
      {/* ========================================================================= */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProject(null);
          }}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c1220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0c1220] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FolderGit2 size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {editingProject.isNew ? "Nuevo Proyecto" : `Editar: ${editingProject.title}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    Información técnica, galería y enlaces
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
                {isProjectDirty && (
                  <button
                    type="button"
                    onClick={handleSaveProjectModal}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                  >
                    <Save size={14} />
                    <span>{saving ? "Guardando..." : "Guardar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">Título del Proyecto</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">Estado del Proyecto</label>
                  <select
                    value={editingProject.status || "Producción"}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="Producción">Producción</option>
                    <option value="En desarrollo">En desarrollo</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Descripción Breve (Resumen para la tarjeta)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Tech Stack Tags Manager */}
                <div className="space-y-2 md:col-span-2 p-4 rounded-xl border border-white/5 bg-slate-900/60">
                  <label className="block text-xs font-mono text-slate-300">
                    Tecnologías & Arquitectura (Etiquetas)
                  </label>
                  {(() => {
                    let tags: string[] = [];
                    try {
                      tags = JSON.parse(editingProject.tech_stack || "[]");
                    } catch {
                      tags = [];
                    }

                    return (
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, ti) => (
                            <span
                              key={ti}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-xs"
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = tags.filter((_, idx) => idx !== ti);
                                  setEditingProject({
                                    ...editingProject,
                                    tech_stack: JSON.stringify(filtered),
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-300 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nueva tecnología (ej. Docker, Redis)..."
                            value={newProjectTech}
                            onChange={(e) => setNewProjectTech(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newProjectTech.trim()) {
                                e.preventDefault();
                                const updatedTags = [...tags, newProjectTech.trim()];
                                setEditingProject({
                                  ...editingProject,
                                  tech_stack: JSON.stringify(updatedTags),
                                });
                                setNewProjectTech("");
                              }
                            }}
                            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newProjectTech.trim()) return;
                              const updatedTags = [...tags, newProjectTech.trim()];
                              setEditingProject({
                                ...editingProject,
                                tech_stack: JSON.stringify(updatedTags),
                              });
                              setNewProjectTech("");
                            }}
                            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                          >
                            + Añadir
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Media Manager (Photos / Videos) */}
                <div className="space-y-3 md:col-span-2 p-4 rounded-xl border border-white/5 bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-300">
                      Galería Multimedia (Imágenes y Videos)
                    </label>
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors">
                      <Upload size={12} />
                      <span>Subir archivo</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              let currentMedia: MediaItem[] = [];
                              try {
                                currentMedia = JSON.parse(editingProject.media || "[]");
                              } catch {
                                currentMedia = [];
                              }
                              const isVideo = file.type.startsWith("video/");
                              const newItem: MediaItem = {
                                type: isVideo ? "video" : "image",
                                url,
                                is_primary: currentMedia.length === 0,
                              };
                              setEditingProject({
                                ...editingProject,
                                media: JSON.stringify([...currentMedia, newItem]),
                              });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>

                  {(() => {
                    let mediaList: MediaItem[] = [];
                    try {
                      mediaList = JSON.parse(editingProject.media || "[]");
                    } catch {
                      mediaList = [];
                    }

                    if (mediaList.length === 0) {
                      return (
                        <p className="text-xs font-mono text-slate-500 py-2">
                          No hay elementos multimedia adjuntos.
                        </p>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        {mediaList.map((m, mi) => (
                          <div
                            key={mi}
                            className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center"
                          >
                            {m.type === "video" ? (
                              <div className="flex flex-col items-center justify-center text-cyan-400 gap-1">
                                <Video size={20} />
                                <span className="text-[10px] font-mono">Video</span>
                              </div>
                            ) : (
                              <img
                                src={m.url}
                                alt="Media"
                                className="w-full h-full object-cover"
                              />
                            )}

                            {m.is_primary && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-mono font-bold">
                                Principal
                              </span>
                            )}

                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!m.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = mediaList.map((it, idx) => ({
                                      ...it,
                                      is_primary: idx === mi,
                                    }));
                                    setEditingProject({
                                      ...editingProject,
                                      media: JSON.stringify(updated),
                                    });
                                  }}
                                  className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono cursor-pointer"
                                >
                                  Principal
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = mediaList.filter((_, idx) => idx !== mi);
                                  setEditingProject({
                                    ...editingProject,
                                    media: JSON.stringify(updated),
                                  });
                                }}
                                className="p-1.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Links Manager */}
                <div className="space-y-3 md:col-span-2 p-4 rounded-xl border border-white/5 bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-300">
                      Enlaces Externos (Demo, Repositorio, Docs)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        let curLinks: LinkItem[] = [];
                        try {
                          curLinks = JSON.parse(editingProject.links || "[]");
                        } catch {
                          curLinks = [];
                        }
                        const newLink: LinkItem = {
                          title: "Nuevo Enlace",
                          url: "https://",
                          icon: "external-link",
                        };
                        setEditingProject({
                          ...editingProject,
                          links: JSON.stringify([...curLinks, newLink]),
                        });
                      }}
                      className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                    >
                      + Añadir Enlace
                    </button>
                  </div>

                  {(() => {
                    let linkList: LinkItem[] = [];
                    try {
                      linkList = JSON.parse(editingProject.links || "[]");
                    } catch {
                      linkList = [];
                    }

                    return (
                      <div className="space-y-2">
                        {linkList.map((link, li) => (
                          <div
                            key={li}
                            className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-slate-900"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setIconTarget({ linkIdx: li });
                                setIconModalOpen(true);
                              }}
                              className="p-2 rounded-lg border border-white/10 bg-slate-950 text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer shrink-0"
                              title="Seleccionar icono"
                            >
                              <DynamicIcon name={link.icon || "external-link"} size={16} />
                            </button>

                            <input
                              type="text"
                              value={link.title}
                              placeholder="Título (ej. Código fuente)"
                              onChange={(e) => {
                                const updated = [...linkList];
                                updated[li].title = e.target.value;
                                setEditingProject({
                                  ...editingProject,
                                  links: JSON.stringify(updated),
                                });
                              }}
                              className="w-full sm:w-1/3 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                            />

                            <input
                              type="text"
                              value={link.url}
                              placeholder="https://..."
                              onChange={(e) => {
                                const updated = [...linkList];
                                updated[li].url = e.target.value;
                                setEditingProject({
                                  ...editingProject,
                                  links: JSON.stringify(updated),
                                });
                              }}
                              className="w-full sm:flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const updated = linkList.filter((_, idx) => idx !== li);
                                setEditingProject({
                                  ...editingProject,
                                  links: JSON.stringify(updated),
                                });
                              }}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Long Description Markdown */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-300">
                      Descripción Detallada (Markdown soportado)
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreviewProjectDesc(!previewProjectDesc)}
                      className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>{previewProjectDesc ? "Editar texto" : "Vista previa"}</span>
                    </button>
                  </div>

                  {previewProjectDesc ? (
                    <div className="w-full min-h-[160px] max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200">
                      <MarkdownRenderer content={editingProject.long_description || ""} />
                    </div>
                  ) : (
                    <textarea
                      rows={6}
                      value={editingProject.long_description || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, long_description: e.target.value })
                      }
                      placeholder="Explica la arquitectura, retos resueltos y despliegue del proyecto..."
                      className="w-full rounded-xl border border-white/10 bg-slate-900 p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 bg-[#090d16] border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {isProjectDirty ? "Descartar Cambios" : "Cerrar"}
              </button>

              {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
              {isProjectDirty ? (
                <button
                  type="button"
                  onClick={handleSaveProjectModal}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Sin cambios pendientes
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OVERLAID MODAL 3: EXPERIENCIA LABORAL */}
      {/* ========================================================================= */}
      {editingExperience && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingExperience(null);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c1220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0c1220] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {editingExperience.isNew ? "Nueva Experiencia" : `Editar: ${editingExperience.role}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    {editingExperience.company || "Empresa"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
                {isExperienceDirty && (
                  <button
                    type="button"
                    onClick={handleSaveExperienceModal}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                  >
                    <Save size={14} />
                    <span>{saving ? "Guardando..." : "Guardar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingExperience(null)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Empresa</label>
                  <input
                    type="text"
                    value={editingExperience.company}
                    onChange={(e) =>
                      setEditingExperience({ ...editingExperience, company: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Puesto / Rol</label>
                  <input
                    type="text"
                    value={editingExperience.role}
                    onChange={(e) =>
                      setEditingExperience({ ...editingExperience, role: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Fecha de Inicio</label>
                  <input
                    type="text"
                    placeholder="2022 o Ene 2022"
                    value={editingExperience.start_date}
                    onChange={(e) =>
                      setEditingExperience({ ...editingExperience, start_date: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Fecha de Fin</label>
                  <input
                    type="text"
                    placeholder="2024 o Presente"
                    disabled={editingExperience.is_current === 1}
                    value={editingExperience.is_current ? "Presente" : editingExperience.end_date}
                    onChange={(e) =>
                      setEditingExperience({ ...editingExperience, end_date: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-white/10 bg-slate-900/60 text-xs font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingExperience.is_current === 1}
                      onChange={(e) =>
                        setEditingExperience({
                          ...editingExperience,
                          is_current: e.target.checked ? 1 : 0,
                          end_date: e.target.checked ? "Presente" : "",
                        })
                      }
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Trabajo actualmente aquí (is_current)</span>
                  </label>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">Ubicación</label>
                  <input
                    type="text"
                    value={editingExperience.location || ""}
                    onChange={(e) =>
                      setEditingExperience({ ...editingExperience, location: e.target.value })
                    }
                    placeholder="Remoto / Madrid, España"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Descripción de Responsabilidades
                  </label>
                  <textarea
                    rows={4}
                    value={editingExperience.description}
                    onChange={(e) =>
                      setEditingExperience({ ...editingExperience, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>

                {/* Skills manager */}
                <div className="space-y-2 sm:col-span-2 p-3.5 rounded-xl border border-white/5 bg-slate-900/60">
                  <label className="block text-xs font-mono text-slate-300">
                    Tecnologías & Skills
                  </label>
                  {(() => {
                    let skillsList: string[] = [];
                    try {
                      skillsList = JSON.parse(editingExperience.skills || "[]");
                    } catch {
                      skillsList = [];
                    }

                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {skillsList.map((sk, ski) => (
                            <span
                              key={ski}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono"
                            >
                              <span>#{sk}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = skillsList.filter((_, idx) => idx !== ski);
                                  setEditingExperience({
                                    ...editingExperience,
                                    skills: JSON.stringify(filtered),
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-300 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Añadir habilidad (ej. Kubernetes)..."
                            value={newExpSkill}
                            onChange={(e) => setNewExpSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newExpSkill.trim()) {
                                e.preventDefault();
                                const updated = [...skillsList, newExpSkill.trim()];
                                setEditingExperience({
                                  ...editingExperience,
                                  skills: JSON.stringify(updated),
                                });
                                setNewExpSkill("");
                              }
                            }}
                            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newExpSkill.trim()) return;
                              const updated = [...skillsList, newExpSkill.trim()];
                              setEditingExperience({
                                ...editingExperience,
                                skills: JSON.stringify(updated),
                              });
                              setNewExpSkill("");
                            }}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 transition-colors cursor-pointer"
                          >
                            + Añadir
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 bg-[#090d16] border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingExperience(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {isExperienceDirty ? "Descartar Cambios" : "Cerrar"}
              </button>

              {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
              {isExperienceDirty ? (
                <button
                  type="button"
                  onClick={handleSaveExperienceModal}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Sin cambios pendientes
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OVERLAID MODAL 4: FORMACIÓN / EDUCACIÓN */}
      {/* ========================================================================= */}
      {editingEducation && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingEducation(null);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c1220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0c1220] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {editingEducation.isNew ? "Nueva Formación" : `Editar: ${editingEducation.degree}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    {editingEducation.institution || "Institución"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
                {isEducationDirty && (
                  <button
                    type="button"
                    onClick={handleSaveEducationModal}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                  >
                    <Save size={14} />
                    <span>{saving ? "Guardando..." : "Guardar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingEducation(null)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Institución Educativa
                  </label>
                  <input
                    type="text"
                    value={editingEducation.institution}
                    onChange={(e) =>
                      setEditingEducation({ ...editingEducation, institution: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Título o Certificación
                  </label>
                  <input
                    type="text"
                    value={editingEducation.degree}
                    onChange={(e) =>
                      setEditingEducation({ ...editingEducation, degree: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Campo de Estudio / Especialidad
                  </label>
                  <input
                    type="text"
                    value={editingEducation.field_of_study || ""}
                    onChange={(e) =>
                      setEditingEducation({ ...editingEducation, field_of_study: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Año de Inicio</label>
                  <input
                    type="text"
                    value={editingEducation.start_year}
                    onChange={(e) =>
                      setEditingEducation({ ...editingEducation, start_year: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300">Año de Fin</label>
                  <input
                    type="text"
                    value={editingEducation.end_year}
                    onChange={(e) =>
                      setEditingEducation({ ...editingEducation, end_year: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Detalles / Descripción Adicional
                  </label>
                  <textarea
                    rows={3}
                    value={editingEducation.description || ""}
                    onChange={(e) =>
                      setEditingEducation({ ...editingEducation, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 bg-[#090d16] border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingEducation(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {isEducationDirty ? "Descartar Cambios" : "Cerrar"}
              </button>

              {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
              {isEducationDirty ? (
                <button
                  type="button"
                  onClick={handleSaveEducationModal}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Sin cambios pendientes
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OVERLAID MODAL 5: CONOCIMIENTOS (CATEGORÍA / ARTÍCULO) */}
      {/* ========================================================================= */}
      {editingKnowledge && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingKnowledge(null);
          }}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c1220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0c1220] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {editingKnowledge.isNew ? "Nueva Categoría" : `Editar: ${editingKnowledge.name}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    Artículo y notas en formato Markdown
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
                {isKnowledgeDirty && (
                  <button
                    type="button"
                    onClick={handleSaveKnowledgeModal}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                  >
                    <Save size={14} />
                    <span>{saving ? "Guardando..." : "Guardar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingKnowledge(null)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    value={editingKnowledge.name}
                    onChange={(e) =>
                      setEditingKnowledge({ ...editingKnowledge, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300">Slug URL</label>
                  <input
                    type="text"
                    value={editingKnowledge.slug || ""}
                    onChange={(e) =>
                      setEditingKnowledge({ ...editingKnowledge, slug: e.target.value })
                    }
                    placeholder="docker-cloud-architecture"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Markdown editor */}
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-slate-300">
                      Contenido .md (Editor Markdown & Blog)
                    </label>

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-emerald-400">
                        <Upload size={12} />
                        <span>Adjuntar Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                const imgMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n\n`;
                                setEditingKnowledge({
                                  ...editingKnowledge,
                                  content: (editingKnowledge.content || "") + imgMarkdown,
                                });
                              });
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setPreviewKnowledgeDesc(!previewKnowledgeDesc)}
                        className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>{previewKnowledgeDesc ? "Editar código" : "Vista previa"}</span>
                      </button>
                    </div>
                  </div>

                  {previewKnowledgeDesc ? (
                    <div className="w-full min-h-[220px] max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200">
                      <MarkdownRenderer content={editingKnowledge.content || ""} />
                    </div>
                  ) : (
                    <textarea
                      rows={10}
                      value={editingKnowledge.content || ""}
                      onChange={(e) =>
                        setEditingKnowledge({ ...editingKnowledge, content: e.target.value })
                      }
                      placeholder="# Título del artículo&#10;&#10;Escribe aquí tus notas o guías técnicas..."
                      className="w-full rounded-xl border border-white/10 bg-slate-900 p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 bg-[#090d16] border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingKnowledge(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {isKnowledgeDirty ? "Descartar Cambios" : "Cerrar"}
              </button>

              {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
              {isKnowledgeDirty ? (
                <button
                  type="button"
                  onClick={handleSaveKnowledgeModal}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Sin cambios pendientes
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OVERLAID MODAL 6: RED SOCIAL / ENLACE */}
      {/* ========================================================================= */}
      {editingSocial && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingSocial(null);
          }}
        >
          <div className="relative w-full max-w-lg bg-[#0c1220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0c1220] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Share2 size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {editingSocial.isNew ? "Nuevo Enlace" : `Editar: ${editingSocial.platform}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    Icono y dirección web
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
                {isSocialDirty && (
                  <button
                    type="button"
                    onClick={handleSaveSocialModal}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                  >
                    <Save size={14} />
                    <span>{saving ? "Guardando..." : "Guardar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingSocial(null)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300">Nombre de la Plataforma</label>
                <input
                  type="text"
                  value={editingSocial.platform}
                  onChange={(e) =>
                    setEditingSocial({ ...editingSocial, platform: e.target.value })
                  }
                  placeholder="GitHub, LinkedIn, Twitter..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300">URL del Enlace</label>
                <input
                  type="text"
                  value={editingSocial.url}
                  onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Icon selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-mono text-slate-300">Icono Representativo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <DynamicIcon name={editingSocial.icon_name || "globe"} size={22} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIconTarget("social");
                      setIconModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Cambiar Icono ({editingSocial.icon_name || "globe"})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-20 bg-[#090d16] border-t border-white/10 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingSocial(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              >
                {isSocialDirty ? "Descartar Cambios" : "Cerrar"}
              </button>

              {/* BOTÓN GUARDAR: APARECE ÚNICAMENTE SI SE HA MODIFICADO ALGO */}
              {isSocialDirty ? (
                <button
                  type="button"
                  onClick={handleSaveSocialModal}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer animate-in fade-in"
                >
                  <Save size={15} />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-500">
                  Sin cambios pendientes
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ICON PICKER MODAL (SUB-MODAL) */}
      {/* ========================================================================= */}
      <IconPickerModal
        isOpen={iconModalOpen}
        onClose={() => {
          setIconModalOpen(false);
          setIconTarget(null);
        }}
        onSelect={(iconId) => {
          if (iconTarget === "social" && editingSocial) {
            setEditingSocial({ ...editingSocial, icon_name: iconId });
          } else if (
            typeof iconTarget === "object" &&
            iconTarget !== null &&
            "linkIdx" in iconTarget &&
            editingProject
          ) {
            let curLinks: LinkItem[] = [];
            try {
              curLinks = JSON.parse(editingProject.links || "[]");
            } catch {
              curLinks = [];
            }
            if (curLinks[iconTarget.linkIdx]) {
              curLinks[iconTarget.linkIdx].icon = iconId;
              setEditingProject({
                ...editingProject,
                links: JSON.stringify(curLinks),
              });
            }
          }
          setIconModalOpen(false);
          setIconTarget(null);
        }}
      />
    </div>
  );
}
