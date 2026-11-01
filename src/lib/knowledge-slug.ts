// Utilidad compartida para generar/parsear slugs de categorías de conocimiento.
// Formato: "{id}-{nombre-slugificado}"
// Ejemplo: id=2, name="Docker & DevOps" → "2-docker-devops"

export function categoryToSlug(id: number, name: string): string {
  const nameSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s-]/g, "")   // solo alfanumérico, espacios y guiones
    .trim()
    .replace(/\s+/g, "-")           // espacios → guiones
    .replace(/-+/g, "-");           // colapsa guiones múltiples
  return `${id}-${nameSlug}`;
}

export function categorySlugToId(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}
