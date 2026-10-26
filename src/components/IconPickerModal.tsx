"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { POPULAR_ICONS, IconItem } from "@/lib/icons-catalog";
import {
  Search,
  X,
  Check,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconId: string) => void;
  selectedIcon?: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "custom", label: "Personalizados" },
  { key: "social", label: "Redes" },
  { key: "dev", label: "Desarrollo" },
  { key: "cloud", label: "Cloud & DevOps" },
  { key: "tool", label: "Herramientas" },
  { key: "general", label: "General" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function IconPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
}: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customInput, setCustomInput] = useState("");
  const [customIcons, setCustomIcons] = useState<IconItem[]>([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [activeIcon, setActiveIcon] = useState<IconItem | null>(null);

  // Sub-modal for creating / editing custom icon
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<IconItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formPreviewUrl, setFormPreviewUrl] = useState<string>("");
  const [formColor, setFormColor] = useState<string>("#10b981");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch custom icons from API when modal opens
  const fetchCustomIcons = async () => {
    setIsLoadingCustom(true);
    try {
      const res = await fetch("/api/admin/icons");
      if (res.ok) {
        const data = await res.json();
        setCustomIcons(data);
      }
    } catch {
      // Ignore network errors on fetch
    } finally {
      setIsLoadingCustom(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCustomIcons();
      setActiveIcon(null);
    }
  }, [isOpen]);

  // Combined icons list: custom icons first, then popular icons
  const allIcons = useMemo(() => {
    return [...customIcons, ...POPULAR_ICONS];
  }, [customIcons]);

  const filteredIcons = useMemo(() => {
    return allIcons.filter((icon) => {
      const matchesSearch =
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === "all" || icon.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [allIcons, search, selectedCategory]);

  // Open editor in CREATE mode
  const handleOpenCreateModal = () => {
    setEditingIcon(null);
    setFormName("");
    setFormSlug("");
    setSlugManuallyEdited(false);
    setFormPreviewUrl("");
    setFormColor("#10b981");
    setEditorError(null);
    setIsEditorOpen(true);
  };

  // Open editor in EDIT / CUSTOMIZE mode for an icon
  const handleOpenEditModal = (icon: IconItem) => {
    setEditingIcon(icon);
    setFormName(icon.name);
    setFormSlug(icon.slug);
    setSlugManuallyEdited(true); // Don't auto-overwrite existing slug
    setFormPreviewUrl(icon.cdnUrl || "");
    setFormColor(icon.color || "#10b981");
    setEditorError(null);
    setIsEditorOpen(true);
  };

  // Handle name input with auto-slug
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!slugManuallyEdited) {
      setFormSlug(slugify(val));
    }
  };

  // Handle slug manual input
  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setFormSlug(slugify(val));
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    const allowedTypes = [
      "image/svg+xml",
      "image/webp",
      "image/png",
      "image/jpeg",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      setEditorError(
        "Formato no permitido. Solo se aceptan SVG, WebP, PNG, JPEG y GIF."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditorError("El archivo excede el tamaño máximo permitido de 5MB.");
      return;
    }

    setEditorError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      setFormPreviewUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir archivo";
      setEditorError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Save custom icon to DB
  const handleSaveCustomIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setEditorError("El nombre del icono es obligatorio.");
      return;
    }
    const finalSlug = formSlug.trim() || slugify(formName);
    if (!finalSlug) {
      setEditorError("El slug identificador es obligatorio.");
      return;
    }

    setIsSaving(true);
    setEditorError(null);

    try {
      const payload = {
        id:
          editingIcon?.isCustom
            ? editingIcon.id
            : `custom-${finalSlug}-${Date.now()}`,
        name: formName.trim(),
        slug: finalSlug,
        category: "custom",
        type: "custom",
        cdn_url: formPreviewUrl || null,
        color: formColor || null,
      };

      const res = await fetch("/api/admin/icons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Error al guardar icono");
      }

      // Refresh list
      await fetchCustomIcons();
      setSelectedCategory("custom");
      setIsEditorOpen(false);

      // Auto-select newly created/customized icon
      if (resData.icon) {
        setActiveIcon(resData.icon);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar icono";
      setEditorError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete custom icon
  const handleDeleteCustomIcon = async (icon: IconItem) => {
    if (!confirm(`¿Eliminar el icono personalizado "${icon.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/icons?id=${encodeURIComponent(icon.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (activeIcon?.id === icon.id) {
          setActiveIcon(null);
        }
        await fetchCustomIcons();
      }
    } catch {
      alert("Error al eliminar el icono");
    }
  };

  // Select an icon and close
  const handleSelectIcon = (icon: IconItem) => {
    // If it has a cdnUrl (like uploaded /uploads/... or SVG), use that, otherwise slug
    const valueToSelect = icon.cdnUrl || icon.slug;
    onSelect(valueToSelect);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0f172a] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-xs sm:text-sm">CDN::</span>
              Buscador de Iconos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Iconos de SimpleIcons, Lucide o sube tus propios iconos personalizados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 text-xs font-semibold transition-all active:scale-95 shadow-sm"
              title="Crear un nuevo icono personalizado"
            >
              <Plus size={15} />
              <span>Crear icono</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="py-3 space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Buscar tecnología, red social o icono (ej. github, docker, react, custom)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.key;
              const count =
                cat.key === "custom"
                  ? customIcons.length
                  : cat.key === "all"
                  ? allIcons.length
                  : allIcons.filter((i) => i.category === cat.key).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-mono whitespace-nowrap flex items-center gap-1.5 ${
                    isCatActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isCatActive
                        ? "bg-emerald-500/30 text-emerald-300"
                        : "bg-black/30 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Icons */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 py-2">
          {filteredIcons.map((icon: IconItem) => {
            const isSelected =
              selectedIcon === icon.id ||
              selectedIcon === icon.slug ||
              (icon.cdnUrl && selectedIcon === icon.cdnUrl);
            const isActive = activeIcon?.id === icon.id;

            return (
              <div
                key={icon.id}
                onClick={() => setActiveIcon(icon)}
                onDoubleClick={() => handleSelectIcon(icon)}
                className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                  isSelected || isActive
                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-sm shadow-emerald-500/10"
                    : "border-white/5 bg-slate-900/50 hover:bg-slate-800/80 hover:border-white/10 text-slate-300"
                }`}
              >
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0 w-9 h-9">
                  <DynamicIcon name={icon.cdnUrl || icon.id} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium text-white truncate">{icon.name}</p>
                    {icon.isCustom && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{icon.slug}</p>
                </div>

                {/* Edit Button */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(icon);
                    }}
                    className={`p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-emerald-300 transition-colors ${
                      isActive || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Personalizar / Editar este icono"
                    aria-label="Editar icono"
                  >
                    <Pencil size={13} />
                  </button>

                  {icon.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomIcon(icon);
                      }}
                      className={`p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ${
                        isActive || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                      title="Eliminar icono personalizado"
                      aria-label="Eliminar icono"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {isSelected && (
                    <Check size={16} className="text-emerald-400 shrink-0 ml-0.5" />
                  )}
                </div>
              </div>
            );
          })}

          {filteredIcons.length === 0 && !isLoadingCustom && (
            <div className="col-span-full py-12 text-center text-slate-500 space-y-3">
              <Sparkles size={28} className="mx-auto text-slate-600" />
              <p className="text-xs font-mono">
                {selectedCategory === "custom"
                  ? "No tienes iconos personalizados todavía."
                  : "No se encontraron iconos que coincidan con la búsqueda."}
              </p>
              {selectedCategory === "custom" && (
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <Plus size={14} />
                  <span>Crear mi primer icono</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Icon Action Bar */}
        {activeIcon && (
          <div className="mt-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-black/60 border border-emerald-500/30 flex items-center justify-center shrink-0 w-9 h-9">
                <DynamicIcon name={activeIcon.cdnUrl || activeIcon.id} size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {activeIcon.name}
                </p>
                <p className="text-[11px] font-mono text-emerald-400 truncate">
                  slug: {activeIcon.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenEditModal(activeIcon)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                title="Personalizar este icono y guardarlo en la categoría Personalizados"
              >
                <Pencil size={13} className="text-emerald-400" />
                <span>Personalizar / Editar</span>
              </button>

              <button
                onClick={() => handleSelectIcon(activeIcon)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors active:scale-95 shadow-sm shadow-emerald-500/20"
              >
                <Check size={14} />
                <span>Usar este icono</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom icon slug or CDN URL fallback */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="O escribe slug (ej: bluesky) o URL directa..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={() => {
              if (customInput.trim()) {
                onSelect(customInput.trim());
                onClose();
              }
            }}
            disabled={!customInput.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            Usar
          </button>
        </div>
      </div>

      {/* Sub-Modal: Custom Icon Creator / Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0b1120] p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  {editingIcon ? "Personalizar Icono" : "Crear Icono Personalizado"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingIcon
                    ? "Modifica sus datos y se guardará en la categoría 'Personalizados'"
                    : "Define nombre, slug identificador y sube la foto de tu icono"}
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error banner */}
            {editorError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                <AlertCircle size={15} className="shrink-0" />
                <span>{editorError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomIcon} className="space-y-4 text-xs">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium font-mono text-[11px] uppercase tracking-wider">
                  Nombre del icono <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bluesky, Portafolio, Docker Pro, Threads..."
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-medium font-mono text-[11px] uppercase tracking-wider">
                    Slug identificador <span className="text-emerald-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (autocompletado, editable)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ej: bluesky"
                  value={formSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400">
                  Se genera a partir del nombre en minúsculas y sin espacios. Puedes modificarlo libremente.
                </p>
              </div>

              {/* Foto / Archivo de Imagen */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium font-mono text-[11px] uppercase tracking-wider">
                  Foto o Archivo del Icono
                </label>

                {/* Formatos admitidos info box */}
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
                    <ImageIcon size={13} />
                    <span>Formatos admitidos:</span>
                  </div>
                  <p className="font-mono text-xs text-white">
                    SVG, WebP, PNG, JPEG, GIF <span className="text-slate-400 font-sans">(máx. 5MB)</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Para la mejor calidad y nitidez en modo oscuro, se recomienda <span className="text-emerald-400 font-mono">SVG</span> o <span className="text-emerald-400 font-mono">WebP</span> con fondo transparente.
                  </p>
                </div>

                {/* Preview and Upload trigger */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-14 h-14 rounded-xl border border-white/10 bg-black/60 flex items-center justify-center shrink-0 overflow-hidden">
                    {formPreviewUrl ? (
                      <DynamicIcon name={formPreviewUrl} size={32} />
                    ) : editingIcon ? (
                      <DynamicIcon name={editingIcon.cdnUrl || editingIcon.id} size={32} />
                    ) : (
                      <ImageIcon size={24} className="text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".svg,.webp,.png,.jpg,.jpeg,.gif,image/svg+xml,image/webp,image/png,image/jpeg,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-emerald-400" />
                          <span>Subiendo imagen...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} className="text-emerald-400" />
                          <span>{formPreviewUrl ? "Cambiar foto" : "Subir foto / icono"}</span>
                        </>
                      )}
                    </button>

                    {formPreviewUrl && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                        <span className="truncate max-w-[200px] text-emerald-400">{formPreviewUrl}</span>
                        <button
                          type="button"
                          onClick={() => setFormPreviewUrl("")}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          Quitar foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Guardar en Personalizados</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
