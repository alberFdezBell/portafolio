"use client";

import React from "react";
import { Footer, type SocialLinkItem } from "./Footer";

export type { SocialLinkItem };

export interface ContactSectionProps {
  email: string;
  location?: string | null;
  socialLinks: SocialLinkItem[];
}

/**
 * @deprecated Se ha consolidado dentro de Footer.tsx.
 */
export function ContactSection({ email, location, socialLinks }: ContactSectionProps) {
  return <Footer email={email} location={location} socialLinks={socialLinks} />;
}
