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
