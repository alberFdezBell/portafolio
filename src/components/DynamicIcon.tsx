"use client";

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { getIconRenderer } from "@/lib/icons-catalog";

interface DynamicIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export function DynamicIcon({ name, className = "w-5 h-5", size = 20 }: DynamicIconProps) {
  const [imgError, setImgError] = useState(false);
  const info = getIconRenderer(name);

  // Direct vector render for LinkedIn to avoid CDN 404s and match text-color / hover styling seamlessly
  if (name?.toLowerCase() === "linkedin" || info.name?.toLowerCase() === "linkedin") {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`${className} object-contain transition-transform group-hover:scale-110`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }

  if (!info.isLucide && info.url && !imgError) {
    return (
      <img
        src={info.url}
        alt={info.name || "icon"}
        width={size}
        height={size}
        className={`${className} object-contain transition-transform group-hover:scale-110`}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  // Format Lucide icon name: "external-link" -> "ExternalLink"
  const formattedName = (info.name || "Code")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  // @ts-expect-error dynamic lucide icon lookup
  const LucideComp = LucideIcons[formattedName] || LucideIcons.Code || LucideIcons.ExternalLink;

  return <LucideComp className={className} size={size} />;
}
