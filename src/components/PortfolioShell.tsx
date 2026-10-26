"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StorySection } from "./StorySection";
import { ExperienceSection, ExperienceItem } from "./ExperienceSection";
import { ProjectsSection, ProjectItem } from "./ProjectsSection";
import { EducationSection, EducationItem } from "./EducationSection";
import { ContactSection, SocialLinkItem } from "./ContactSection";
import { Footer } from "./Footer";
import { ProjectDetailView } from "./ProjectDetailView";

interface PortfolioShellProps {
  profile: any;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  socialLinks: SocialLinkItem[];
}

export function PortfolioShell({
  profile,
  experiences,
  projects,
  education,
  socialLinks,
}: PortfolioShellProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenProject = (proj: ProjectItem) => {
    setSelectedProject(proj);

    if (typeof document !== "undefined") {
      document.body.classList.add("scrollbar-hidden");
      document.body.style.overflow = "hidden";
    }

    // Two animation frames ensure browser registers the off-screen start state before transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDetailOpen(true);
      });
    });
  };

  const handleCloseProject = () => {
    setIsDetailOpen(false);

    // Restore body overflow at the START of the animation so the page layout is established immediately
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      // Keep scrollbar-hidden active during the slide animation so the scrollbar starts invisible
    }

    // When the 750ms slide transition finishes, smoothly reveal the scrollbar thumb
    setTimeout(() => {
      setSelectedProject(null);
      if (typeof document !== "undefined") {
        document.body.classList.remove("scrollbar-hidden");
      }
    }, 750);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
        document.body.classList.remove("scrollbar-hidden");
      }
    };
  }, []);

  // Keyboard accessibility: Escape key closes the detail view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDetailOpen) {
        handleCloseProject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailOpen]);

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* Fixed Navbar with camera tracking pan transition synchronized */}
      <Navbar
        statusBadge={profile.status_badge}
        className={`transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isDetailOpen ? "-translate-x-full pointer-events-none" : "translate-x-0"
        }`}
      />

      {/* SCREEN 1: Main Portfolio Screen (slides to the left as camera pans right) */}
      <div
        className={`w-full min-h-screen transition-transform duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isDetailOpen ? "-translate-x-full pointer-events-none" : "translate-x-0"
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

          <ContactSection
            email={profile.email}
            location={profile.location}
            socialLinks={socialLinks}
          />
        </main>

        <Footer />
      </div>

      {/* SCREEN 2: Project Detail Screen (slides in from the right to left in lockstep) */}
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
    </div>
  );
}

