"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StorySection } from "./StorySection";
import { ExperienceSection, ExperienceItem } from "./ExperienceSection";
import { ProjectsSection, ProjectItem } from "./ProjectsSection";
import { EducationSection, EducationItem } from "./EducationSection";
import { KnowledgeSection, KnowledgeCategoryItem } from "./KnowledgeSection";
import { KnowledgeDetailView } from "./KnowledgeDetailView";
import { Footer, SocialLinkItem } from "./Footer";
import { ProjectDetailView } from "./ProjectDetailView";
import { projectToSlug } from "@/lib/project-slug";
import { categoryToSlug } from "@/lib/knowledge-slug";

interface PortfolioShellProps {
  profile: any;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  knowledgeCategories?: KnowledgeCategoryItem[];
  socialLinks: SocialLinkItem[];
  initialProject?: ProjectItem | null;
  initialKnowledgeCategory?: KnowledgeCategoryItem | null;
}

export function PortfolioShell({
  profile,
  experiences,
  projects,
  education,
  knowledgeCategories = [],
  socialLinks,
  initialProject = null,
  initialKnowledgeCategory = null,
}: PortfolioShellProps) {
  // Project Detail state
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    () => initialProject
  );
  const [isDetailOpen, setIsDetailOpen] = useState(() => !!initialProject);
  const projectCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProjectOpeningRef = useRef(false);

  // Knowledge Detail state
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] =
    useState<KnowledgeCategoryItem | null>(() => initialKnowledgeCategory);
  const [isKnowledgeDetailOpen, setIsKnowledgeDetailOpen] = useState(
    () => !!initialKnowledgeCategory
  );
  const knowledgeCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isKnowledgeOpeningRef = useRef(false);

  // Prepare background scroll position if starting directly on a detail view
  useEffect(() => {
    if (initialKnowledgeCategory || initialProject) {
      if (typeof document !== "undefined") {
        document.body.classList.add("scrollbar-hidden");
        document.body.style.overflow = "hidden";
      }
      if (initialKnowledgeCategory) {
        const el = document.getElementById("conocimientos");
        if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      } else if (initialProject) {
        const el = document.getElementById("proyectos");
        if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      }
    }
  }, [initialKnowledgeCategory, initialProject]);

  // --- PROJECT DETAIL HANDLERS ---
  const handleOpenProject = (proj: ProjectItem) => {
    if (isDetailOpen || isProjectOpeningRef.current) return;
    isProjectOpeningRef.current = true;

    if (projectCloseTimerRef.current) {
      clearTimeout(projectCloseTimerRef.current);
      projectCloseTimerRef.current = null;
    }

    setSelectedProject(proj);

    if (typeof document !== "undefined") {
      document.body.classList.add("scrollbar-hidden");
      document.body.style.overflow = "hidden";
    }

    // Update URL to the project's canonical URL without reloading the page
    const slug = projectToSlug(proj.id, proj.title);
    window.history.pushState({ projectSlug: slug }, "", `/project/${slug}`);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDetailOpen(true);
        setTimeout(() => {
          isProjectOpeningRef.current = false;
        }, 750);
      });
    });
  };

  const handleCloseProject = () => {
    if (isProjectOpeningRef.current) return;

    if (projectCloseTimerRef.current) {
      clearTimeout(projectCloseTimerRef.current);
    }

    setIsDetailOpen(false);

    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }

    const el = document.getElementById("proyectos");
    if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });

    // Restore URL to the projects section anchor
    window.history.pushState(null, "", "/#proyectos");

    projectCloseTimerRef.current = setTimeout(() => {
      setSelectedProject(null);
      if (typeof document !== "undefined") {
        document.body.classList.remove("scrollbar-hidden");
      }
      projectCloseTimerRef.current = null;
    }, 750);
  };

  // Handle browser back/forward buttons while the slide overlay is open
  useEffect(() => {
    const handlePopState = () => {
      if (isDetailOpen) {
        // User pressed back: close the project overlay without pushing another history entry
        if (projectCloseTimerRef.current) clearTimeout(projectCloseTimerRef.current);

        setIsDetailOpen(false);

        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }

        const el = document.getElementById("proyectos");
        if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });

        projectCloseTimerRef.current = setTimeout(() => {
          setSelectedProject(null);
          if (typeof document !== "undefined") {
            document.body.classList.remove("scrollbar-hidden");
          }
          projectCloseTimerRef.current = null;
        }, 750);
      } else if (isKnowledgeDetailOpen) {
        // User pressed back: close the knowledge overlay
        if (knowledgeCloseTimerRef.current) clearTimeout(knowledgeCloseTimerRef.current);

        setIsKnowledgeDetailOpen(false);

        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }

        const el = document.getElementById("conocimientos");
        if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });

        knowledgeCloseTimerRef.current = setTimeout(() => {
          setSelectedKnowledgeCategory(null);
          if (typeof document !== "undefined") {
            document.body.classList.remove("scrollbar-hidden");
          }
          knowledgeCloseTimerRef.current = null;
        }, 750);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDetailOpen, isKnowledgeDetailOpen]);

  // --- KNOWLEDGE HANDLERS ---
  const handleSelectKnowledgeCategory = (cat: KnowledgeCategoryItem) => {
    if (isKnowledgeDetailOpen || isKnowledgeOpeningRef.current) return;
    isKnowledgeOpeningRef.current = true;

    if (knowledgeCloseTimerRef.current) {
      clearTimeout(knowledgeCloseTimerRef.current);
      knowledgeCloseTimerRef.current = null;
    }

    setSelectedKnowledgeCategory(cat);

    if (typeof document !== "undefined") {
      document.body.classList.add("scrollbar-hidden");
      document.body.style.overflow = "hidden";
    }

    // Update URL to the category's canonical URL without reloading
    const slug = categoryToSlug(cat.id, cat.name);
    window.history.pushState({ categorySlug: slug }, "", `/knowledge/${slug}`);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsKnowledgeDetailOpen(true);
        setTimeout(() => {
          isKnowledgeOpeningRef.current = false;
        }, 750);
      });
    });
  };

  const handleCloseKnowledgeDetail = () => {
    if (isKnowledgeOpeningRef.current) return;

    if (knowledgeCloseTimerRef.current) {
      clearTimeout(knowledgeCloseTimerRef.current);
    }

    setIsKnowledgeDetailOpen(false);

    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }

    const el = document.getElementById("conocimientos");
    if (el) el.scrollIntoView({ behavior: "instant" as ScrollBehavior });

    // Restore URL to the knowledge section anchor
    window.history.pushState(null, "", "/#conocimientos");

    knowledgeCloseTimerRef.current = setTimeout(() => {
      setSelectedKnowledgeCategory(null);
      if (typeof document !== "undefined") {
        document.body.classList.remove("scrollbar-hidden");
      }
      knowledgeCloseTimerRef.current = null;
    }, 750);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (projectCloseTimerRef.current) clearTimeout(projectCloseTimerRef.current);
      if (knowledgeCloseTimerRef.current) clearTimeout(knowledgeCloseTimerRef.current);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
        document.body.classList.remove("scrollbar-hidden");
      }
    };
  }, []);

  // Keyboard accessibility: Escape key closes the outermost active view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isKnowledgeDetailOpen) {
          handleCloseKnowledgeDetail();
        } else if (isDetailOpen) {
          handleCloseProject();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isKnowledgeDetailOpen, isDetailOpen]);

  const isAnyOverlayActive = isDetailOpen || isKnowledgeDetailOpen;

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* Fixed Navbar with camera tracking pan transition synchronized */}
      <Navbar
        className={`transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isAnyOverlayActive ? "-translate-x-full pointer-events-none" : "translate-x-0"
        }`}
      />

      {/* SCREEN 1: Main Portfolio Screen (slides to the left as camera pans right) */}
      <div
        className={`w-full min-h-screen transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isAnyOverlayActive ? "-translate-x-full pointer-events-none" : "translate-x-0"
        }`}
      >
        <main id="main-content">
          <Hero
            name={profile.name}
            title={profile.title}
            shortBio={profile.short_bio}
            avatarUrl={profile.avatar_url}
            githubUrl={profile.github_url}
            linkedinUrl={profile.linkedin_url}
            email={profile.email}
          />

          <StorySection
            aboutStory={profile.about_story}
            avatarUrl={profile.avatar_url}
            name={profile.name}
          />

          <ExperienceSection experiences={experiences} />

          <ProjectsSection
            projects={projects}
            onSelectProject={handleOpenProject}
          />

          <EducationSection education={education} />

          <KnowledgeSection
            categories={knowledgeCategories}
            onSelectCategory={handleSelectKnowledgeCategory}
          />
        </main>

        <Footer
          email={profile.email}
          location={profile.location}
          socialLinks={socialLinks}
        />
      </div>

      {/* SCREEN 2 (Projects): Project Detail Screen */}
      <div
        aria-hidden={!isDetailOpen}
        className={`fixed inset-0 z-50 transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isDetailOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            onClose={handleCloseProject}
          />
        )}
      </div>

      {/* SCREEN 2 (Knowledge): Knowledge Category Markdown / Blog Viewer */}
      <div
        aria-hidden={!isKnowledgeDetailOpen}
        className={`fixed inset-0 z-50 transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isKnowledgeDetailOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {selectedKnowledgeCategory && (
          <KnowledgeDetailView
            category={selectedKnowledgeCategory}
            onClose={handleCloseKnowledgeDetail}
          />
        )}
      </div>
    </div>
  );
}
