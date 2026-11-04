import React from "react";
import { getPortfolioData } from "@/lib/portfolio-data";
import { PortfolioShell } from "@/components/PortfolioShell";
import { generatePersonSchema, generateWebSiteSchema, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const portfolioData = getPortfolioData();
  const siteUrl = getSiteUrl();
  const personJsonLd = generatePersonSchema(portfolioData.profile, siteUrl);
  const websiteJsonLd = generateWebSiteSchema(portfolioData.profile, siteUrl);

  return (
    <>
      {/* Structured SEO Data (Schema.org JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <PortfolioShell {...portfolioData} />
    </>
  );
}
