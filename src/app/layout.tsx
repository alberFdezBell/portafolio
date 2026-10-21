import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:1886";

export const viewport: Viewport = {
  themeColor: "#090d16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alberto Fernández Bellido | Senior Full-Stack Developer & Cloud Architect",
    template: "%s | Alberto Fernández Bellido",
  },
  description:
    "Portafolio profesional de Alberto Fernández Bellido. Ingeniero de software especializado en Next.js, Node.js, arquitecturas Docker y soluciones cloud.",
  keywords: [
    "Alberto Fernández Bellido",
    "Full-Stack Developer",
    "Ingeniero de Software",
    "Docker",
    "Portainer",
    "Next.js",
    "TypeScript",
    "DevOps",
    "Portafolio Desarrollador",
  ],
  authors: [{ name: "Alberto Fernández Bellido", url: siteUrl }],
  creator: "Alberto Fernández Bellido",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    title: "Alberto Fernández Bellido | Senior Full-Stack Developer",
    description:
      "Portafolio técnico de Alberto Fernández Bellido. Explora mi trayectoria, experiencia laboral, proyectos desplegados y arquitectura de sistemas.",
    siteName: "Alberto Fernández Bellido - Portafolio",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Alberto Fernández Bellido - Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alberto Fernández Bellido | Senior Full-Stack Developer",
    description:
      "Portafolio técnico de Alberto Fernández Bellido. Explora proyectos, experiencia y arquitectura cloud.",
    creator: "@alberFdezBell",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-[#090d16] text-slate-100 antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-emerald-500 text-black font-mono text-xs rounded-lg"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
