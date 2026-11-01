// Utilidad compartida para generar/parsear slugs de proyectos.
// Formato: "{id}-{titulo-slugificado}"
// Ejemplo: id=3, title="Mi Portafolio Dev" → "3-mi-portafolio-dev"

export function projectToSlug(id: number, title: string): string {
  const titleSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s-]/g, "")   // solo alfanumérico, espacios y guiones
    .trim()
    .replace(/\s+/g, "-")           // espacios → guiones
    .replace(/-+/g, "-");           // colapsa guiones múltiples
  return `${id}-${titleSlug}`;
}

export function slugToId(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}
