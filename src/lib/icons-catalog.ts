export interface IconItem {
  id: string;
  name: string;
  category: "social" | "dev" | "cloud" | "tool" | "general" | "custom";
  type: "simple-icon" | "lucide" | "custom";
  slug: string;
  cdnUrl?: string;
  color?: string;
  isCustom?: boolean;
}

export const POPULAR_ICONS: IconItem[] = [
  // Social & Profiles
  { id: "github", name: "GitHub", category: "social", type: "simple-icon", slug: "github", cdnUrl: "https://cdn.simpleicons.org/github/ffffff", color: "#ffffff" },
  { id: "linkedin", name: "LinkedIn", category: "social", type: "simple-icon", slug: "linkedin", cdnUrl: "/icons/linkedin.svg", color: "#0A66C2" },
  { id: "x", name: "X (Twitter)", category: "social", type: "simple-icon", slug: "x", cdnUrl: "https://cdn.simpleicons.org/x/ffffff", color: "#ffffff" },
  { id: "twitter", name: "Twitter", category: "social", type: "simple-icon", slug: "twitter", cdnUrl: "https://cdn.simpleicons.org/twitter/1DA1F2", color: "#1DA1F2" },
  { id: "youtube", name: "YouTube", category: "social", type: "simple-icon", slug: "youtube", cdnUrl: "https://cdn.simpleicons.org/youtube/FF0000", color: "#FF0000" },
  { id: "twitch", name: "Twitch", category: "social", type: "simple-icon", slug: "twitch", cdnUrl: "https://cdn.simpleicons.org/twitch/9146FF", color: "#9146FF" },
  { id: "discord", name: "Discord", category: "social", type: "simple-icon", slug: "discord", cdnUrl: "https://cdn.simpleicons.org/discord/5865F2", color: "#5865F2" },
  { id: "telegram", name: "Telegram", category: "social", type: "simple-icon", slug: "telegram", cdnUrl: "https://cdn.simpleicons.org/telegram/26A5E4", color: "#26A5E4" },
  { id: "instagram", name: "Instagram", category: "social", type: "simple-icon", slug: "instagram", cdnUrl: "https://cdn.simpleicons.org/instagram/E4405F", color: "#E4405F" },
  { id: "mail", name: "Email / Mail", category: "social", type: "lucide", slug: "mail" },
  { id: "globe", name: "Web / Portfolio", category: "social", type: "lucide", slug: "globe" },

  // Programming Languages & Frameworks
  { id: "typescript", name: "TypeScript", category: "dev", type: "simple-icon", slug: "typescript", cdnUrl: "https://cdn.simpleicons.org/typescript/3178C6", color: "#3178C6" },
  { id: "javascript", name: "JavaScript", category: "dev", type: "simple-icon", slug: "javascript", cdnUrl: "https://cdn.simpleicons.org/javascript/F7DF1E", color: "#F7DF1E" },
  { id: "python", name: "Python", category: "dev", type: "simple-icon", slug: "python", cdnUrl: "https://cdn.simpleicons.org/python/3776AB", color: "#3776AB" },
  { id: "react", name: "React", category: "dev", type: "simple-icon", slug: "react", cdnUrl: "https://cdn.simpleicons.org/react/61DAFB", color: "#61DAFB" },
  { id: "nextdotjs", name: "Next.js", category: "dev", type: "simple-icon", slug: "nextdotjs", cdnUrl: "https://cdn.simpleicons.org/nextdotjs/ffffff", color: "#ffffff" },
  { id: "nodedotjs", name: "Node.js", category: "dev", type: "simple-icon", slug: "nodedotjs", cdnUrl: "https://cdn.simpleicons.org/nodedotjs/5FA04E", color: "#5FA04E" },
  { id: "vuedotjs", name: "Vue.js", category: "dev", type: "simple-icon", slug: "vuedotjs", cdnUrl: "https://cdn.simpleicons.org/vuedotjs/4FC08D", color: "#4FC08D" },
  { id: "tailwindcss", name: "Tailwind CSS", category: "dev", type: "simple-icon", slug: "tailwindcss", cdnUrl: "https://cdn.simpleicons.org/tailwindcss/06B6D4", color: "#06B6D4" },
  { id: "rust", name: "Rust", category: "dev", type: "simple-icon", slug: "rust", cdnUrl: "https://cdn.simpleicons.org/rust/ffffff", color: "#ffffff" },
  { id: "go", name: "Go (Golang)", category: "dev", type: "simple-icon", slug: "go", cdnUrl: "https://cdn.simpleicons.org/go/00ADD8", color: "#00ADD8" },
  { id: "cplusplus", name: "C++", category: "dev", type: "simple-icon", slug: "cplusplus", cdnUrl: "https://cdn.simpleicons.org/cplusplus/00599C", color: "#00599C" },
  { id: "php", name: "PHP", category: "dev", type: "simple-icon", slug: "php", cdnUrl: "https://cdn.simpleicons.org/php/777BB4", color: "#777BB4" },
  { id: "laravel", name: "Laravel", category: "dev", type: "simple-icon", slug: "laravel", cdnUrl: "https://cdn.simpleicons.org/laravel/FF2D20", color: "#FF2D20" },

  // DevOps & Cloud
  { id: "docker", name: "Docker", category: "cloud", type: "simple-icon", slug: "docker", cdnUrl: "https://cdn.simpleicons.org/docker/2496ED", color: "#2496ED" },
  { id: "portainer", name: "Portainer", category: "cloud", type: "simple-icon", slug: "portainer", cdnUrl: "https://cdn.simpleicons.org/portainer/13BEBB", color: "#13BEBB" },
  { id: "kubernetes", name: "Kubernetes", category: "cloud", type: "simple-icon", slug: "kubernetes", cdnUrl: "https://cdn.simpleicons.org/kubernetes/326CE5", color: "#326CE5" },
  { id: "linux", name: "Linux", category: "cloud", type: "simple-icon", slug: "linux", cdnUrl: "https://cdn.simpleicons.org/linux/FCC624", color: "#FCC624" },
  { id: "amazonaws", name: "AWS", category: "cloud", type: "simple-icon", slug: "amazonwebservices", cdnUrl: "https://cdn.simpleicons.org/amazonwebservices/232F3E", color: "#FF9900" },
  { id: "googlecloud", name: "Google Cloud", category: "cloud", type: "simple-icon", slug: "googlecloud", cdnUrl: "https://cdn.simpleicons.org/googlecloud/4285F4", color: "#4285F4" },
  { id: "cloudflare", name: "Cloudflare", category: "cloud", type: "simple-icon", slug: "cloudflare", cdnUrl: "https://cdn.simpleicons.org/cloudflare/F38020", color: "#F38020" },
  { id: "githubactions", name: "GitHub Actions", category: "cloud", type: "simple-icon", slug: "githubactions", cdnUrl: "https://cdn.simpleicons.org/githubactions/2088FF", color: "#2088FF" },
  { id: "nginx", name: "Nginx", category: "cloud", type: "simple-icon", slug: "nginx", cdnUrl: "https://cdn.simpleicons.org/nginx/009639", color: "#009639" },

  // Databases & Storage
  { id: "sqlite", name: "SQLite", category: "tool", type: "simple-icon", slug: "sqlite", cdnUrl: "https://cdn.simpleicons.org/sqlite/003B57", color: "#003B57" },
  { id: "postgresql", name: "PostgreSQL", category: "tool", type: "simple-icon", slug: "postgresql", cdnUrl: "https://cdn.simpleicons.org/postgresql/4169E1", color: "#4169E1" },
  { id: "mysql", name: "MySQL", category: "tool", type: "simple-icon", slug: "mysql", cdnUrl: "https://cdn.simpleicons.org/mysql/4479A1", color: "#4479A1" },
  { id: "redis", name: "Redis", category: "tool", type: "simple-icon", slug: "redis", cdnUrl: "https://cdn.simpleicons.org/redis/FF4438", color: "#FF4438" },
  { id: "mongodb", name: "MongoDB", category: "tool", type: "simple-icon", slug: "mongodb", cdnUrl: "https://cdn.simpleicons.org/mongodb/47A248", color: "#47A248" },

  // General & Lucide
  { id: "code", name: "Code", category: "general", type: "lucide", slug: "code" },
  { id: "terminal", name: "Terminal", category: "general", type: "lucide", slug: "terminal" },
  { id: "cpu", name: "CPU / Hardware", category: "general", type: "lucide", slug: "cpu" },
  { id: "server", name: "Server", category: "general", type: "lucide", slug: "server" },
  { id: "database", name: "Database", category: "general", type: "lucide", slug: "database" },
  { id: "shield", name: "Security / Shield", category: "general", type: "lucide", slug: "shield" },
  { id: "external-link", name: "External Link", category: "general", type: "lucide", slug: "external-link" },
];

export function getIconRenderer(iconNameOrSlug?: string): { url?: string; isLucide: boolean; name: string } {
  if (!iconNameOrSlug) {
    return { isLucide: true, name: "external-link" };
  }

  // If user entered direct URL or relative uploaded path (e.g. /uploads/...)
  if (
    iconNameOrSlug.startsWith("http://") ||
    iconNameOrSlug.startsWith("https://") ||
    iconNameOrSlug.startsWith("/")
  ) {
    return { url: iconNameOrSlug, isLucide: false, name: "icon" };
  }

  const found = POPULAR_ICONS.find(
    (i) => i.id.toLowerCase() === iconNameOrSlug.toLowerCase() || i.slug.toLowerCase() === iconNameOrSlug.toLowerCase()
  );

  if (found) {
    if (found.type === "simple-icon" && found.cdnUrl) {
      return { url: found.cdnUrl, isLucide: false, name: found.name };
    }
    return { isLucide: true, name: found.slug };
  }

  // Fallback to SimpleIcons CDN dynamic URL
  return {
    url: `https://cdn.simpleicons.org/${iconNameOrSlug}/ffffff`,
    isLucide: false,
    name: iconNameOrSlug,
  };
}
