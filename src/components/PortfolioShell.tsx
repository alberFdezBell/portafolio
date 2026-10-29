"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StorySection } from "./StorySection";
import { ExperienceSection, ExperienceItem } from "./ExperienceSection";
import { ProjectsSection, ProjectItem } from "./ProjectsSection";
import { EducationSection, EducationItem } from "./EducationSection";
import { KnowledgeSection, KnowledgeCategoryItem } from "./KnowledgeSection";
import { KnowledgeCategoryMenuView } from "./KnowledgeCategoryMenuView";
import { KnowledgeDetailView } from "./KnowledgeDetailView";
import { Footer, SocialLinkItem } from "./Footer";
import { ProjectDetailView } from "./ProjectDetailView";

interface PortfolioShellProps {
  profile: any;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  knowledgeCategories?: KnowledgeCategoryItem[];
  socialLinks: SocialLinkItem[];
}

export function PortfolioShell({
  profile,
  experiences,
  projects,
  education,
  knowledgeCategories = [],
  socialLinks,
}: PortfolioShellProps) {
  // Project Detail state
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const projectCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProjectOpeningRef = useRef(false);

  // Knowledge Menu & Detail state
  const [isKnowledgeMenuOpen, setIsKnowledgeMenuOpen] = useState(false);
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] =
    useState<KnowledgeCategoryItem | null>(null);
  const [isKnowledgeDetailOpen, setIsKnowledgeDetailOpen] = useState(false);
  const knowledgeCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isKnowledgeOpeningRef = useRef(false);

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

    projectCloseTimerRef.current = setTimeout(() => {
      setSelectedProject(null);
      if (typeof document !== "undefined") {
        document.body.classList.remove("scrollbar-hidden");
      }
      projectCloseTimerRef.current = null;
    }, 750);
  };

  // --- KNOWLEDGE HANDLERS ---
  const handleOpenKnowledgeMenu = () => {
    if (isKnowledgeMenuOpen || isKnowledgeOpeningRef.current) return;
    isKnowledgeOpeningRef.current = true;

    if (knowledgeCloseTimerRef.current) {
      clearTimeout(knowledgeCloseTimerRef.current);
      knowledgeCloseTimerRef.current = null;
    }

    if (typeof document !== "undefined") {
      document.body.classList.add("scrollbar-hidden");
      document.body.style.overflow = "hidden";
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsKnowledgeMenuOpen(true);
        setTimeout(() => {
          isKnowledgeOpeningRef.current = false;
        }, 750);
      });
    });
  };

  const handleCloseKnowledgeMenu = () => {
    if (isKnowledgeOpeningRef.current) return;

    if (knowledgeCloseTimerRef.current) {
      clearTimeout(knowledgeCloseTimerRef.current);
    }

    setIsKnowledgeMenuOpen(false);

    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }

    knowledgeCloseTimerRef.current = setTimeout(() => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("scrollbar-hidden");
      }
      knowledgeCloseTimerRef.current = null;
    }, 750);
  };

  const handleSelectKnowledgeCategory = (cat: KnowledgeCategoryItem) => {
    setSelectedKnowledgeCategory(cat);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsKnowledgeDetailOpen(true);
      });
    });
  };

  const handleCloseKnowledgeDetail = () => {
    setIsKnowledgeDetailOpen(false);
    // Keep selectedKnowledgeCategory until transition completes to avoid flash of empty
    setTimeout(() => {
      if (!isKnowledgeDetailOpen) {
        setSelectedKnowledgeCategory(null);
      }
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
        } else if (isKnowledgeMenuOpen) {
          handleCloseKnowledgeMenu();
        } else if (isDetailOpen) {
          handleCloseProject();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isKnowledgeDetailOpen, isKnowledgeMenuOpen, isDetailOpen]);

  const isAnyOverlayActive =
    isDetailOpen || isKnowledgeMenuOpen || isKnowledgeDetailOpen;

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
            onOpenKnowledge={handleOpenKnowledgeMenu}
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

      {/* SCREEN 2 (Knowledge): Knowledge Category Menu Screen */}
      <div
        aria-hidden={!isKnowledgeMenuOpen}
        className={`fixed inset-0 z-50 transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isKnowledgeMenuOpen && !isKnowledgeDetailOpen
            ? "translate-x-0"
            : isKnowledgeDetailOpen
            ? "-translate-x-full pointer-events-none"
            : "translate-x-full pointer-events-none"
        }`}
      >
        <KnowledgeCategoryMenuView
          categories={knowledgeCategories}
          onSelectCategory={handleSelectKnowledgeCategory}
          onClose={handleCloseKnowledgeMenu}
        />
      </div>

      {/* SCREEN 3 (Knowledge): Knowledge Category Markdown / Blog Viewer */}
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
