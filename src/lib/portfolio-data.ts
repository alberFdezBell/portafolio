import { getDb } from "@/lib/db";
import { ExperienceItem } from "@/components/ExperienceSection";
import { ProjectItem } from "@/components/ProjectsSection";
import { EducationItem } from "@/components/EducationSection";
import { KnowledgeCategoryItem } from "@/components/KnowledgeSection";
import { SocialLinkItem } from "@/components/Footer";

export interface PortfolioData {
  profile: any;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  knowledgeCategories: KnowledgeCategoryItem[];
  socialLinks: SocialLinkItem[];
}

export function getPortfolioData(): PortfolioData {
  const db = getDb();

  const profile = (db.prepare("SELECT * FROM profile WHERE id = 1").get() as any) || {
    name: "Alberto Fernández Bellido",
    title: "Senior Full-Stack Developer & Cloud Architect",
    short_bio: "Construyendo software resiliente y moderno.",
    about_story: "",
    avatar_url: "",
    location: "España (Remoto)",
    email: "alberto.fernandez.bellido.8@gmail.com",
    status_badge: "🟢 Disponible para proyectos",
    github_url: "https://github.com/alberFdezBell",
    linkedin_url: "",
  };

  const experiences = (db
    .prepare("SELECT * FROM experiences ORDER BY order_num ASC, id DESC")
    .all() as ExperienceItem[]) || [];

  const projects = (db
    .prepare("SELECT * FROM projects ORDER BY order_num ASC, id DESC")
    .all() as ProjectItem[]) || [];

  const education = (db
    .prepare("SELECT * FROM education ORDER BY order_num ASC, id DESC")
    .all() as EducationItem[]) || [];

  const knowledgeCategories = (db
    .prepare("SELECT * FROM knowledge_categories ORDER BY order_num ASC, id ASC")
    .all() as KnowledgeCategoryItem[]) || [];

  const socialLinks = (db
    .prepare("SELECT * FROM social_links ORDER BY order_num ASC, id ASC")
    .all() as SocialLinkItem[]) || [];

  return {
    profile,
    experiences,
    projects,
    education,
    knowledgeCategories,
    socialLinks,
  };
}
