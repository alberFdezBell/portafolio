import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alberto Fernández Bellido | Portafolio Profesional",
    short_name: "AFB Dev",
    description:
      "Portafolio técnico de Alberto Fernández Bellido. Software engineering, Next.js, Node.js y arquitecturas cloud containerizadas.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#090d16",
    icons: [
      {
        src: "/afb.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/afb.webp",
        sizes: "512x512",
        type: "image/webp",
      },
    ],
  };
}
